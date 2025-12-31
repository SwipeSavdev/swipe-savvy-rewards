# Support Tickets - Sources & Flow Documentation

**Last Updated:** December 30, 2025  
**Status:** Complete  

---

## 📍 Ticket Sources & Entry Points

Support tickets are created from **3 primary sources**:

### 1. **AI Concierge (Mobile App) - AUTOMATIC**
**Trigger:** AI-to-Human Escalation  
**Flow:** User → AI Chat → Escalation Trigger → Support Ticket

```
User initiates chat in mobile app
         ↓
AI Concierge analyzes conversation
         ↓
Escalation keywords detected (keywords below)
         ↓
handleAIToHumanHandoff() triggered
         ↓
createTicketFromAITransfer() called
         ↓
Support Ticket Created ✓
```

**Escalation Triggers in AI Conversation:**

| Category | Keywords | Priority | Example |
|----------|----------|----------|---------|
| **Security** | unauthorized, fraud, hacked, suspicious, security concern | CRITICAL | "My account was hacked!" |
| **Banking** | transfer failed, deposit, withdrawal, account locked, balance wrong | HIGH | "My transfer didn't go through" |
| **Account Access** | cannot login, locked out, forgot password, account access | HIGH | "I'm locked out of my account" |
| **App Error** | error, crash, bug, failed, exception, not working | MEDIUM | "The app keeps crashing" |
| **Urgent Markers** | urgent, critical, emergency, asap, immediately | HIGH | "This is urgent!" |

**API Endpoint (Backend):**
```
POST /api/support/tickets/from-ai-transfer
Body: {
  conversationId: string
  summaryOfIssue: string
  category: SupportCategory
  priority: TicketPriority
  conversationHistory: Message[]
  suggestedResolution: string
  customerContext: {
    accountStatus: string
    recentTransactions: number
    accountAge: string
  }
}
```

**Service Call (Frontend - Mobile):**
```typescript
supportTicketService.createTicketFromAITransfer(
  transferData: AITransferData,
  customerId: string
)
```

---

### 2. **Manual Ticket Creation (Mobile App)**
**Trigger:** User explicitly creates ticket  
**Flow:** User → Support Tab → Create Ticket Form → Submit

```
User navigates to Support section (Mobile App)
         ↓
Clicks "Create Support Request" / "Report Issue"
         ↓
Fills out form:
  - Subject
  - Description
  - Category (dropdown)
  - Priority (optional)
  - Attachments (optional)
         ↓
createTicket() API called
         ↓
Support Ticket Created ✓
```

**API Endpoint (Backend):**
```
POST /api/support/tickets
Body: {
  customer_id: string
  category: string
  subject: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  attachments?: string[] (file URLs)
}
```

**Service Call (Frontend - Mobile):**
```typescript
supportTicketService.createTicket(
  customerId: string,
  category: SupportCategory,
  priority: TicketPriority,
  subject: string,
  description: string,
  errorDetails?: any
)
```

---

### 3. **Admin Portal (Web)**
**Trigger:** Admin manually creates ticket for customer  
**Flow:** Admin → Support Tickets → Create / View tickets

```
Support agent logs into Admin Portal
         ↓
Navigates to Support Tickets page
         ↓
Clicks "View" or "Create" ticket
         ↓
Modal opens with ticket details
         ↓
Can add internal notes, change status, assign
         ↓
Changes persist via API ✓
```

**Admin Portal Features:**
- List all tickets with pagination
- Filter by status (All, Open, In Progress, Resolved, Closed)
- Search tickets
- View ticket details in modal
- Add internal notes
- Update ticket status
- (Placeholder) Assign to agent
- (Placeholder) View conversation timeline

**API Endpoint (Backend):**
```
GET  /api/v1/admin/support/tickets?page=1&limit=100&status=open
GET  /api/v1/admin/support/tickets/{ticket_id}
PUT  /api/v1/admin/support/tickets/{ticket_id}/status
POST /api/v1/admin/support/tickets/{ticket_id}/assign
```

---

## 🔄 Complete Ticket Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    TICKET CREATION (3 Sources)                  │
├─────────────────────┬──────────────────┬────────────────────────┤
│   AI Escalation     │  Manual (Mobile)  │   Admin Portal (Web)   │
│   (Automatic)       │   (User-initiated)│   (Support Agent)      │
└─────────────────────┴──────────────────┴────────────────────────┘
         ↓                    ↓                       ↓
         └────────────────────┼───────────────────────┘
                              ↓
                    ┌──────────────────────┐
                    │   Support Ticket DB  │
                    │  (support_tickets)   │
                    └──────────────────────┘
                              ↓
         ┌────────────────────┬───────────────────────┐
         ↓                    ↓                       ↓
    ┌─────────┐      ┌──────────────┐     ┌──────────────────┐
    │  OPEN   │  →   │ IN_PROGRESS  │ →   │  RESOLVED/CLOSED │
    └─────────┘      └──────────────┘     └──────────────────┘
         ↑                    ↑                       ↑
         │ (Reopened)         │ (Agent works)        │ (Resolved)
         │                    │ + Messages           │ + Feedback
         └────────────────────┴───────────────────────┘

