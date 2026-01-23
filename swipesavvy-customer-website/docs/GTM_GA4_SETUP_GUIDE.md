# Google Tag Manager & GA4 Analytics Setup Guide

## Overview
This document provides the complete setup for SwipeSavvy website analytics tracking using Google Tag Manager (GTM) and Google Analytics 4 (GA4).

**GTM Container ID:** GTM-PWQQBG28
**GA4 Measurement ID:** G-CG59H9TQ2Q

---

## Part 1: GTM Variables

### 1.1 Data Layer Variables

Create the following Data Layer Variables in GTM:

| Variable Name | Data Layer Variable Name | Type |
|--------------|-------------------------|------|
| DLV - Event Trigger | trigger | Data Layer Variable |
| DLV - Time On Page | timeOnPage | Data Layer Variable |
| DLV - Scroll Depth | scrollDepth | Data Layer Variable |
| DLV - Page Path | page | Data Layer Variable |
| DLV - Element Text | element | Data Layer Variable |
| DLV - Form ID | formId | Data Layer Variable |
| DLV - Messages Exchanged | messagesExchanged | Data Layer Variable |
| DLV - Had Interaction | hadInteraction | Data Layer Variable |
| DLV - User Query | userQuery | Data Layer Variable |
| DLV - AI Response Type | responseType | Data Layer Variable |
| DLV - Session ID | sessionId | Data Layer Variable |
| DLV - Escalation Offered | escalationOffered | Data Layer Variable |
| DLV - Transfer Type | transferType | Data Layer Variable |
| DLV - Response Length | responseLength | Data Layer Variable |
| DLV - Query Length | queryLength | Data Layer Variable |
| DLV - Conversion Value | conversion_value | Data Layer Variable |
| DLV - Conversion Name | conversionName | Data Layer Variable |

### 1.2 Built-in Variables (Enable These)

- Page URL
- Page Path
- Page Hostname
- Referrer
- Click Element
- Click Classes
- Click ID
- Click URL
- Click Text
- Form Element
- Form Classes
- Form ID
- Scroll Depth Threshold
- Scroll Depth Units
- Scroll Direction

---

## Part 2: GTM Triggers

### 2.1 Custom Event Triggers

| Trigger Name | Trigger Type | Event Name | Conditions |
|-------------|-------------|------------|------------|
| CE - Widget Auto Opened | Custom Event | widget_auto_opened | - |
| CE - Widget Opened | Custom Event | widget_opened | - |
| CE - Widget Closed | Custom Event | widget_closed | - |
| CE - Exit Intent Triggered | Custom Event | exit_intent_triggered | - |
| CE - Conversion Action | Custom Event | conversion_action | - |
| CE - Form Submitted | Custom Event | form_submitted | - |
| CE - AI Message Sent | Custom Event | ai_message_sent | - |
| CE - AI Response Received | Custom Event | ai_response_received | - |
| CE - Escalation Offered | Custom Event | escalation_offered | - |
| CE - Escalation Accepted | Custom Event | escalation_accepted | - |
| CE - Escalation Declined | Custom Event | escalation_declined | - |
| CE - Escalation Submitted | Custom Event | escalation_submitted | - |
| CE - Contact Form Submit | Custom Event | contact_form_submit | - |
| CE - Demo Request | Custom Event | demo_request | - |

### 2.2 Element Visibility Triggers

| Trigger Name | Selection Method | Element | Minimum Visibility |
|-------------|-----------------|---------|-------------------|
| EV - Pricing Section Visible | CSS Selector | #pricing, .pricing-section | 50% |
| EV - CTA Button Visible | CSS Selector | .cta-btn, .btn-primary | 100% |
| EV - Contact Form Visible | CSS Selector | .contact-form, #contact-form | 50% |

### 2.3 Click Triggers

| Trigger Name | Trigger Type | Conditions |
|-------------|-------------|------------|
| Click - CTA Buttons | Click - All Elements | Click Classes contains "cta" OR "btn-primary" |
| Click - Navigation Links | Click - Just Links | Click URL contains swipesavvy.com |
| Click - External Links | Click - Just Links | Click URL does not contain swipesavvy.com |
| Click - Phone Number | Click - Just Links | Click URL contains "tel:" |
| Click - Email Link | Click - Just Links | Click URL contains "mailto:" |
| Click - Demo Button | Click - All Elements | Click Text contains "Demo" OR "Get Started" |

### 2.4 Scroll Depth Trigger

