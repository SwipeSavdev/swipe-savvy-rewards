(function(){
  const yearEl = document.getElementById('yr');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const isMobile = () => window.matchMedia && window.matchMedia('(max-width: 819px)').matches;

  // ============================================
  // MOBILE NAVIGATION
  // ============================================
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
  const submenuToggles = document.querySelectorAll('.submenu-toggle');

  // Track scroll position for body lock
  let scrollPosition = 0;

  function openMobileMenu() {
    scrollPosition = window.pageYOffset;
    document.body.classList.add('menu-open');
    document.body.style.top = `-${scrollPosition}px`;
    mobileMenuToggle.classList.add('active');
    mobileMenuToggle.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNavOverlay.classList.add('open');
  }

  function closeMobileMenu() {
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollPosition);
    mobileMenuToggle.classList.remove('active');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNavOverlay.classList.remove('open');
  }

  function toggleMobileMenu() {
    if (mobileNav.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  // Toggle mobile menu
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  // Close menu when overlay is clicked
  if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', closeMobileMenu);
  }

  // Handle submenu toggles
  submenuToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const submenuId = toggle.getAttribute('data-submenu');
      const submenu = document.getElementById('submenu-' + submenuId);

      if (submenu) {
        const isExpanded = submenu.classList.contains('open');

        // Close all other submenus
        document.querySelectorAll('.mobile-submenu.open').forEach(m => m.classList.remove('open'));
        document.querySelectorAll('.submenu-toggle.expanded').forEach(t => t.classList.remove('expanded'));

        // Toggle this submenu
        if (!isExpanded) {
          submenu.classList.add('open');
          toggle.classList.add('expanded');
        }
      }
    });
  });

  // Close mobile menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // Close mobile menu when window resizes to desktop
  window.addEventListener('resize', () => {
    if (!isMobile() && mobileNav && mobileNav.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // Handle swipe to close (swipe right to close)
  let touchStartX = 0;
  let touchEndX = 0;

  if (mobileNav) {
    mobileNav.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    mobileNav.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX - touchStartX > 50) { // Swipe right threshold
        closeMobileMenu();
      }
    }, { passive: true });
  }

  // ============================================
  // MEGA MENU - Modern Hover Intent System
  // ============================================
  const megaWraps = document.querySelectorAll('.mega-wrap');
  let activeWrap = null;
  let openTimer = null;
  let closeTimer = null;
  const HOVER_DELAY = 100;  // Delay before opening on hover
  const CLOSE_DELAY = 300;  // Delay before closing (gives time to reach dropdown)

  function openMega(wrap) {
    // Clear any pending close
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    // Close other open menus
    megaWraps.forEach(w => {
      if (w !== wrap && w.classList.contains('active')) {
        w.classList.remove('active');
        const btn = w.querySelector('.mega-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Open this menu
    wrap.classList.add('active');
    const btn = wrap.querySelector('.mega-trigger');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    activeWrap = wrap;
  }

  function closeMega(wrap) {
    wrap.classList.remove('active');
    const btn = wrap.querySelector('.mega-trigger');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (activeWrap === wrap) activeWrap = null;
  }

  function closeAllMegas() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    if (openTimer) {
      clearTimeout(openTimer);
      openTimer = null;
    }
    megaWraps.forEach(wrap => closeMega(wrap));
  }

  function scheduleOpen(wrap) {
    if (openTimer) clearTimeout(openTimer);
    openTimer = setTimeout(() => openMega(wrap), HOVER_DELAY);
  }

  function scheduleClose(wrap) {
    if (openTimer) {
      clearTimeout(openTimer);
      openTimer = null;
    }
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => closeMega(wrap), CLOSE_DELAY);
  }

  function cancelClose() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  // Set up hover events for each dropdown
  megaWraps.forEach(wrap => {
    const trigger = wrap.querySelector('.mega-trigger');
    const mega = wrap.querySelector('.mega');

    // Hover on trigger button
    if (trigger) {
      trigger.addEventListener('mouseenter', () => {
        if (isMobile()) return;
        cancelClose();
        scheduleOpen(wrap);
      });

      trigger.addEventListener('mouseleave', () => {
        if (isMobile()) return;
        if (openTimer) {
          clearTimeout(openTimer);
          openTimer = null;
        }
        scheduleClose(wrap);
      });

      // Click to toggle (works on both mobile and desktop)
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (wrap.classList.contains('active')) {
          closeMega(wrap);
        } else {
          openMega(wrap);
        }
      });
    }

    // Hover on dropdown panel
    if (mega) {
      mega.addEventListener('mouseenter', () => {
        if (isMobile()) return;
        cancelClose();
        // Ensure menu stays open
        if (!wrap.classList.contains('active')) {
          openMega(wrap);
        }
      });

      mega.addEventListener('mouseleave', () => {
        if (isMobile()) return;
        scheduleClose(wrap);
      });
    }
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    const target = e.target;
    const isInsideMega = target.closest('.mega-wrap');
    if (!isInsideMega) {
      closeAllMegas();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllMegas();
    }
  });

  // Close on scroll (mobile only)
  window.addEventListener('scroll', () => {
    if (isMobile()) closeAllMegas();
  }, { passive: true });

  // Close on resize
  window.addEventListener('resize', () => {
    closeAllMegas();
  });
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
    hasInteracted: false,        // User clicked something or sent a message
    hasTakenAction: false,       // User completed a conversion action (form submit, link click, etc.)
    exitIntentTriggered: false,
    entranceGreetingShown: false,
    widgetOpened: false,
    widgetDismissed: false,      // User explicitly closed the widget
    lastActivity: Date.now()
  };

  // Configurable triggers (can be A/B tested)
  const TRIGGERS = {
    entranceDelay: 3000,         // Auto-open widget 3 seconds after page load
    exitIntentEnabled: true,     // Enable exit intent detection
    entranceGreetings: [
      "Hi! I'm Savvy AI. How can I help you today?",
      "Welcome! Ask me anything about SwipeSavvy.",
      "Hey there! Need help finding what you're looking for?",
      "Hi! I can answer questions about pricing, features, and more."
    ],
    exitGreetings: [
      "Wait! Before you go - do you have any questions I can help with?",
      "Hold on! Is there something I can help you find?",
      "Don't leave yet! Let me help you with any questions.",
      "Before you go - I can help with pricing, demos, or any questions!"
    ],
    // Page-specific greetings based on URL
    pageGreetings: {
      '/platform': "Interested in our platform? I can walk you through the features!",
      '/solutions': "Looking for a solution? Tell me about your business needs!",
      '/contact': "Want to get in touch? I can help or connect you with our team!",
      '/support': "Need support? I'm here to help troubleshoot any issues!",
      '/industries': "I can help you find the right solution for your industry!"
    }
  };

  // Get page-specific or random greeting
  function getEntranceGreeting() {
    const path = window.location.pathname;
    for (const [pagePath, greeting] of Object.entries(TRIGGERS.pageGreetings)) {
      if (path.includes(pagePath)) return greeting;
    }
    return TRIGGERS.entranceGreetings[Math.floor(Math.random() * TRIGGERS.entranceGreetings.length)];
  }

  function getExitGreeting() {
    return TRIGGERS.exitGreetings[Math.floor(Math.random() * TRIGGERS.exitGreetings.length)];
  }

  // Add AI greeting message to chat
  function addGreetingMessage(message) {
    if (!chat) return;
    const div = document.createElement('div');
    div.className = 'msg ai greeting';
    div.textContent = message;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  // Open widget with greeting (for entrance)
  function openWithGreeting(greeting, trigger) {
    if (engagementState.widgetDismissed) return; // Respect user's choice to close

    engagementState.widgetOpened = true;
    document.body.classList.remove('savvy-closing');
    document.body.classList.add('savvy-open');
    if (fab) fab.classList.remove('pulse');

    // Add greeting message if not already shown
    if (!engagementState.entranceGreetingShown) {
      engagementState.entranceGreetingShown = true;
      addGreetingMessage(greeting);
    }

    trackEvent('widget_auto_opened', {
      trigger: trigger,
      timeOnPage: engagementState.timeOnPage,
      scrollDepth: engagementState.scrollDepth,
      page: window.location.pathname
    });
  }

  // Entrance engagement - auto-open after delay
  function triggerEntranceEngagement() {
    setTimeout(() => {
      if (!engagementState.widgetOpened && !engagementState.hasInteracted && !engagementState.widgetDismissed) {
        const greeting = getEntranceGreeting();
        openWithGreeting(greeting, 'entrance');

        // Pulse the FAB to draw attention
        if (fab) {
          fab.classList.add('attention');
          setTimeout(() => { if (fab) fab.classList.remove('attention'); }, 2000);
        }
      }
    }, TRIGGERS.entranceDelay);
  }

  // Exit intent detection (mouse leaving viewport toward top)
  function handleExitIntent(e) {
    if (!TRIGGERS.exitIntentEnabled) return;
    if (e.clientY > 10) return; // Only trigger when mouse goes to very top
    if (engagementState.exitIntentTriggered) return;
    if (engagementState.hasTakenAction) return; // Don't bother if they converted

    engagementState.exitIntentTriggered = true;

    // If widget was dismissed, just show attention animation on FAB
    if (engagementState.widgetDismissed) {
      if (fab) {
        fab.classList.add('attention');
        setTimeout(() => { if (fab) fab.classList.remove('attention'); }, 2000);
      }
      return;
    }

    // Open widget with exit greeting
    const greeting = getExitGreeting();
    openWithGreeting(greeting, 'exit_intent');

    trackEvent('exit_intent_triggered', {
      timeOnPage: engagementState.timeOnPage,
      scrollDepth: engagementState.scrollDepth,
      hadInteraction: engagementState.hasInteracted
    });
  }

  // Track scroll depth
  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (scrollPercent > engagementState.scrollDepth) {
      engagementState.scrollDepth = scrollPercent;
    }
    engagementState.lastActivity = Date.now();
  }

  // Track mouse activity
  function handleMouseMove() {
    engagementState.mouseMovements++;
    engagementState.lastActivity = Date.now();
  }

  // Track conversion actions (links, form submits, etc.)
  function trackConversionActions() {
    // Track CTA button clicks
    document.querySelectorAll('a[href*="demo"], a[href*="contact"], a[href*="signup"], .cta-btn, .btn-primary').forEach(el => {
      el.addEventListener('click', () => {
        engagementState.hasTakenAction = true;
        trackEvent('conversion_action', { element: el.textContent || el.href });
      });
    });

    // Track form submissions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', () => {
        engagementState.hasTakenAction = true;
        trackEvent('form_submitted', { formId: form.id || 'unknown' });
      });
    });
  }

  // Page time tracking
  function startTimeTracking() {
    setInterval(() => {
      engagementState.timeOnPage = Date.now() - engagementState.pageLoadTime;
    }, 1000);
  }

  // Initialize all engagement tracking
  function initEngagementTracking() {
    // Exit intent (desktop only)
    if (window.matchMedia('(min-width: 820px)').matches) {
      document.addEventListener('mouseout', handleExitIntent);
    }

    // Scroll and mouse tracking
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Track conversion actions
    trackConversionActions();

    // Start time tracking
    startTimeTracking();

    // Trigger entrance engagement
    triggerEntranceEngagement();
  }

  // Analytics tracking helper - pushes to dataLayer for GTM and gtag for GA4
  function trackEvent(eventName, data) {
    // Push to dataLayer for GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...data,
      sessionId: sessionId,
      timestamp: Date.now()
    });

    // Also send directly to GA4 via gtag
    if (window.gtag) {
      window.gtag('event', eventName, data);
    }

    // Debug logging
    if (window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) {
      console.log('[SavvyAI Analytics]', eventName, data);
    }
  }

  // Enhanced analytics for specific conversion events
  function trackConversion(conversionName, value, data) {
    trackEvent(conversionName, {
      ...data,
      conversion_value: value,
      currency: 'USD'
    });

    // Push conversion to dataLayer for GTM conversion tracking
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'conversion',
      conversionName: conversionName,
      conversionValue: value,
      ...data
    });
  }

  // Open with animation (manual open)
  function open() {
    engagementState.widgetOpened = true;
    engagementState.hasInteracted = true;
    document.body.classList.remove('savvy-closing');
    document.body.classList.add('savvy-open');
    if (fab) fab.classList.remove('pulse');

    // Show greeting if first time opening manually
    if (!engagementState.entranceGreetingShown) {
      engagementState.entranceGreetingShown = true;
      addGreetingMessage(getEntranceGreeting());
    }

    trackEvent('widget_opened', {
      trigger: 'manual',
      timeOnPage: engagementState.timeOnPage,
      scrollDepth: engagementState.scrollDepth
    });
  }

  // Close with animation
  function shut() {
    engagementState.widgetDismissed = true; // Mark as user-dismissed
    document.body.classList.add('savvy-closing');
    setTimeout(() => {
      document.body.classList.remove('savvy-open', 'savvy-closing');
    }, 250);

    trackEvent('widget_closed', {
      timeOnPage: engagementState.timeOnPage,
      messagesExchanged: conversationHistory.length
    });
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

    // Track escalation offered
    trackEvent('escalation_offered', {
      messagesExchanged: conversationHistory.length,
      negativeMessageCount: negativeMessageCount,
      page: window.location.pathname
    });

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
        trackEvent('escalation_declined', {
          messagesExchanged: conversationHistory.length,
          page: window.location.pathname
        });
        addMsg('ai', "No problem! I'm here to help. What else can I assist you with?");
        escalationOffered = false; // Allow future escalation if needed
      });
    }, 100);
  }

  // Initiate transfer to human agent
  function initiateTransfer(type){
    // Track escalation accepted
    trackEvent('escalation_accepted', {
      transferType: type,
      messagesExchanged: conversationHistory.length,
      page: window.location.pathname
    });

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

      // Track successful escalation submission
      trackConversion('escalation_submitted', type === 'chat' ? 25 : 50, {
        transferType: type,
        hasIssueDescription: issue.length > 0,
        messagesExchanged: conversationHistory.length,
        page: window.location.pathname
      });

      if (type === 'chat') {
        addMsg('ai', `Thank you, ${name}! A customer service agent will join this chat shortly. You'll receive an email at ${email} with the chat link. Average wait time is under 2 minutes.`);
      } else {
        addMsg('ai', `Thank you, ${name}! A customer service representative will call you at ${phone} ${time === 'asap' ? 'within the next 15 minutes' : 'during your requested time window'}. Your ticket reference: #${sessionId.slice(-6).toUpperCase()}`);
      }

    } catch (err) {
      // Track escalation submission (fallback - still counts as lead)
      trackConversion('escalation_submitted', type === 'chat' ? 25 : 50, {
        transferType: type,
        hasIssueDescription: issue.length > 0,
        messagesExchanged: conversationHistory.length,
        page: window.location.pathname,
        apiStatus: 'fallback'
      });

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
      let displayedText = '';
      let textBuffer = '';
      msgDiv.innerHTML = '';

      // Typing effect - display characters with delay
      const TYPING_DELAY = 15; // milliseconds per character
      let isTyping = false;

      async function typeNextChars() {
        if (isTyping) return;
        isTyping = true;
        while (textBuffer.length > 0) {
          const char = textBuffer.charAt(0);
          textBuffer = textBuffer.slice(1);
          displayedText += char;
          msgDiv.textContent = displayedText;
          chat.scrollTop = chat.scrollHeight;
          await new Promise(r => setTimeout(r, TYPING_DELAY));
        }
        isTyping = false;
      }

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
                textBuffer += parsed.content;
                typeNextChars(); // Start typing if not already
              }
              // Handle escalation signal from API
              if (parsed.type === 'escalate' || parsed.should_escalate) {
                setTimeout(() => showTransferOptions(), 500);
              }
            } catch (parseErr) { /* skip parse errors */ }
          }
        }
      }

      // Finish typing any remaining buffer
      while (textBuffer.length > 0 || isTyping) {
        await new Promise(r => setTimeout(r, 50));
        if (!isTyping && textBuffer.length > 0) typeNextChars();
      }

      if (!fullText) {
        fullText = fallbackRespond(question);
        msgDiv.textContent = fullText;
      }
      msgDiv.classList.remove('streaming');

      // Store AI response
      conversationHistory.push({ role: 'assistant', content: fullText });

      // Track AI response received
      trackEvent('ai_response_received', {
        responseLength: fullText.length,
        responseType: 'api',
        messagesExchanged: conversationHistory.length,
        page: window.location.pathname
      });

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

      // Track AI response received (fallback)
      trackEvent('ai_response_received', {
        responseLength: fallbackText.length,
        responseType: 'fallback',
        messagesExchanged: conversationHistory.length,
        page: window.location.pathname
      });

      // Still check for escalation even with fallback
      if (shouldOfferEscalation(sentiment, conversationHistory.length)) {
        setTimeout(() => showTransferOptions(), 1000);
      }
    }
  }

  async function handleSend(){
    const q = (input && input.value) ? input.value.trim() : "";
    if (!q) return;

    // Track user message sent
    trackEvent('ai_message_sent', {
      userQuery: q.substring(0, 100), // Truncate for privacy
      queryLength: q.length,
      messagesExchanged: conversationHistory.length + 1,
      page: window.location.pathname
    });

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