Additional Features Added During Lifecycle:
├─ Messages (ticket_messages table)
├─ Attachments (ticket_attachments table)
├─ Escalations (escalation_requests table)
├─ Assignments (assigned_to field)
└─ Customer Feedback (rating, CSAT score)
```

---

## 📱 Mobile App Ticket Operations

### **SupportTicketsScreen Component**
**Location:** `/src/features/ai-concierge/screens/SupportTicketsScreen.tsx`

**Features:**
- Display customer's tickets (Open vs Resolved tabs)
- Filter by status
- Pull-to-refresh
- Tap ticket to view details
- Color-coded status indicators
- Category badges

**Data Flow:**
```
Mobile App → supportTicketService.getCustomerTickets(customerId)
                              ↓
                    Backend API GET request
                              ↓
                    Returns: SupportTicket[]
                              ↓
                    Display in FlatList
```

---

## 🌐 Admin Portal Ticket Operations

### **SupportTicketsPage Component**
**Location:** `/swipesavvy-admin-portal/src/pages/SupportTicketsPage.tsx`

**Features:**
- List all support tickets
- Filter by status (dropdown)
- Search by query
- Pagination (10 per page)
- View ticket details in modal
- Add internal notes
- Color-coded priority & status badges

**Data Flow:**
```
Admin Portal → Api.supportTicketsApi.listTickets()
                       ↓
            Backend API GET request
                       ↓
     Returns: { tickets: SupportTicket[], total: number }
                       ↓
            Display in Table component
                       ↓
            Click "View" → Modal opens
                       ↓
            Add notes → API PUT request
                       ↓
            Ticket updated ✓
```

---

## 🔌 Backend API Routes

**All routes are in: `app/routes/support.py` (multiple services)**

### Ticket CRUD Operations
```python
POST   /tickets              # Create ticket
GET    /tickets/{ticket_id}  # Get ticket details
GET    /tickets              # List tickets (with filters)
PUT    /tickets/{ticket_id}  # Update ticket
```

### AI Transfer Operations
```python
POST   /tickets/from-ai-transfer  # Create ticket from AI escalation
POST   /tickets/{ticket_id}/escalate  # Escalate existing ticket
```

### Messages & Communication
```python
POST   /tickets/{ticket_id}/messages  # Add message to ticket
GET    /tickets/{ticket_id}/messages  # Get all messages
```

### Status & Assignment (Admin)
```python
PUT    /api/v1/admin/support/tickets/{ticket_id}/status  # Update status
POST   /api/v1/admin/support/tickets/{ticket_id}/assign  # Assign to agent
```

---

## 📊 Data Model

### Support Tickets Table
```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY,
  customer_id UUID,           -- Who reported the issue
  ticket_id VARCHAR(20),      -- Human-readable ID
  ticket_number INT,          -- Sequential number for display
  subject VARCHAR(255),       -- Issue title
  description TEXT,           -- Issue details
  status VARCHAR(20),         -- 'open', 'in_progress', 'resolved', 'closed'
  priority VARCHAR(20),       -- 'low', 'medium', 'high', 'urgent'
  category VARCHAR(50),       -- 'app_error', 'banking_issue', etc.
  assigned_to UUID,           -- Agent assigned
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY,
  ticket_id UUID,
  sender_id UUID,
  sender_type VARCHAR(20),    -- 'customer', 'agent', 'system'
  message_content TEXT,
  created_at TIMESTAMP
);

CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY,
  ticket_id UUID,
  attachment_url TEXT,
  uploaded_at TIMESTAMP
);

