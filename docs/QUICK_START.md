# Quick Start: Multi-Workspace Setup

**Status**: ✅ Complete | **Date**: December 25, 2025

---

## 🎯 Two Workspaces, One Backend

```
Mobile Wallet          Admin Portal          Backend
     ↓                      ↓                  ↓
React Native      +    React + Vite    →   API Server
 (port 8081)           (port 5173)      (port 3000)
```

---

## 📁 Workspace Locations

| App | Path | Port | Tech |
|-----|------|------|------|
| **Mobile Wallet** | `/swioe-savvy-mobile-wallet` | 8081 | React Native/Expo |
| **Admin Portal** | `/swioe-savvy-admin-portal` | 5173 | React + Vite |
| **Backend** | `/your/backend/path` | 3000 | Express/Node |

---

## 🚀 Quick Start (5 steps)

### 1️⃣ Install Dependencies
```bash
# Mobile Wallet
cd /Users/macbookpro/Documents/swioe-savvy-mobile-wallet
npm install

# Admin Portal
cd /Users/macbookpro/Documents/swioe-savvy-admin-portal
npm install
```

### 2️⃣ Start Backend (Terminal 1)
```bash
cd /your/backend/path
npm run dev
# → http://localhost:3000
```

### 3️⃣ Start Mobile Wallet (Terminal 2)
```bash
cd /Users/macbookpro/Documents/swioe-savvy-mobile-wallet
npm start
# or web: npm run web
```

### 4️⃣ Start Admin Portal (Terminal 3)
```bash
cd /Users/macbookpro/Documents/swioe-savvy-admin-portal
npm run dev
# → http://localhost:5173
```

### 5️⃣ Test Login
- Open http://localhost:5173 in browser
- Try login with test credentials
- Check Network tab for API calls

---

## 🔐 Environment Variables

### Admin Portal (`.env.local`)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
```

### Mobile Wallet (`.env` or `app.json`)
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## 🔗 API Endpoints

```
Login:
  POST /api/admin/auth/login

Dashboard:
  GET /api/admin/dashboard

Users:
  GET /api/admin/users
  POST /api/admin/users
  PUT /api/admin/users/:id
  DELETE /api/admin/users/:id

Feature Flags:
  GET /api/admin/feature-flags
  POST /api/admin/feature-flags
  PUT /api/admin/feature-flags/:id
  DELETE /api/admin/feature-flags/:id
```

---

## 🔧 Configuration Checklist

- [ ] Backend running on port 3000
- [ ] Backend CORS configured for:
  - `http://localhost:5173` (admin portal)
  - `http://localhost:8081` (mobile web)
- [ ] `.env.local` created in admin portal
- [ ] `VITE_API_BASE_URL` points to backend
- [ ] Mobile app environment configured
- [ ] Both apps can reach backend API

---

## 🛠 Troubleshooting

### Admin Portal Won't Connect to Backend
```bash
# 1. Check backend is running
curl http://localhost:3000/health

# 2. Verify environment variable
cat /Users/macbookpro/Documents/swioe-savvy-admin-portal/.env.local

# 3. Check browser Network tab for failed requests
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 5174
```

### CORS Error
Backend needs this configuration:
```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8081'],
  credentials: true
}));
```

---

## 📚 Full Documentation

- **Setup Guide**: `/swioe-savvy-admin-portal/WORKSPACE_CONNECTION_GUIDE.md`
- **Admin README**: `/swioe-savvy-admin-portal/README.md`
- **Complete Report**: `/swioe-savvy-mobile-wallet/WORKSPACE_SEPARATION_COMPLETE_REPORT.md`

---

## ✨ Key Features

✅ **Independent Workspaces** - Deploy separately  
✅ **Shared Backend** - Same API for both apps  
✅ **Centralized Config** - Environment-based settings  
✅ **Full Documentation** - Setup guides included  
✅ **Production Ready** - Tested and validated  

---

## 💡 Pro Tips

1. **Open 3 terminals** for all services
2. **Check Network tab** in DevTools for API calls
3. **Verify localStorage** for `admin_token` after login
4. **Use .env.example** as reference for variables
5. **Backend CORS** is critical - configure first

---

**Need help?** See documentation files linked above.  
**Last Updated**: December 25, 2025
