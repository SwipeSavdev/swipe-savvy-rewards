# Embeddable Chat Widget - SwipeSavvy AI Assistant

**Project**: SwipeSavvy AI Chat Widget  
**Type**: Embeddable JavaScript Widget  
**Stack**: TypeScript, Web Components, CSS-in-JS  
**Timeline**: 2 weeks  
**Status**: Design Specification  
**Date**: December 23, 2025

---

## Executive Summary

Build a lightweight, embeddable chat widget that can be added to any website with a single script tag. Perfect for customer support, account inquiries, and financial assistance on partner sites.

**Goal**: Plug-and-play AI chat assistant deployable anywhere.

---

## Widget Overview

```
┌────────────────────────────────────────────────┐
│         Any Website (Partner Site)             │
│                                                 │
│  <script src="widget.swipesavvy.com"></script> │
│  <div id="swipesavvy-chat"></div>              │
│                                                 │
│  ┌──────────────────────────────────────────┐ │
│  │                                          │ │
│  │  [Chat Widget - Floating Button]        │ │
│  │                                          │ │
│  │  ┌────────────────────────────────────┐ │ │
│  │  │  💬 SwipeSavvy Assistant           │ │ │
│  │  │  ────────────────────────────────  │ │ │
│  │  │                                    │ │ │
│  │  │  User: Check my balance            │ │ │
│  │  │                                    │ │ │
│  │  │  AI: Your balance is $1,234.56    │ │ │
│  │  │                                    │ │ │
│  │  │  [Type your message...]            │ │ │
│  │  └────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
                     │
                     │ HTTPS REST API
                     ▼
┌────────────────────────────────────────────────┐
│      SwipeSavvy AI Agents Backend              │
│      https://api.swipesavvy.com                │
└────────────────────────────────────────────────┘
```

---

## Technology Stack

```
Core:
├── TypeScript 5
├── Web Components (Custom Elements)
├── Shadow DOM (encapsulation)
└── CSS Modules

Build:
├── Webpack 5 (bundling)
├── Babel (transpilation)
└── Terser (minification)

State:
├── Simple state machine
└── LocalStorage (sessions)

HTTP:
├── Fetch API
└── EventSource (SSE for streaming)

Testing:
├── Jest
└── Cypress (E2E)

Deployment:
├── CDN (Cloudflare/AWS CloudFront)
└── Versioned releases
```

---

## Project Structure

```
swipesavvy-widget/
├── src/
│   ├── index.ts                    # Entry point
│   ├── widget/
│   │   ├── ChatWidget.ts           # Main widget class
│   │   ├── WidgetButton.ts         # Floating button
│   │   ├── ChatWindow.ts           # Chat container
│   │   └── MessageList.ts          # Message renderer
│   ├── components/
│   │   ├── MessageBubble.ts
│   │   ├── InputBox.ts
│   │   ├── QuickReplies.ts
│   │   └── TypingIndicator.ts
│   ├── api/
│   │   ├── ChatClient.ts           # API client
│   │   └── SessionManager.ts       # Session handling
│   ├── utils/
│   │   ├── storage.ts
│   │   ├── dom.ts
│   │   └── validators.ts
│   └── styles/
│       ├── widget.css
│       ├── animations.css
│       └── themes.css
├── dist/                           # Built files
│   ├── swipesavvy-widget.min.js
│   └── swipesavvy-widget.min.css
├── examples/
│   ├── basic.html
│   ├── custom-theme.html
│   └── advanced.html
├── webpack.config.js
├── tsconfig.json
└── package.json
```

---

## Implementation Plan

### **Week 1: Core Widget Development**

#### Day 1-2: Widget Foundation

