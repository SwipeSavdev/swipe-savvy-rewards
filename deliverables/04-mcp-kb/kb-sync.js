/**
 * Swipe Savvy Platform - KB Sync Script
 *
 * Crawl the SwipeSavvy monorepo workspace and generate KB indexes + snapshots.
 *
 * Usage:
 *   node kb-sync.js --config ./kb-config.json
 *
 * Output:
 *   - generated/index.md - Root KB index
 *   - generated/projects/SWIPE_SAVVY/snapshot-index.md - Project snapshot
 *   - generated/projects/SWIPE_SAVVY/api-index.md - API endpoints index
 *   - generated/projects/SWIPE_SAVVY/components.md - Component inventory
 */

const fs = require("fs");
const path = require("path");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function walk(dir, excludePatterns = []) {
  const out = [];

  function shouldExclude(filePath) {
    return excludePatterns.some((pattern) => {
      const regex = new RegExp(pattern.replace(/\*/g, ".*"));
      return regex.test(filePath);
    });
  }

  function walkDir(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(currentDir, e.name);

        if (shouldExclude(full)) continue;

        if (e.isDirectory()) {
          walkDir(full);
        } else {
          out.push(full);
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
  }

  walkDir(dir);
  return out;
}

function isMatchAny(filePath, patterns) {
  const lower = filePath.toLowerCase();
  return patterns.some((p) => {
    const pl = p.toLowerCase();
    if (pl.startsWith("**/") && pl.endsWith("/**/*")) {
      const token = pl.slice(3, -5);
      return lower.includes(token);
    }
    if (pl.includes("*")) {
      const token = pl.replace(/\*/g, "");
      return lower.includes(token);
    }
    return lower.endsWith(pl) || lower.includes(pl.replace("**/", ""));
  });
}

function writeFile(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, "utf8");
}

function rel(from, to) {
  return path.relative(from, to).split(path.sep).join("/");
}

function extractPackageInfo(packageJsonPath) {
  try {
    const pkg = readJson(packageJsonPath);
    return {
      name: pkg.name,
      version: pkg.version,
      dependencies: Object.keys(pkg.dependencies || {}),
      devDependencies: Object.keys(pkg.devDependencies || {}),
      scripts: Object.keys(pkg.scripts || {}),
    };
  } catch {
    return null;
  }
}

function extractRequirements(requirementsPath) {
  try {
    const content = fs.readFileSync(requirementsPath, "utf8");
    return content
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"))
      .map((line) => line.split("==")[0].split(">=")[0].trim());
  } catch {
    return [];
  }
}

function generateApiIndex(projFiles, workspaceRoot) {
  const apiFiles = projFiles.filter(
    (f) =>
      f.includes("routes") ||
      f.includes("api") ||
      f.includes("openapi") ||
      f.includes("endpoints")
  );

  const lines = [];
  lines.push("# API Index");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## API Files");
  lines.push("");

  for (const f of apiFiles.sort()) {
    lines.push(`- ${rel(workspaceRoot, f)}`);
  }

  lines.push("");
  lines.push("## Known Endpoints (from swipesavvy-ai-agents)");
  lines.push("");
  lines.push("### Authentication (`/api/v1/auth/`)");
  lines.push("- `POST /auth/request-otp` - Request OTP via email");
  lines.push("- `POST /auth/verify-otp` - Verify OTP and get JWT");
  lines.push("- `POST /auth/refresh` - Refresh access token");
  lines.push("");
  lines.push("### Wallet (`/api/v1/wallet/`)");
  lines.push("- `GET /wallet/balance` - Get wallet balance");
  lines.push("- `GET /wallet/transactions` - List transactions");
  lines.push("- `POST /wallet/deposit` - Deposit funds");
  lines.push("- `POST /wallet/withdraw` - Withdraw funds");
  lines.push("- `POST /wallet/transfer` - Transfer to user");
  lines.push("");
  lines.push("### Rewards (`/api/v1/rewards/`)");
  lines.push("- `GET /rewards/points` - Get points balance");
  lines.push("- `GET /rewards/boosts` - Get available boosts");
  lines.push("- `POST /rewards/boosts/{id}/activate` - Activate boost");
  lines.push("- `GET /rewards/leaderboard` - Get leaderboard");
  lines.push("");
  lines.push("### Admin (`/api/v1/admin/`)");
  lines.push("- `GET /admin/users` - List users");
  lines.push("- `GET /admin/merchants` - List merchants");
  lines.push("- `GET /admin/roles` - List RBAC roles");
  lines.push("- `GET /admin/analytics` - Dashboard analytics");

  return lines.join("\n");
}

function generateComponentsIndex(project, workspaceRoot) {
  const lines = [];
  lines.push("# Component Inventory");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Components");
  lines.push("");
  lines.push("| Component | Path | Type | Technologies |");
  lines.push("|-----------|------|------|--------------|");

  for (const comp of project.components || []) {
    const tech = (comp.tech || []).join(", ");
    lines.push(`| ${comp.name} | ${comp.path} | ${comp.type} | ${tech} |`);
  }

  lines.push("");
  lines.push("## Infrastructure");
  lines.push("");
  lines.push("| Resource | Value |");
  lines.push("|----------|-------|");
  lines.push("| Server | 54.224.8.14 (EC2 t3.large) |");
  lines.push("| Database | PostgreSQL (RDS) |");
  lines.push("| Process Manager | PM2 |");
  lines.push("| Email | AWS SES |");
  lines.push("| Region | us-east-1 |");

  return lines.join("\n");
}