CREATE TABLE escalation_requests (
  id UUID PRIMARY KEY,
  ticket_id UUID,
  reason TEXT,
  target_priority VARCHAR(20),
  status VARCHAR(20),         -- 'pending', 'approved', 'denied'
  created_at TIMESTAMP
);
```

---

## 🔑 Key Support Categories

```typescript
enum SupportCategory {
  APP_ERROR = 'app_error',           // App crashes, bugs, not working
  BANKING_ISSUE = 'banking_issue',   // Transfers, deposits, withdrawals
  ACCOUNT_ACCESS = 'account_access', // Login, locked out, 2FA
  TRANSACTION_ERROR = 'transaction_error', // Payment failures
  FEATURE_QUESTION = 'feature_question',   // "How do I...?"
  SECURITY_CONCERN = 'security_concern',   // Fraud, hacking, unauthorized
  OTHER = 'other'                    // General inquiries
}
```

---

## 📈 Ticket Priority Levels

```typescript
enum TicketPriority {
  LOW = 'low',           // General inquiries, feature questions
  MEDIUM = 'medium',     // App errors, normal issues
  HIGH = 'high',         // Banking issues, account access
  CRITICAL = 'critical'  // Security, fraud, urgent
}
```

---

## 🎯 Ticket Status Workflow

```
┌──────┐    ┌────────────┐    ┌──────────┐    ┌────────┐
│ OPEN │ → │IN_PROGRESS │ → │ RESOLVED │ → │ CLOSED │
└──────┘    └────────────┘    └──────────┘    └────────┘
   ↓            ↓                   ↑             ↑
   └─ REOPENED ──┴─────────────────┴─────────────┘
      (Customer replies to resolved ticket)
```

---

## 🌍 Platform Integration Summary

| Source | App | Platform | Entry Method | Trigger |
|--------|-----|----------|--------------|---------|
| **AI Escalation** | Mobile (Concierge) | Mobile App | Automatic | AI conversation analysis |
| **Manual Creation** | Mobile (Concierge) | Mobile App | User action | Explicit support request |
| **Admin Create/View** | Admin Portal | Web | Support agent | Manual ticket management |
| **Webhook** | Any | Backend | API | External system integration |

---

## 📞 Example Ticket Flows

### Flow 1: AI Detects Security Issue → Auto-Creates Ticket
```
Customer (Mobile): "My account was hacked!"
         ↓ (AI reads message)
AI Concierge: "I understand this is critical. Let me escalate..."
         ↓ (Escalation triggered)
analyzeConversationForEscalation()
         ↓ (Finds 'hacked' keyword)
category = SECURITY_CONCERN
priority = CRITICAL
         ↓
createTicketFromAITransfer()
         ↓
Ticket created with:
  - Subject: "Account security issue - hacked"
  - Category: security_concern
  - Priority: critical
  - Status: open
         ↓
Support agent gets notified
Agent verifies customer → resolves issue
```

### Flow 2: Customer Manually Reports App Crash
```
Customer (Mobile):
1. Opens Support section
2. Clicks "Create Support Request"
3. Fills form:
   - Subject: "App keeps crashing"
   - Description: "Happens when I try to transfer money"
   - Category: "App Error"
   - Attachments: [error_log.txt]
4. Submits
         ↓
createTicket() API called
         ↓
Ticket created in DB
         ↓
Status: open, Priority: medium
         ↓
Admin sees ticket in portal
Agent investigates → provides solution → closes
```

### Flow 3: Admin Triages Ticket from Portal
```
Support Agent (Web Admin Portal):
1. Logs into Admin Portal
2. Navigates to Support → Tickets
3. Sees list of 245 open tickets
4. Filters by "high" priority
5. Clicks "View" on customer's ticket
6. Modal shows:
   - Customer details
   - Current status
   - Internal note field
7. Adds note: "Investigating customer's device logs"
8. Changes status: open → in_progress
9. (Placeholder) Assigns to self
10. Saves changes
         ↓
API PUT /tickets/{id}/status called
         ↓
Ticket status updated in DB
         ↓
Mobile app refreshes → Customer sees: "In Progress"
```

---

## 🔗 API Integration Requirements

**Frontend needs to implement:**
1. Ticket creation endpoint consumption
2. List/filter ticket endpoints
3. Real-time updates (WebSocket) for status changes
4. File upload for attachments
5. Polling/refresh mechanism for mobile

**Backend has:**
✅ All CRUD endpoints implemented  
✅ AI transfer handling implemented  
✅ Message threading implemented  
✅ Escalation logic implemented  
⏳ Real-time WebSocket (planned)  
⏳ Notification system (in progress)  

---

## 📋 Summary

**Tickets come from 3 places:**

1. **🤖 AI Concierge (Mobile)** — Automatic escalation when AI detects critical issues
   - Powered by keyword analysis
   - Creates tickets with conversation context
   - Real-time handoff to human agents

2. **📱 Manual Support Request (Mobile)** — User explicitly creates ticket
   - Form-based entry
   - Supports attachments
   - Customer categorizes issue

3. **🌐 Admin Portal (Web)** — Support agents manage/create tickets
   - View all tickets
   - Filter & search
   - Update status & assign
   - Add internal notes

All tickets feed into single database and can be managed across platforms.