```typescript
// src/widget/ChatWidget.ts
export interface WidgetConfig {
  apiUrl: string;
  apiKey?: string;
  userId?: string;
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  brandName?: string;
  welcomeMessage?: string;
}

class ChatWidget extends HTMLElement {
  private shadow: ShadowRoot;
  private config: WidgetConfig;
  private isOpen: boolean = false;
  private sessionId: string | null = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.config = this.parseConfig();
    this.render();
    this.attachEventListeners();
    this.loadSession();
  }

  private parseConfig(): WidgetConfig {
    return {
      apiUrl: this.getAttribute('api-url') || 'https://api.swipesavvy.com',
      apiKey: this.getAttribute('api-key') || '',
      userId: this.getAttribute('user-id') || this.generateUserId(),
      theme: (this.getAttribute('theme') as any) || 'light',
      position: (this.getAttribute('position') as any) || 'bottom-right',
      primaryColor: this.getAttribute('primary-color') || '#3b82f6',
      brandName: this.getAttribute('brand-name') || 'SwipeSavvy',
      welcomeMessage: this.getAttribute('welcome-message') || 
        'Hi! How can I help you today?',
    };
  }

  private render() {
    this.shadow.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="widget-container ${this.config.position}">
        <div class="chat-button" id="chatButton">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
          <span class="notification-badge" style="display: none;">1</span>
        </div>
        
        <div class="chat-window" id="chatWindow" style="display: none;">
          <div class="chat-header">
            <div class="header-content">
              <strong>${this.config.brandName} Assistant</strong>
              <span class="status online">● Online</span>
            </div>
            <button class="close-btn" id="closeBtn">×</button>
          </div>
          
          <div class="message-list" id="messageList">
            <div class="welcome-message">
              ${this.config.welcomeMessage}
            </div>
          </div>
          
          <div class="quick-replies" id="quickReplies">
            <button data-message="Check my balance">💰 Balance</button>
            <button data-message="Show recent transactions">📊 Transactions</button>
            <button data-message="Help">❓ Help</button>
          </div>
          
          <div class="chat-input-container">
            <input
              type="text"
              id="chatInput"
              placeholder="Type your message..."
              autocomplete="off"
            />
            <button id="sendBtn">
              <svg viewBox="0 0 24 24" class="send-icon">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private getStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      .widget-container {
        position: fixed;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .widget-container.bottom-right {
        bottom: 20px;
        right: 20px;
      }

      .widget-container.bottom-left {
        bottom: 20px;
        left: 20px;
      }

      .chat-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${this.config.primaryColor};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        position: relative;
      }

      .chat-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      .chat-button .icon {
        width: 28px;
        height: 28px;
        fill: white;
      }

      .notification-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #ef4444;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      }

      .chat-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .chat-header {
        background: ${this.config.primaryColor};
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header-content strong {
        display: block;
        font-size: 16px;
      }

      .status {
        font-size: 12px;
        opacity: 0.9;
      }

      .status.online::before {
        content: '●';
        color: #10b981;
        margin-right: 4px;
      }

      .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .message-list {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f9fafb;
      }

      .message-list::-webkit-scrollbar {
        width: 6px;
      }

      .message-list::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }

      .welcome-message {
        background: white;
        border-radius: 12px;
        padding: 12px 16px;
        margin-bottom: 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .message {
        margin-bottom: 12px;
        display: flex;
      }

      .message.user {
        justify-content: flex-end;
      }

      .message-bubble {
        max-width: 75%;
        padding: 10px 14px;
        border-radius: 16px;
        word-wrap: break-word;
      }

      .message.user .message-bubble {
        background: ${this.config.primaryColor};
        color: white;
        border-bottom-right-radius: 4px;
      }

      .message.assistant .message-bubble {
        background: white;
        color: #1f2937;
        border-bottom-left-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .message-time {
        font-size: 11px;
        opacity: 0.7;
        margin-top: 4px;
      }

      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 10px 14px;
        background: white;
        border-radius: 16px;
        width: fit-content;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #9ca3af;
        animation: typing 1.4s infinite;
      }

      .typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-10px);
        }
      }

      .quick-replies {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        overflow-x: auto;
        background: white;
        border-top: 1px solid #e5e7eb;
      }

      .quick-replies button {
        padding: 8px 16px;
        border: 1px solid #d1d5db;
        background: white;
        border-radius: 20px;
        font-size: 14px;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s;
      }

      .quick-replies button:hover {
        background: #f3f4f6;
        border-color: ${this.config.primaryColor};
      }

      .chat-input-container {
        display: flex;
        gap: 8px;
        padding: 16px;
        background: white;
        border-top: 1px solid #e5e7eb;
      }

      #chatInput {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #d1d5db;
        border-radius: 24px;
        font-size: 14px;
        outline: none;
      }

      #chatInput:focus {
        border-color: ${this.config.primaryColor};
      }

      #sendBtn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${this.config.primaryColor};
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }

      #sendBtn:hover {
        transform: scale(1.1);
      }

      .send-icon {
        width: 20px;
        height: 20px;
        fill: white;
      }

      @media (max-width: 480px) {
        .chat-window {
          width: 100vw;
          height: 100vh;
          bottom: 0;
          right: 0;
          border-radius: 0;
        }
      }
    `;
  }

  private attachEventListeners() {
    const chatButton = this.shadow.getElementById('chatButton');
    const closeBtn = this.shadow.getElementById('closeBtn');
    const sendBtn = this.shadow.getElementById('sendBtn');
    const chatInput = this.shadow.getElementById('chatInput') as HTMLInputElement;
    const quickReplies = this.shadow.getElementById('quickReplies');

    chatButton?.addEventListener('click', () => this.toggleChat());
    closeBtn?.addEventListener('click', () => this.toggleChat());
    sendBtn?.addEventListener('click', () => this.sendMessage());
    chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    quickReplies?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON') {
        const message = target.getAttribute('data-message');
        if (message) this.sendMessage(message);
      }
    });
  }

  private toggleChat() {
    this.isOpen = !this.isOpen;
    const chatWindow = this.shadow.getElementById('chatWindow');
    const chatButton = this.shadow.getElementById('chatButton');
    
    if (chatWindow && chatButton) {
      chatWindow.style.display = this.isOpen ? 'flex' : 'none';
      chatButton.style.display = this.isOpen ? 'none' : 'flex';
    }
  }

  private async sendMessage(message?: string) {
    const input = this.shadow.getElementById('chatInput') as HTMLInputElement;
    const messageText = message || input.value.trim();
    
    if (!messageText) return;

    this.addMessage(messageText, 'user');
    input.value = '';
    
    this.showTypingIndicator();

    try {
      const response = await this.callAPI(messageText);
      this.hideTypingIndicator();
      this.addMessage(response.response, 'assistant', response.metadata);
      this.sessionId = response.session_id;
      this.saveSession();
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
    }
  }

  private addMessage(content: string, role: 'user' | 'assistant', metadata?: any) {
    const messageList = this.shadow.getElementById('messageList');
    if (!messageList) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = content;
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    bubble.appendChild(time);
    messageDiv.appendChild(bubble);
    messageList.appendChild(messageDiv);
    
    messageList.scrollTop = messageList.scrollHeight;
  }

  private showTypingIndicator() {
    const messageList = this.shadow.getElementById('messageList');
    if (!messageList) return;

    const indicator = document.createElement('div');
    indicator.id = 'typingIndicator';
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    messageList.appendChild(indicator);
    messageList.scrollTop = messageList.scrollHeight;
  }

  private hideTypingIndicator() {
    const indicator = this.shadow.getElementById('typingIndicator');
    indicator?.remove();
  }

  private async callAPI(message: string): Promise<any> {
    const response = await fetch(`${this.config.apiUrl}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({
        message,
        user_id: this.config.userId,
        session_id: this.sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private generateUserId(): string {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadSession() {
    const saved = localStorage.getItem('swipesavvy_session');
    if (saved) {
      const data = JSON.parse(saved);
      this.sessionId = data.session_id;
      // Optionally load message history
    }
  }

  private saveSession() {
    if (this.sessionId) {
      localStorage.setItem('swipesavvy_session', JSON.stringify({
        session_id: this.sessionId,
        timestamp: Date.now(),
      }));
    }
  }
}

// Register the custom element
customElements.define('swipesavvy-chat', ChatWidget);

// Auto-initialize if element exists
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWidget);
} else {
  initWidget();
}

function initWidget() {
  const existingWidget = document.querySelector('swipesavvy-chat');
  if (!existingWidget) {
    const widget = document.createElement('swipesavvy-chat');
    // Copy data attributes from script tag
    const script = document.currentScript as HTMLScriptElement;
    if (script) {
      const apiUrl = script.getAttribute('data-api-url');
      const apiKey = script.getAttribute('data-api-key');
      const theme = script.getAttribute('data-theme');
      
      if (apiUrl) widget.setAttribute('api-url', apiUrl);
      if (apiKey) widget.setAttribute('api-key', apiKey);
      if (theme) widget.setAttribute('theme', theme);
    }
    document.body.appendChild(widget);
  }
}
```

---

#### Day 3-4: Build Configuration

```javascript
// webpack.config.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'swipesavvy-widget.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'SwipeSavvyWidget',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  devServer: {
    static: './examples',
    port: 8080,
  },
};
```

#### Day 5: Testing

```typescript
// __tests__/ChatWidget.test.ts
describe('ChatWidget', () => {
  let widget: ChatWidget;

  beforeEach(() => {
    widget = document.createElement('swipesavvy-chat') as ChatWidget;
    document.body.appendChild(widget);
  });

  afterEach(() => {
    document.body.removeChild(widget);
  });

  it('should render chat button', () => {
    const button = widget.shadowRoot?.querySelector('.chat-button');
    expect(button).toBeTruthy();
  });

  it('should toggle chat window', () => {
    const button = widget.shadowRoot?.querySelector('.chat-button') as HTMLElement;
    button.click();
    
    const chatWindow = widget.shadowRoot?.querySelector('.chat-window') as HTMLElement;
    expect(chatWindow.style.display).toBe('flex');
  });
});
```

---

### **Week 2: Polish & Deployment**

#### Day 6-7: Advanced Features

- [ ] Typing indicators
- [ ] File upload support
- [ ] Rich media (images, cards)
- [ ] Offline mode
- [ ] Custom themes
- [ ] i18n support

#### Day 8-9: CDN Deployment

```bash
# Build for production
npm run build

# Upload to CDN
aws s3 cp dist/ s3://cdn.swipesavvy.com/widget/v1/ --recursive
```

#### Day 10: Documentation & Launch

---

## Usage Examples

### Basic Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to My Site</h1>
  
  <!-- SwipeSavvy Chat Widget -->
  <script
    src="https://cdn.swipesavvy.com/widget/v1/swipesavvy-widget.min.js"
    data-api-url="https://api.swipesavvy.com"
    data-api-key="your_api_key"
    data-theme="light"
    data-primary-color="#3b82f6"
    data-brand-name="My Company"
  ></script>
</body>
</html>
```

### Custom Theme

```html
<script
  src="https://cdn.swipesavvy.com/widget/v1/swipesavvy-widget.min.js"
  data-api-url="https://api.swipesavvy.com"
  data-theme="dark"
  data-primary-color="#8b5cf6"
  data-position="bottom-left"
></script>
```

### Programmatic Control

```javascript
// Initialize manually
const widget = document.createElement('swipesavvy-chat');
widget.setAttribute('api-url', 'https://api.swipesavvy.com');
widget.setAttribute('user-id', 'user123');
document.body.appendChild(widget);

// Open chat programmatically
widget.open();

// Send message
widget.sendMessage('Hello!');
```

---

## Performance Metrics

**Bundle Size**:
- Minified: ~45 KB
- Gzipped: ~15 KB

**Performance**:
- First load: < 500ms
- Time to interactive: < 1s
- Memory footprint: < 5 MB

---

## Success Criteria

- [ ] Bundle size < 50 KB (gzipped)
- [ ] Load time < 1 second
- [ ] Works on IE11+ and all modern browsers
- [ ] No conflicts with host site
- [ ] 100% Shadow DOM encapsulation
- [ ] Mobile responsive

---

## Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Week 1** | 5 days | Core widget, API integration, basic UI |
| **Week 2** | 5 days | Polish, testing, documentation, deployment |

**Total**: 2 weeks (10 working days)

**Launch**: Early January 2026

---

**Status**: ✅ Design complete, ready to build  
**Risk Level**: Low (simple tech, proven patterns)
