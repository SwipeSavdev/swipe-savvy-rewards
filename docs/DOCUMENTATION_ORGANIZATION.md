# 📚 Documentation Organization Best Practice

**Established**: December 25, 2025

---

## Policy: All Documentation Goes in `docs/` Folder

### Root Directory Rules

**Keep in root only:**
- `README.md` - Main project entry point
- `package.json` - Project dependencies
- Configuration files (tsconfig.json, vite.config.ts, etc.)
- Essential files (LICENSE, .gitignore, etc.)

**Move to docs/ folder:**
- All `.md` files (except README.md)
- Setup guides
- Architecture documentation
- API documentation
- Deployment guides
- Troubleshooting guides
- Any other documentation

---

## Directory Structure

### Admin Portal (New - Clean Structure)
```
swioe-savvy-admin-portal/
├── README.md                  ← Main entry point
├── START_HERE.txt            ← Quick visual guide (exception - entry point)
├── docs/                      ← All documentation here
│   ├── QUICK_START.md
│   ├── WORKSPACE_CONNECTION_GUIDE.md
│   ├── SETUP_COMPLETE.md
│   ├── DOCUMENTATION_INDEX.md
│   └── ...
├── src/
├── package.json
└── vite.config.ts
```

### Mobile Wallet (Existing - With Organized Docs)
```
swioe-savvy-mobile-wallet/
├── README.md                  ← Main entry point
├── docs/                      ← All documentation organized by category
│   ├── 00-Start-Here/
│   ├── 01-Concept-and-Discovery/
│   ├── 10-Deployment-Release-Operations/
│   │   ├── WORKSPACE_SEPARATION_COMPLETE_REPORT.md
│   │   ├── ADMIN_PORTAL_WORKSPACE_SEPARATION.md
│   │   └── WORKSPACE_SEPARATION_UPDATE.md
│   └── ...
├── src/
├── package.json
└── app.json
```

---

## For New Workspaces

When creating new workspaces or documentation:

### Setup
```bash
mkdir -p my-app/docs
```

### Files to Create/Move
```
my-app/
├── README.md              ← Entry point
├── docs/                  ← All docs go here
│   ├── QUICK_START.md
│   ├── SETUP_GUIDE.md
│   ├── API_REFERENCE.md
│   └── TROUBLESHOOTING.md
├── src/
├── package.json
└── config files
```

---

## Benefits

✅ **Cleaner Root** - Focus on project files, not documentation  
✅ **Better Organization** - All docs in one place  
✅ **Easier Navigation** - Clear docs/ folder structure  
✅ **Scalability** - Easy to add new documentation  
✅ **Professional Structure** - Industry best practice  

---

## Current Status

### ✅ Admin Portal - ORGANIZED
- All documentation moved to `docs/` folder
- Root directory clean
- `START_HERE.txt` points to `docs/` files
- README references `docs/` structure

### ✅ Mobile Wallet - ORGANIZED
- Workspace separation docs added to `docs/10-Deployment-Release-Operations/`
- Well-structured docs/ folder with categories
- All documentation in proper locations

---

## Going Forward

**Remember**: New documentation always goes in `docs/` folder.

Examples:
```bash
# ✅ Correct
docs/FEATURE_GUIDE.md
docs/DEPLOYMENT.md
docs/API_REFERENCE.md

# ❌ Don't do this
FEATURE_GUIDE.md
DEPLOYMENT.md
API_REFERENCE.md
```

---

**Last Updated**: December 25, 2025  
**Standard**: Documentation Organization Best Practice v1.0