function main() {
  const args = process.argv.slice(2);
  const configArgIndex = args.indexOf("--config");
  if (configArgIndex === -1) {
    console.error("Missing --config");
    process.exit(1);
  }
  const configPath = args[configArgIndex + 1];
  const config = readJson(configPath);

  const workspaceRoot = path.resolve(process.cwd(), config.workspaceRoot || ".");
  const outputDir = path.resolve(process.cwd(), config.outputDir || "mcp-kb/generated");
  ensureDir(outputDir);

  console.log(`KB Sync starting...`);
  console.log(`Workspace: ${workspaceRoot}`);
  console.log(`Output: ${outputDir}`);

  const allFiles = walk(workspaceRoot, config.excludePatterns || []);
  console.log(`Found ${allFiles.length} files in workspace`);

  const projectReports = [];

  for (const proj of config.projects || []) {
    const projOutDir = path.join(outputDir, "projects", proj.name);
    ensureDir(projOutDir);

    // Filter files for this project
    const repoTokens = (proj.repoGlobs || []).map((g) =>
      g.replace(/\*/g, "").toLowerCase()
    );
    const projFiles = allFiles.filter((f) =>
      repoTokens.some((t) => f.toLowerCase().includes(t))
    );

    const included = projFiles.filter((f) =>
      isMatchAny(f, config.includePatterns || [])
    );

    console.log(`Project ${proj.name}: ${included.length} matching files`);

    // Generate main snapshot index
    const snapshotLines = [];
    snapshotLines.push(`# KB Snapshot – ${proj.name}`);
    snapshotLines.push("");
    snapshotLines.push(`**Description:** ${proj.description || "N/A"}`);
    snapshotLines.push(`**Generated:** ${new Date().toISOString()}`);
    snapshotLines.push("");
    snapshotLines.push("## Included Files");
    snapshotLines.push("");

    // Group files by type
    const docFiles = included.filter(
      (f) => f.endsWith(".md") || f.includes("docs/")
    );
    const configFiles = included.filter(
      (f) =>
        f.endsWith(".json") ||
        f.endsWith(".yml") ||
        f.endsWith(".yaml") ||
        f.endsWith(".ini")
    );
    const schemaFiles = included.filter(
      (f) => f.includes("schema") || f.includes("openapi")
    );
    const migrationFiles = included.filter((f) => f.includes("migration"));

    snapshotLines.push("### Documentation");
    for (const f of docFiles.sort()) {
      snapshotLines.push(`- ${rel(workspaceRoot, f)}`);
    }

    snapshotLines.push("");
    snapshotLines.push("### Configuration");
    for (const f of configFiles.sort()) {
      snapshotLines.push(`- ${rel(workspaceRoot, f)}`);
    }

    snapshotLines.push("");
    snapshotLines.push("### Schemas & APIs");
    for (const f of schemaFiles.sort()) {
      snapshotLines.push(`- ${rel(workspaceRoot, f)}`);
    }

    if (migrationFiles.length > 0) {
      snapshotLines.push("");
      snapshotLines.push("### Migrations");
      for (const f of migrationFiles.sort()) {
        snapshotLines.push(`- ${rel(workspaceRoot, f)}`);
      }
    }

    writeFile(
      path.join(projOutDir, "snapshot-index.md"),
      snapshotLines.join("\n")
    );

    // Generate API index
    const apiIndex = generateApiIndex(projFiles, workspaceRoot);
    writeFile(path.join(projOutDir, "api-index.md"), apiIndex);

    // Generate components index
    const componentsIndex = generateComponentsIndex(proj, workspaceRoot);
    writeFile(path.join(projOutDir, "components.md"), componentsIndex);

    projectReports.push({
      name: proj.name,
      description: proj.description,
      count: included.length,
      components: (proj.components || []).length,
    });
  }

  // Generate root index
  const rootIndex = [];
  rootIndex.push("# MCP KB – Swipe Savvy Platform");
  rootIndex.push("");
  rootIndex.push(`**Generated:** ${new Date().toISOString()}`);
  rootIndex.push("");
  rootIndex.push("## Projects");
  rootIndex.push("");
  rootIndex.push("| Project | Description | Files | Components |");
  rootIndex.push("|---------|-------------|-------|------------|");

  for (const r of projectReports) {
    rootIndex.push(
      `| [${r.name}](projects/${r.name}/snapshot-index.md) | ${r.description || "-"} | ${r.count} | ${r.components} |`
    );
  }

  rootIndex.push("");
  rootIndex.push("## Quick Links");
  rootIndex.push("");
  rootIndex.push("- [API Index](projects/SWIPE_SAVVY/api-index.md)");
  rootIndex.push("- [Component Inventory](projects/SWIPE_SAVVY/components.md)");
  rootIndex.push("- [Snapshot Index](projects/SWIPE_SAVVY/snapshot-index.md)");

  rootIndex.push("");
  rootIndex.push("## Environment");
  rootIndex.push("");
  rootIndex.push("| Resource | Value |");
  rootIndex.push("|----------|-------|");
  rootIndex.push("| Production Server | 54.224.8.14 |");
  rootIndex.push("| API URL | http://54.224.8.14:8000 |");
  rootIndex.push("| Admin Portal | http://54.224.8.14:3000 |");
  rootIndex.push("| Wallet Web | http://54.224.8.14:3001 |");

  writeFile(path.join(outputDir, "index.md"), rootIndex.join("\n"));

  console.log("");
  console.log("KB sync complete!");
  console.log(`Output directory: ${outputDir}`);
  console.log("Generated files:");
  console.log("  - index.md");
  for (const r of projectReports) {
    console.log(`  - projects/${r.name}/snapshot-index.md`);
    console.log(`  - projects/${r.name}/api-index.md`);
    console.log(`  - projects/${r.name}/components.md`);
  }
}

main();
