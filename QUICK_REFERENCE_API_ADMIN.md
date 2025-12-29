# Quick Reference - API & Admin Portal

## 🚀 Quick Start (3 Commands)

```bash
# Terminal 1: Backend API
cd ~/Documents/swipesavvy-ai-agents && python3 app/main.py

# Terminal 2: Admin Portal
cd ~/Documents/swipesavvy-admin-portal && npm run dev

# Terminal 3: Mobile App
cd ~/Documents/swipesavvy-mobile-app && npm start
```

---

## 📍 Endpoints Quick Reference

### Tickets
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/support/tickets` | Create ticket |
| GET | `/api/support/tickets` | List tickets |
| GET | `/api/support/tickets/{id}` | Get details |
| PUT | `/api/support/tickets/{id}` | Update ticket |
| POST | `/api/support/tickets/{id}/escalate` | Escalate |
| POST | `/api/support/tickets/{id}/messages` | Add message |

### Utilities
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/support/verify-customer` | Verify customer |
| GET | `/api/support/dashboard/metrics` | Get metrics |

---

## 🎨 Admin Portal Routes

```
/support/dashboard      # Metrics & charts
/support/tickets        # Ticket management
/admin/users           # User management
/admin/audit-logs      # Audit trail
```

---

## 💻 Mobile App Integration

```typescript
import { getSupportAPIService } from '@/services/SupportAPIService'

const api = getSupportAPIService()
await api.initialize()

// Create ticket
const ticket = await api.createTicket({
  customer_id: 'cust_123',
  category: 'technical',
  subject: 'Issue',
  description: 'Description...',
  priority: 'high'
})

// List tickets
const list = await api.listTickets('cust_123', 'open')

// Add message
const msg = await api.addMessage('TICKET-001', {
  message_content: 'Help please',
  sender_type: 'customer'
})

// Sync offline queue
await api.syncOfflineQueue()
```

---

## 🛠️ Development

### Add New API Endpoint
1. Add method to `app/routes/support.py`
2. Include error handling & logging
3. Test with `curl` or Postman
4. Document in `API_AND_ADMIN_INTEGRATION.md`

### Add Admin Portal Page
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation in `src/components/Sidebar.tsx`
4. Use Recharts for visualizations

### Add Mobile Service Method
1. Add method to `SupportAPIService`
2. Handle offline/cache logic
3. Add error handling
4. Include database operations

---

## 🔧 Troubleshooting

### API not responding
```bash
curl http://localhost:8000/health
pkill -f "uvicorn" && python3 app/main.py
```

### Database error
```bash
psql -h 127.0.0.1 -U postgres -d swipesavvy_agents
# Check .env.database for credentials
```

### Admin portal blank
```bash
rm -rf node_modules/.vite
npm install && npm run dev
```

### Mobile offline queue stuck
```typescript
const db = MobileAppDatabase.getInstance()
const queue = await db.getOfflineQueue()
console.log(queue)  // Check items
await api.syncOfflineQueue()  // Manual sync
```

---

## 📊 Database Quick Reference

| Database | Host | Port | Purpose |
|----------|------|------|---------|
| swipesavvy_agents | 127.0.0.1 | 5432 | Backend API |
| swipesavvy_admin | 127.0.0.1 | 5432 | Admin portal |
| swipesavvy_mobile.db | Device | N/A | Mobile app |

---

## 🧪 Testing Checklist

- [ ] Backend API health check (`/health`)
- [ ] Create ticket via API
- [ ] List tickets in admin portal
- [ ] Update ticket status
- [ ] Escalate ticket
- [ ] Add message to ticket
- [ ] Verify admin users page
- [ ] Check audit logs
- [ ] Test mobile offline queue
- [ ] Test metrics dashboard
- [ ] Export audit logs to CSV

---

## 📝 Files Reference

### Backend
- `app/main.py` - Entry point, includes support routes
- `app/routes/support.py` - All support endpoints (8 endpoints)

### Admin Portal  
- `src/pages/SupportDashboardPage.tsx` - Metrics (260 lines)
- `src/pages/SupportTicketsPage.tsx` - Tickets (220 lines)
- `src/pages/AdminUsersPage.tsx` - Users (310 lines)
- `src/pages/AuditLogsPage.tsx` - Logs (280 lines)
- `src/components/Sidebar.tsx` - Navigation menu
- `src/App.tsx` - Route configuration

### Mobile App
- `src/services/SupportAPIService.ts` - API client (350 lines)
- `src/database/MobileAppDatabase.ts` - Local database
- `src/database/config.ts` - Configuration

---

## 🔑 Key Features

✅ 8 REST endpoints  
✅ 4 admin pages with full UI  
✅ Real-time metrics  
✅ Ticket management (CRUD)  
✅ User management  
✅ Audit logging  
✅ Offline support  
✅ Request caching  
✅ Error handling  
✅ CSV export  

---

## 📚 Documentation

See `API_AND_ADMIN_INTEGRATION.md` for:
- Detailed endpoint documentation
- Request/response examples
- Admin portal feature overview
- Mobile integration guide
- Configuration instructions
- Troubleshooting guide
- Production checklist

---

## 🎯 Next Actions

1. Start all three services
2. Test endpoints with curl/Postman
3. Verify admin portal displays data
4. Test mobile app integration
5. Load test and optimize
6. Security audit
7. Deploy to production

---

**Status**: ✅ Ready for Integration Testing  
**Last Updated**: December 25, 2025
