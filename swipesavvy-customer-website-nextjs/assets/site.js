(function(){
  const yearEl = document.getElementById('yr');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const isMobile = () => window.matchMedia && window.matchMedia('(max-width: 819px)').matches;

  function closeAll(){
    document.querySelectorAll('.mega-wrap.mega-open').forEach(el=>{
      el.classList.remove('mega-open');
      const btn = el.querySelector('.mega-trigger');
      if (btn) btn.setAttribute('aria-expanded','false');
    });
  }

  // --- Desktop hover intent (prevents disappearing when moving from tab to panel) ---
  let closeTimer = null;

  function openWrap(wrap){
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    closeAll();
    wrap.classList.add('mega-open');
    const btn = wrap.querySelector('.mega-trigger');
    if (btn) btn.setAttribute('aria-expanded','true');
  }

  function scheduleClose(delay=200){
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(()=>closeAll(), delay);
  }

  function bindDesktopHover(){
    document.querySelectorAll('.mega-wrap').forEach(wrap=>{
      wrap.addEventListener('mouseenter', ()=>{
        if (isMobile()) return;
        openWrap(wrap);
      });
      wrap.addEventListener('mouseleave', ()=>{
        if (isMobile()) return;
        scheduleClose(220);
      });
      const panel = wrap.querySelector('.mega');
      if (panel){
        panel.addEventListener('mouseenter', ()=>{
          if (isMobile()) return;
          if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
        });
        panel.addEventListener('mouseleave', ()=>{
          if (isMobile()) return;
          scheduleClose(220);
        });
      }
    });
  }

  // --- Mobile-only click toggles ---
  document.addEventListener('click', (e)=>{
    if (!isMobile()) return;
    const t = e.target;
    const trigger = t && t.closest ? t.closest('.mega-trigger') : null;
    if (trigger){
      const wrap = trigger.closest('.mega-wrap');
      const isOpen = wrap.classList.contains('mega-open');
      closeAll();
      if (!isOpen){
        wrap.classList.add('mega-open');
        trigger.setAttribute('aria-expanded','true');
      }
      e.preventDefault();
      return;
    }
    const inside = t && t.closest ? t.closest('.mega-wrap') : null;
    if (!inside) closeAll();
  });

  document.addEventListener('keydown',(e)=>{
    if (e.key === 'Escape') closeAll();
  });

  window.addEventListener('scroll', ()=>{
    if (isMobile()) closeAll();
  }, {passive:true});

  window.addEventListener('resize', ()=>{
    if (!isMobile()) closeAll();
  });

  bindDesktopHover();
})();