| Trigger Name | Trigger Type | Thresholds |
|-------------|-------------|------------|
| Scroll Depth - 25/50/75/90 | Scroll Depth | Vertical: 25, 50, 75, 90 percent |

### 2.5 Timer Trigger

| Trigger Name | Interval | Limit | Conditions |
|-------------|----------|-------|------------|
| Timer - 30 Second Engagement | 30000ms | 1 | Page Path matches .* |

---

## Part 3: GTM Tags

### 3.1 GA4 Configuration Tag

**Tag Name:** GA4 - Configuration
**Tag Type:** Google Analytics: GA4 Configuration
**Measurement ID:** G-CG59H9TQ2Q
**Trigger:** All Pages

**Fields to Set:**
- `debug_mode`: true (remove for production)
- `send_page_view`: true

**User Properties:**
- `user_source`: {{Referrer}}

### 3.2 GA4 Event Tags

#### Widget Events

**Tag: GA4 Event - Widget Auto Opened**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: widget_auto_opened
Parameters:
  - trigger: {{DLV - Event Trigger}}
  - time_on_page: {{DLV - Time On Page}}
  - scroll_depth: {{DLV - Scroll Depth}}
  - page_path: {{DLV - Page Path}}
Trigger: CE - Widget Auto Opened
```

**Tag: GA4 Event - Widget Opened**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: widget_opened
Parameters:
  - trigger: {{DLV - Event Trigger}}
  - time_on_page: {{DLV - Time On Page}}
  - scroll_depth: {{DLV - Scroll Depth}}
Trigger: CE - Widget Opened
```

**Tag: GA4 Event - Widget Closed**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: widget_closed
Parameters:
  - time_on_page: {{DLV - Time On Page}}
  - messages_exchanged: {{DLV - Messages Exchanged}}
Trigger: CE - Widget Closed
```

#### Engagement Events

**Tag: GA4 Event - Exit Intent**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: exit_intent
Parameters:
  - time_on_page: {{DLV - Time On Page}}
  - scroll_depth: {{DLV - Scroll Depth}}
  - had_interaction: {{DLV - Had Interaction}}
Trigger: CE - Exit Intent Triggered
```

**Tag: GA4 Event - Conversion Action**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: cta_click
Parameters:
  - element_text: {{DLV - Element Text}}
  - page_path: {{Page Path}}
Trigger: CE - Conversion Action
```

**Tag: GA4 Event - Form Submit**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: form_submit
Parameters:
  - form_id: {{DLV - Form ID}}
  - page_path: {{Page Path}}
Trigger: CE - Form Submitted
```

#### AI Chat Events

**Tag: GA4 Event - AI Message Sent**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: ai_chat_message
Parameters:
  - message_type: user
  - session_id: {{DLV - Session ID}}
  - page_path: {{Page Path}}
Trigger: CE - AI Message Sent
```

**Tag: GA4 Event - AI Response**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: ai_chat_response
Parameters:
  - response_type: {{DLV - AI Response Type}}
  - session_id: {{DLV - Session ID}}
Trigger: CE - AI Response Received
```

**Tag: GA4 Event - Escalation Offered**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: escalation_offered
Parameters:
  - session_id: {{DLV - Session ID}}
  - messages_exchanged: {{DLV - Messages Exchanged}}
Trigger: CE - Escalation Offered
```

**Tag: GA4 Event - Escalation Accepted**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: escalation_accepted
Parameters:
  - transfer_type: {{DLV - Transfer Type}}
  - messages_exchanged: {{DLV - Messages Exchanged}}
  - page_path: {{Page Path}}
Trigger: CE - Escalation Accepted
```

**Tag: GA4 Event - Escalation Declined**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: escalation_declined
Parameters:
  - messages_exchanged: {{DLV - Messages Exchanged}}
  - page_path: {{Page Path}}
Trigger: CE - Escalation Declined
```

**Tag: GA4 Event - Escalation Submitted**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: escalation_submitted
Parameters:
  - transfer_type: {{DLV - Transfer Type}}
  - conversion_value: {{DLV - Conversion Value}}
  - messages_exchanged: {{DLV - Messages Exchanged}}
  - page_path: {{Page Path}}
Trigger: CE - Escalation Submitted
```

#### Scroll & Engagement

**Tag: GA4 Event - Scroll Depth**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: scroll
Parameters:
  - percent_scrolled: {{Scroll Depth Threshold}}
  - page_path: {{Page Path}}
Trigger: Scroll Depth - 25/50/75/90
```

**Tag: GA4 Event - 30s Engagement**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: engaged_30_seconds
Parameters:
  - page_path: {{Page Path}}
Trigger: Timer - 30 Second Engagement
```

