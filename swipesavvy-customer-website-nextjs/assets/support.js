(function(){
  const $ = (id)=>document.getElementById(id);

  // ---- Configure your MCP search endpoint here ----
  // If you have an MCP server proxy endpoint, set:
  //   window.SAVVY_MCP_SEARCH_ENDPOINT = "https://your-domain.com/api/mcp/search"
  // This static site will POST { query, scope, topK } and expects:
  //   { results: [{ title, snippet, url, source, tags, score }] }
  const endpoint = window.SAVVY_MCP_SEARCH_ENDPOINT || null;

  // ---- Mock corpus (fallback for local preview) ----
  const mock = [
    {
      title: "Refunds & Exchanges — Audit Trails",
      snippet: "How refunds, exchanges, and voids work with role-based permissions and complete audit logs.",
      url: "solutions/omnichannel-pos.html",
      source: "Swipe Savvy POS",
      tags: ["refunds","audit","permissions"],
      score: 0.92,
    },
    {
      title: "Offline-First Checkout",
      snippet: "What happens when internet drops: queued sync, device behavior, and recovery steps.",
      url: "solutions/omnichannel-pos.html",
      source: "Swipe Savvy POS",
      tags: ["offline","checkout","sync"],
      score: 0.88,
    },
    {
      title: "Inventory: Cycle Counts, Shrink, and Replenishment Rules",
      snippet: "Ledger-based inventory accuracy with cycle counts, shrink tracking, and automated low-stock alerts.",
      url: "solutions/omnichannel-pos.html",
      source: "Inventory",
      tags: ["inventory","cycle count","shrink","alerts"],
      score: 0.86,
    },
    {
      title: "BOPIS + Curbside Fulfillment",
      snippet: "Enable Buy Online, Pick Up In Store (BOPIS) and curbside workflows with real-time status updates.",
      url: "solutions/omnichannel-pos.html",
      source: "Omni-Channel",
      tags: ["bopis","fulfillment","curbside"],
      score: 0.84,
    },
    {
      title: "Dejavoo Terminal + Device Integration",
      snippet: "Terminal provisioning, monitoring, and device diagnostics for scanners, printers, and cash drawers.",
      url: "solutions/omnichannel-pos.html",
      source: "Devices",
      tags: ["dejavoo","terminals","printers","scanners"],
      score: 0.82,
    },
    {
      title: "Savvy AI — Marketing on Auto-Pilot",
      snippet: "Automatically identifies segments and launches personalized SMS/email/in-app campaigns with continuous optimization.",
      url: "solutions/omnichannel-pos.html",
      source: "Savvy AI",
      tags: ["ai","marketing","segments"],
      score: 0.80,
    },
  ];

  function normalize(s){ return (s||"").toLowerCase().trim(); }

  function localSearch(q, scope){
    const nq = normalize(q);
    const tokens = nq.split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    let pool = mock;
    if (scope !== "all"){
      pool = mock.filter(r => (r.source||"").toLowerCase().includes(scope));
    }
    const scored = pool.map(r=>{
      const hay = normalize(r.title + " " + r.snippet + " " + (r.tags||[]).join(" "));
      let score = 0;
      tokens.forEach(t=>{
        if (hay.includes(t)) score += 1;
      });
      return { ...r, score: Math.max(r.score || 0, score / Math.max(tokens.length,1)) };
    }).filter(r=>r.score > 0);
    return scored.sort((a,b)=>b.score-a.score).slice(0, 10);
  }

  async function mcpSearch(q, scope){
    if (!endpoint){
      return { results: localSearch(q, scope), used: "mock" };
    }
    const body = { query: q, scope, topK: 10 };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return { results: (json.results || []), used: "mcp" };
  }

  function renderResults(items){
    const wrap = $("support-results");
    if (!wrap) return;
    if (!items.length){
      wrap.innerHTML = "<div class='result'><div class='title'>No results</div><div class='snippet'>Try different keywords like <b>refund</b>, <b>inventory</b>, <b>BOPIS</b>, <b>offline</b>, or <b>Dejavoo</b>.</div></div>";
      return;
    }
    wrap.innerHTML = items.map((r)=>{
      const tags = (r.tags||[]).slice(0,6).map(t=>`<span class="badge green">${t}</span>`).join(" ");
      const src = r.source ? `<span class="badge yellow">${r.source}</span>` : "";
      const score = (typeof r.score === "number") ? `${Math.round(r.score*100)}%` : "";
      const meta = `<div class="meta">${src} ${score ? `<span class="badge">Relevance ${score}</span>` : ""} ${tags}</div>`;
      const url = r.url || "#";
      return `
        <div class="result">
          <div class="top">
            <div>
              <div class="title">${r.title || "Untitled"}</div>
              <div class="snippet">${r.snippet || ""}</div>
              ${meta}
              <a class="open" href="${url}">Open</a>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  function digest(items, q){
    const box = $("support-digest");
    if (!box) return;
    if (!items.length){
      box.innerHTML = "<b>Savvy AI Digest</b><p>Ask a question to generate a digest.</p>";
      return;
    }
    const top = items.slice(0, 3);
    const bullets = top.map(r=>`<li><b>${r.title}</b> — ${r.snippet || ""}</li>`).join("");
    box.innerHTML = `
      <b>Savvy AI Digest</b>
      <p>Based on your search for <b>“${q}”</b>, here are the most relevant help items:</p>
      <ul>${bullets}</ul>
      <p>Tip: refine with keywords like <b>refund</b>, <b>inventory</b>, <b>reporting</b>, <b>devices</b>, <b>offline</b>, <b>BOPIS</b>.</p>
    `;
  }

  async function run(){
    const q = ($("support-q")?.value || "").trim();
    const scope = $("support-scope")?.value || "all";
    const meta = $("support-meta");
    if (!q){
      if (meta) meta.textContent = "Type a question to search the knowledge base.";
      renderResults([]);
      digest([], "");
      return;
    }
    if (meta) meta.textContent = "Searching…";
    try{
      const { results, used } = await mcpSearch(q, scope);
      if (meta) meta.textContent = `Showing ${results.length} results (${used === "mcp" ? "MCP server" : "local preview"}).`;
      renderResults(results);
      digest(results, q);
    }catch(err){
      if (meta) meta.textContent = "Search failed. Configure MCP endpoint or try again.";
      renderResults([]);
      digest([], q);
    }
  }

  // Bind
  const btn = $("support-search");
  const q = $("support-q");
  const scope = $("support-scope");
  if (btn) btn.addEventListener("click", (e)=>{ e.preventDefault(); run(); });
  if (q) q.addEventListener("keydown", (e)=>{ if (e.key === "Enter"){ e.preventDefault(); run(); }});
  if (scope) scope.addEventListener("change", ()=>{ if (($("support-q")?.value || "").trim()) run(); });

  // initial state
  digest([], "");
})();