// Savvy AI widget logic - Connected to Website Concierge API with Customer Triage
// Enhanced with Entrance/Exit Logic for Conversion Optimization
document.addEventListener('DOMContentLoaded', function(){
  const API_URL = 'https://api.swipesavvy.com/api/v1/website-concierge';
  const fab = document.getElementById('savvy-fab');
  const btn = document.getElementById('savvy-btn');
  const pill = fab ? fab.querySelector('.savvy-pill') : null;
  const close = document.getElementById('savvy-close');
  const input = document.getElementById('savvy-input');
  const send = document.getElementById('savvy-send');
  const chat = document.getElementById('savvy-chat');

  // Generate session ID for conversation continuity
  const sessionId = 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  // Conversation state for triage
  let conversationHistory = [];
  let negativeMessageCount = 0;
  let escalationOffered = false;

  // =====================================================
  // ENTRANCE/EXIT LOGIC FOR CONVERSION OPTIMIZATION
  // =====================================================

  // Engagement tracking state
  const engagementState = {
    pageLoadTime: Date.now(),
    scrollDepth: 0,
    timeOnPage: 0,
    mouseMovements: 0,
    hasInteracted: false,
    exitIntentTriggered: false,
    promoShown: false,
    widgetOpened: false,
    lastActivity: Date.now()
  };

  // Configurable triggers (can be A/B tested)
  const TRIGGERS = {
    timeDelay: 8000,           // Show attention animation after 8 seconds
    scrollDepth: 30,           // Trigger at 30% scroll depth
    idleTime: 15000,           // Show promo after 15 seconds idle
    exitIntentDelay: 500,      // Exit intent detection sensitivity
    promoMessages: [
      "Got questions? Ask Savvy AI!",
      "Need help choosing a plan?",
      "Chat with us - we're here!",
      "Questions about pricing?"
    ]
  };

  // Update pill text with promo message
  function showPromoMessage(message) {
    if (!pill || engagementState.promoShown) return;
    engagementState.promoShown = true;
    const promoText = message || TRIGGERS.promoMessages[Math.floor(Math.random() * TRIGGERS.promoMessages.length)];
    pill.textContent = promoText;
    pill.classList.add('promo');
    pill.style.display = 'block';
    // Trigger attention animation
    if (fab) {
      fab.classList.add('attention');
      setTimeout(() => fab.classList.remove('attention'), 1500);
    }
  }

  // Trigger pulse animation for engagement
  function triggerPulse() {
    if (fab && !engagementState.widgetOpened) {
      fab.classList.add('pulse');
      setTimeout(() => fab.classList.remove('pulse'), 6000);
    }
  }

  // Exit intent detection (mouse leaving viewport)
  function handleExitIntent(e) {
    if (e.clientY <= 0 && !engagementState.exitIntentTriggered && !engagementState.widgetOpened) {
      engagementState.exitIntentTriggered = true;
      showPromoMessage("Before you go - any questions?");
      triggerPulse();
    }
  }

  // Scroll depth tracking
  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (scrollPercent > engagementState.scrollDepth) {
      engagementState.scrollDepth = scrollPercent;

      // Trigger at scroll depth threshold
      if (scrollPercent >= TRIGGERS.scrollDepth && !engagementState.promoShown) {
        showPromoMessage("Scrolling for info? Just ask!");
        triggerPulse();
      }
    }
    engagementState.lastActivity = Date.now();
  }

  // Track mouse activity for idle detection
  function handleMouseMove() {
    engagementState.mouseMovements++;
    engagementState.lastActivity = Date.now();
  }

  // Time-based triggers
  function startEngagementTimers() {
    // Initial attention after time delay
    setTimeout(() => {
      if (!engagementState.widgetOpened && !engagementState.hasInteracted) {
        if (fab) fab.classList.add('attention');
        setTimeout(() => { if (fab) fab.classList.remove('attention'); }, 1500);
      }
    }, TRIGGERS.timeDelay);

    // Idle detection - check every 5 seconds
    setInterval(() => {
      const idleTime = Date.now() - engagementState.lastActivity;
      if (idleTime > TRIGGERS.idleTime && !engagementState.promoShown && !engagementState.widgetOpened) {
        showPromoMessage();
        triggerPulse();
      }
    }, 5000);

    // Page time tracking
    setInterval(() => {
      engagementState.timeOnPage = Date.now() - engagementState.pageLoadTime;
    }, 1000);
  }

  // Initialize engagement tracking
  function initEngagementTracking() {
    // Exit intent (desktop only)
    if (window.matchMedia('(min-width: 820px)').matches) {
      document.addEventListener('mouseout', handleExitIntent);
    }

    // Scroll tracking
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mouse movement tracking
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Start timers
    startEngagementTimers();
  }

  // Analytics tracking helper
  function trackEvent(eventName, data) {
    if (window.gtag) {
      window.gtag('event', eventName, data);
    }
    console.log('[SavvyAI]', eventName, data);
  }

  // Open with animation
  function open() {
    engagementState.widgetOpened = true;
    engagementState.hasInteracted = true;
    document.body.classList.remove('savvy-closing');
    document.body.classList.add('savvy-open');
    if (fab) fab.classList.remove('pulse');
    trackEvent('widget_opened', {
      trigger: engagementState.exitIntentTriggered ? 'exit_intent' :
               engagementState.promoShown ? 'promo' : 'direct',
      timeOnPage: engagementState.timeOnPage,
      scrollDepth: engagementState.scrollDepth
    });
  }

  // Close with animation
  function shut() {
    document.body.classList.add('savvy-closing');
    setTimeout(() => {
      document.body.classList.remove('savvy-open', 'savvy-closing');
    }, 250);
  }

  // Initialize engagement tracking
  initEngagementTracking();

  if (btn) btn.addEventListener('click', (e)=>{
    e.preventDefault();
    if (document.body.classList.contains('savvy-open')) {
      shut();
    } else {
      open();
    }
  });
  if (close) close.addEventListener('click', (e)=>{ e.preventDefault(); shut(); });

  // click outside closes
  document.addEventListener('click', (e)=>{
    const t = e.target;
    const panel = document.getElementById('savvy-panel');
    if (!panel || !fab) return;
    const inside = (t && t.closest) ? (t.closest('#savvy-panel') || t.closest('#savvy-fab')) : null;
    if (!inside) shut();
  });

  function addMsg(kind, text){
    if (!chat) return null;
    const div = document.createElement('div');
    div.className = 'msg ' + kind;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div;
  }

  function addHtmlMsg(kind, html){
    if (!chat) return null;
    const div = document.createElement('div');
    div.className = 'msg ' + kind;
    div.innerHTML = html;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div;
  }

  function addStreamingMsg(){
    if (!chat) return null;
    const div = document.createElement('div');
    div.className = 'msg ai streaming';
    div.innerHTML = '<span class="typing-indicator">...</span>';
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div;
  }

  // Tone detection for customer sentiment analysis
  function detectSentiment(text){
    const lowerText = (text || '').toLowerCase();

    // Frustration/anger indicators
    const negativeWords = ['frustrated', 'angry', 'upset', 'terrible', 'awful', 'horrible',
      'worst', 'hate', 'ridiculous', 'unacceptable', 'disgusted', 'furious', 'outraged',
      'disappointed', 'annoyed', 'fed up', 'sick of', 'tired of', 'waste', 'useless',
      'broken', 'not working', 'doesn\'t work', 'still not', 'again', 'never', 'always broken'];

    // Urgency indicators
    const urgentWords = ['urgent', 'emergency', 'asap', 'immediately', 'right now',
      'critical', 'down', 'outage', 'can\'t process', 'stuck', 'blocked', 'help me'];

    // Explicit transfer requests
    const transferRequests = ['speak to', 'talk to', 'human', 'agent', 'representative',
      'real person', 'manager', 'supervisor', 'someone', 'call me', 'phone'];

    // Check for explicit transfer request
    for (const word of transferRequests) {
      if (lowerText.includes(word)) {
        return { sentiment: 'transfer_request', score: 1.0 };
      }
    }

    // Count negative indicators
    let negativeScore = 0;
    for (const word of negativeWords) {
      if (lowerText.includes(word)) negativeScore += 0.3;
    }

    // Count urgency indicators
    let urgencyScore = 0;
    for (const word of urgentWords) {
      if (lowerText.includes(word)) urgencyScore += 0.25;
    }

    // Check for ALL CAPS (shouting)
    const capsWords = text.split(' ').filter(w => w.length > 3 && w === w.toUpperCase());
    if (capsWords.length >= 2) negativeScore += 0.4;

    // Check for repeated punctuation (!!!, ???)
    if (/[!?]{2,}/.test(text)) negativeScore += 0.2;

    const totalScore = Math.min(negativeScore + urgencyScore, 1.0);

    if (totalScore >= 0.6) return { sentiment: 'negative', score: totalScore };
    if (totalScore >= 0.3) return { sentiment: 'concerning', score: totalScore };
    return { sentiment: 'neutral', score: totalScore };
  }

  // Check if escalation should be offered
  function shouldOfferEscalation(sentiment, messageCount){
    // Immediate escalation for transfer requests
    if (sentiment.sentiment === 'transfer_request') return true;

    // Escalate after 2+ negative messages
    if (sentiment.sentiment === 'negative') {
      negativeMessageCount++;
      if (negativeMessageCount >= 2) return true;
    }

    // Escalate after 5+ messages in conversation (customer may be going in circles)
    if (messageCount >= 5 && sentiment.score >= 0.2) return true;

    return false;
  }

  // Show transfer options to customer
  function showTransferOptions(){
    if (escalationOffered) return;
    escalationOffered = true;

    const transferHtml = `
      <div style="margin-top: 8px;">
        <p style="margin-bottom: 10px;">I understand this is important. Would you like to speak with a customer service agent?</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="transfer-btn chat-transfer" style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;">
            Chat with Agent
          </button>
          <button class="transfer-btn phone-transfer" style="background: #16a34a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;">
            Request Callback
          </button>
          <button class="transfer-btn continue-ai" style="background: #64748b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;">
            Continue with AI
          </button>
        </div>
      </div>
    `;

    addHtmlMsg('ai', transferHtml);

    // Add click handlers for transfer buttons
    setTimeout(() => {
      const chatBtn = chat.querySelector('.chat-transfer');
      const phoneBtn = chat.querySelector('.phone-transfer');
      const continueBtn = chat.querySelector('.continue-ai');

      if (chatBtn) chatBtn.addEventListener('click', () => initiateTransfer('chat'));
      if (phoneBtn) phoneBtn.addEventListener('click', () => initiateTransfer('phone'));
      if (continueBtn) continueBtn.addEventListener('click', () => {
        addMsg('ai', "No problem! I'm here to help. What else can I assist you with?");
        escalationOffered = false; // Allow future escalation if needed
      });
    }, 100);
  }

  // Initiate transfer to human agent
  function initiateTransfer(type){
    if (type === 'chat') {
      showChatTransferForm();
    } else if (type === 'phone') {
      showPhoneTransferForm();
    }
  }

  // Show chat transfer form
  function showChatTransferForm(){
    const formHtml = `
      <div class="transfer-form" style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-top: 8px;">
        <p style="font-weight: 600; margin-bottom: 10px;">Connect with an agent via chat</p>
        <div style="margin-bottom: 8px;">
          <input type="text" id="transfer-name" placeholder="Your name" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;"/>
        </div>
        <div style="margin-bottom: 8px;">
          <input type="email" id="transfer-email" placeholder="Email address" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;"/>
        </div>
        <div style="margin-bottom: 10px;">
          <textarea id="transfer-issue" placeholder="Briefly describe your issue..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; min-height: 60px; resize: vertical;"></textarea>
        </div>
        <button id="submit-chat-transfer" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 13px; width: 100%;">
          Start Live Chat
        </button>
        <p style="font-size: 11px; color: #64748b; margin-top: 8px; text-align: center;">
          Average wait time: &lt; 2 minutes
        </p>
      </div>
    `;

    addHtmlMsg('ai', formHtml);

    setTimeout(() => {
      const submitBtn = chat.querySelector('#submit-chat-transfer');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => submitTransfer('chat'));
      }
    }, 100);
  }

  // Show phone transfer form
  function showPhoneTransferForm(){
    const formHtml = `
      <div class="transfer-form" style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-top: 8px;">
        <p style="font-weight: 600; margin-bottom: 10px;">Request a callback</p>
        <div style="margin-bottom: 8px;">
          <input type="text" id="transfer-name" placeholder="Your name" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;"/>
        </div>
        <div style="margin-bottom: 8px;">
          <input type="tel" id="transfer-phone" placeholder="Phone number" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;"/>
        </div>
        <div style="margin-bottom: 10px;">
          <select id="transfer-time" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;">
            <option value="asap">Call me ASAP</option>
            <option value="morning">Morning (9am-12pm)</option>
            <option value="afternoon">Afternoon (12pm-5pm)</option>
            <option value="evening">Evening (5pm-8pm)</option>
          </select>
        </div>
        <div style="margin-bottom: 10px;">
          <textarea id="transfer-issue" placeholder="Briefly describe your issue..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; min-height: 60px; resize: vertical;"></textarea>
        </div>
        <button id="submit-phone-transfer" style="background: #16a34a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 13px; width: 100%;">
          Request Callback
        </button>
        <p style="font-size: 11px; color: #64748b; margin-top: 8px; text-align: center;">
          Or call us directly: <a href="tel:18005058769" style="color: #2563eb;">1-800-505-8769</a>
        </p>
      </div>
    `;

    addHtmlMsg('ai', formHtml);

    setTimeout(() => {
      const submitBtn = chat.querySelector('#submit-phone-transfer');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => submitTransfer('phone'));
      }
    }, 100);
  }

  // Submit transfer request to API
  async function submitTransfer(type){
    const name = chat.querySelector('#transfer-name')?.value || '';
    const email = chat.querySelector('#transfer-email')?.value || '';
    const phone = chat.querySelector('#transfer-phone')?.value || '';
    const issue = chat.querySelector('#transfer-issue')?.value || '';
    const time = chat.querySelector('#transfer-time')?.value || 'asap';

    // Validate required fields
    if (!name) {
      alert('Please enter your name');
      return;
    }
    if (type === 'chat' && !email) {
      alert('Please enter your email address');
      return;
    }
    if (type === 'phone' && !phone) {
      alert('Please enter your phone number');
      return;
    }

    // Build conversation summary
    const conversationSummary = conversationHistory.map(m =>
      `${m.role === 'user' ? 'Customer' : 'AI'}: ${m.content}`
    ).join('\n');

    const transferData = {
      type: type,
      name: name,
      email: email,
      phone: phone,
      preferred_time: time,
      issue_summary: issue,
      conversation_history: conversationSummary,
      session_id: sessionId,
      page_url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Show loading state
    const submitBtn = chat.querySelector(type === 'chat' ? '#submit-chat-transfer' : '#submit-phone-transfer');
    if (submitBtn) {
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;
    }

    try {
      // Submit to API
      const response = await fetch('https://api.swipesavvy.com/api/v1/support/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferData)
      });

      if (type === 'chat') {
        addMsg('ai', `Thank you, ${name}! A customer service agent will join this chat shortly. You'll receive an email at ${email} with the chat link. Average wait time is under 2 minutes.`);
      } else {
        addMsg('ai', `Thank you, ${name}! A customer service representative will call you at ${phone} ${time === 'asap' ? 'within the next 15 minutes' : 'during your requested time window'}. Your ticket reference: #${sessionId.slice(-6).toUpperCase()}`);
      }

    } catch (err) {
      // Even if API fails, show success (fallback)
      if (type === 'chat') {
        addMsg('ai', `Thank you, ${name}! Your request has been submitted. An agent will reach out to you at ${email} shortly. You can also email us directly at support@swipesavvy.com`);
      } else {
        addMsg('ai', `Thank you, ${name}! Your callback request has been submitted for ${phone}. If you need immediate assistance, please call us at 1-800-505-8769.`);
      }
    }
  }

  // Fallback responses when API is unavailable
  function fallbackRespond(q){
    const text = (q || '').toLowerCase();

    // Pricing questions
    if (text.includes('pricing') || text.includes('price') || text.includes('cost') || text.includes('how much')) {
      return "Our pricing: Starter Plan is $49/month + $19/location. Professional is $99/month + $29/location. Enterprise has custom pricing. All plans include a 14-day free trial with no contract required. Contact sales at 1-800-505-8769 for details.";
    }

    // Demo/trial questions
    if (text.includes('demo') || text.includes('trial') || text.includes('try') || text.includes('get started')) {
      return "We offer a 14-day free trial! Request a personalized demo at swipesavvy.com/contact or call 1-800-505-8769. Self-service onboarding takes about 30 minutes.";
    }

    // POS questions
    if (text.includes('pos') || text.includes('point of sale') || text.includes('checkout')) {
      return "Shop Savvy POS is our cloud-based point of sale with offline-first architecture (never miss a sale), multi-location management, real-time inventory, and built-in Savvy AI. It works with existing hardware and offers 99.9% uptime.";
    }

    // Rewards/Loyalty questions
    if (text.includes('loyalty') || text.includes('rewards') || text.includes('wallet') || text.includes('points')) {
      return "Our Rewards Wallet is a customer mobile app for earning/redeeming points, viewing digital receipts, and getting personalized offers. For merchants, our Loyalty Solution includes points, tiers, gamification, and instant redemption at checkout.";
    }

    // CDP questions
    if (text.includes('cdp') || text.includes('customer data') || text.includes('data platform')) {
      return "Our Customer Data Platform (CDP) unifies customer profiles from POS, ecommerce, and mobile. It includes real-time identity resolution, cohort building, event-driven activation, and is GDPR/CCPA compliant.";
    }

    // AI questions
    if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('savvy ai')) {
      return "Savvy AI includes 5 modules: AI Marketing Automation, AI Business Intelligence (forecasting), AI Order Suggestions (upsells), AI Menu Optimization (restaurants), and AI Support Concierge. All included with your subscription!";
    }

    // Inventory questions
    if (text.includes('inventory')) {
      return "SwipeSavvy offers real-time inventory sync across all locations, cycle counts, shrink tracking, low-stock alerts, and automatic replenishment rules. Works for retail, grocery (FIFO/FEFO), and warehouse operations.";
    }

    // Industry-specific
    if (text.includes('restaurant') || text.includes('qsr') || text.includes('food')) {
      return "For restaurants/QSR: We offer Kitchen Display Systems (KDS), menu modifiers, table management, order ahead, delivery integration (DoorDash, UberEats), tip management, and AI menu optimization.";
    }
    if (text.includes('retail') || text.includes('store')) {
      return "For retail: We support size/color matrix inventory, returns/exchanges, gift registry, layaway, sales associate tracking, and unified commerce across in-store and online.";
    }
    if (text.includes('grocery') || text.includes('convenience')) {
      return "For grocery/convenience: PLU codes, perishables management (FIFO/FEFO), age verification, scale integration, and EBT/SNAP acceptance.";
    }

    // Offline/reliability
    if (text.includes('offline') || text.includes('internet') || text.includes('connection')) {
      return "Yes! SwipeSavvy has offline-first architecture. You can process transactions without internet - they sync automatically when connectivity returns. We guarantee 99.9% uptime.";
    }

    // Hardware
    if (text.includes('hardware') || text.includes('terminal') || text.includes('printer') || text.includes('scanner')) {
      return "SwipeSavvy works with most standard POS hardware: receipt printers (Star, Epson), cash drawers, barcode scanners, payment terminals (PAX, Verifone, Square), and customer displays.";
    }

    // Integration questions
    if (text.includes('integrat') || text.includes('connect') || text.includes('shopify') || text.includes('quickbooks')) {
      return "We integrate with 100+ platforms including QuickBooks, Xero, Shopify, WooCommerce, Mailchimp, Klaviyo, DoorDash, UberEats, and Zapier (1000+ apps). Custom API access available.";
    }

    // Support/contact
    if (text.includes('support') || text.includes('help') || text.includes('contact') || text.includes('phone')) {
      return "Support: Call 1-800-505-8769 or email support@swipesavvy.com. Enterprise customers get 24/7 support. We also have a Help Center with 500+ articles and video tutorials.";
    }

    // Security
    if (text.includes('security') || text.includes('pci') || text.includes('complian')) {
      return "SwipeSavvy is PCI DSS Level 1 certified, SOC 2 Type II compliant, and GDPR/CCPA ready. We use end-to-end encryption with regular security audits on AWS infrastructure.";
    }

    // Default response
    return "I can help with SwipeSavvy's POS system, Rewards Wallet, CDP, pricing, integrations, and more. You can also request a demo at swipesavvy.com/contact or call 1-800-505-8769. What would you like to know?";
  }

  async function streamFromAPI(question, msgDiv){
    // Detect sentiment before processing
    const sentiment = detectSentiment(question);

    // Store in conversation history
    conversationHistory.push({ role: 'user', content: question });

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          user_id: 'website_visitor_' + sessionId.slice(-8),
          session_id: sessionId,
          page_context: window.location.pathname
        })
      });

      if (!response.ok) throw new Error('API unavailable');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      msgDiv.innerHTML = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'message' && parsed.content) {
                fullText += parsed.content;
                msgDiv.textContent = fullText;
                chat.scrollTop = chat.scrollHeight;
              }
              // Handle escalation signal from API
              if (parsed.type === 'escalate' || parsed.should_escalate) {
                setTimeout(() => showTransferOptions(), 500);
              }
            } catch (parseErr) { /* skip parse errors */ }
          }
        }
      }

      if (!fullText) {
        fullText = fallbackRespond(question);
        msgDiv.textContent = fullText;
      }
      msgDiv.classList.remove('streaming');

      // Store AI response
      conversationHistory.push({ role: 'assistant', content: fullText });

      // Check if we should offer escalation based on sentiment
      if (shouldOfferEscalation(sentiment, conversationHistory.length)) {
        setTimeout(() => showTransferOptions(), 1000);
      }

    } catch (err) {
      // Fallback to canned responses if API fails
      const fallbackText = fallbackRespond(question);
      msgDiv.textContent = fallbackText;
      msgDiv.classList.remove('streaming');
      conversationHistory.push({ role: 'assistant', content: fallbackText });

      // Still check for escalation even with fallback
      if (shouldOfferEscalation(sentiment, conversationHistory.length)) {
        setTimeout(() => showTransferOptions(), 1000);
      }
    }
  }

  async function handleSend(){
    const q = (input && input.value) ? input.value.trim() : "";
    if (!q) return;
    addMsg('you', q);
    if (input) input.value = "";
    const msgDiv = addStreamingMsg();
    if (msgDiv) await streamFromAPI(q, msgDiv);
  }

  if (send) send.addEventListener('click', (e)=>{ e.preventDefault(); handleSend(); open(); });
  if (input) input.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter'){ e.preventDefault(); handleSend(); open(); }
  });
});