#### Click Tracking

**Tag: GA4 Event - CTA Click**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: cta_button_click
Parameters:
  - click_text: {{Click Text}}
  - click_url: {{Click URL}}
  - page_path: {{Page Path}}
Trigger: Click - CTA Buttons
```

**Tag: GA4 Event - Outbound Link**
```
Tag Type: GA4 Event
Configuration Tag: GA4 - Configuration
Event Name: outbound_link
Parameters:
  - click_url: {{Click URL}}
  - click_text: {{Click Text}}
Trigger: Click - External Links
```

---

## Part 4: GA4 Custom Definitions

### 4.1 Custom Dimensions (Event-scoped)

Create these in GA4 Admin > Custom Definitions:

| Dimension Name | Event Parameter | Scope |
|---------------|-----------------|-------|
| Widget Trigger | trigger | Event |
| Page Path | page_path | Event |
| Form ID | form_id | Event |
| Session ID | session_id | Event |
| Response Type | response_type | Event |
| Click Text | click_text | Event |
| Click URL | click_url | Event |
| Element Text | element_text | Event |
| Transfer Type | transfer_type | Event |
| API Status | apiStatus | Event |

### 4.2 Custom Metrics

| Metric Name | Event Parameter | Scope | Unit |
|------------|-----------------|-------|------|
| Time on Page | time_on_page | Event | Milliseconds |
| Scroll Depth | scroll_depth | Event | Percent |
| Messages Exchanged | messages_exchanged | Event | Standard |
| Percent Scrolled | percent_scrolled | Event | Percent |
| Response Length | responseLength | Event | Standard |
| Query Length | queryLength | Event | Standard |
| Conversion Value | conversion_value | Event | Currency (USD) |

---

## Part 5: GA4 Conversions

Mark these events as conversions in GA4 Admin > Conversions:

1. **contact_form_submit** - Contact form submission
2. **demo_request** - Demo request form
3. **escalation_accepted** - User accepted human support transfer
4. **escalation_submitted** - User completed escalation form (high value lead)
5. **cta_button_click** (with conditions) - Primary CTA clicks

### Conversion Values
- `escalation_submitted` (chat): $25 estimated lead value
- `escalation_submitted` (phone): $50 estimated lead value (higher intent)

---

## Part 6: GA4 Audiences

Create these audiences for remarketing:

### 6.1 High Intent Visitors
```
Conditions:
- scroll event with percent_scrolled >= 75
- OR widget_opened event
- OR engaged_30_seconds event
```

### 6.2 AI Chat Engagers
```
Conditions:
- ai_chat_message event (at least 1)
```

### 6.3 Exit Intent - No Conversion
```
Conditions:
- exit_intent event
- AND NOT contact_form_submit event
- AND NOT demo_request event
```

### 6.4 Pricing Page Visitors
```
Conditions:
- page_view event with page_path contains "/pricing"
- OR scroll event with page_path contains "/pricing"
```

---

## Part 7: Recommended GA4 Reports

### 7.1 Custom Explorations

**AI Chat Funnel**
1. Widget Opened
2. AI Message Sent
3. AI Response Received
4. Escalation Offered
5. Escalation Accepted
6. Escalation Submitted

**Engagement Funnel**
1. Page View
2. Scroll 50%
3. CTA Click
4. Form Submit

### 7.2 Custom Reports

**Widget Performance Report**
- Dimensions: Page Path, Widget Trigger
- Metrics: Event Count, Sessions, Bounce Rate

**Content Engagement Report**
- Dimensions: Page Path, Scroll Depth Bucket
- Metrics: Avg Time on Page, Engaged Sessions

---

## Part 8: Testing & Validation

### 8.1 GTM Preview Mode
1. Go to GTM > Preview
2. Enter your website URL
3. Navigate through pages and test all triggers
4. Verify tags fire correctly

### 8.2 GA4 DebugView
1. Go to GA4 > Configure > DebugView
2. Open website in browser with GTM Preview
3. Watch events stream in real-time
4. Verify all parameters are populated

### 8.3 Browser Console
Check for dataLayer pushes:
```javascript
// In browser console
dataLayer.filter(e => e.event).map(e => e.event)
```

---

## Appendix: GTM Container Import JSON

A JSON file for importing this entire GTM configuration is available at:
`/docs/gtm-container-export.json`

To import:
1. Go to GTM > Admin > Import Container
2. Choose the JSON file
3. Select "Merge" and "Rename conflicting"
4. Review and Confirm
