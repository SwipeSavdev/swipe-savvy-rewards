# SwipeSavvy — Multi‑Repository Workspace

This package is a **multi-repo style workspace** intended to be opened in **VS Code multi-root workspaces**.

It includes:
- ✅ SwipeSavvy Admin Portal (existing tech stack kept)
- ✅ SwipeSavvy Wallet Web (NEW: customer account management website; bank-style UX)
- ✅ SwipeSavvy Customer Website (redesigned marketing site)
- ✅ SwipeSavvy Mobile App (included; base design system updated to use theme context)
- ✅ SwipeSavvy Mobile Wallet Native (included as an archive/reference — the wallet experience is now Web)
- ✅ SwipeSavvy AI Agents (included, unchanged)
- ✅ Shared Branding Kit assets

## Folder layout

```
/swipesavvy-suite
  /swipesavvy-admin-portal
  /swipesavvy-wallet-web
  /swipesavvy-customer-website
  /swipesavvy-mobile-app
  /swipesavvy-mobile-wallet-native
  /swipesavvy-ai-agents
  /shared/branding-kit
  /workspaces
```

## VS Code workspaces

Open one of the workspace files in `workspaces/`:

- `swipesavvy-all.code-workspace` — everything
- `swipesavvy-web.code-workspace` — Admin Portal + Wallet Web + Customer Website
- `swipesavvy-mobile.code-workspace` — mobile app repos
- `swipesavvy-ai-agents.code-workspace` — backend/agents

## Running locally

### Admin Portal

```bash
cd swipesavvy-admin-portal
npm install
npm run dev
```

### Wallet Web (Customer Portal)

```bash
cd swipesavvy-wallet-web
npm install
npm run dev
```

Demo credentials:
- Email: `customer@swipesavvy.com`
- Password: `Customer@123`

### Customer Website (marketing)

```bash
cd swipesavvy-customer-website
python3 -m http.server 3000
```

### Mobile App (Expo)

```bash
cd swipesavvy-mobile-app
npm install
npx expo start
```

### AI Agents

See `swipesavvy-ai-agents/README.md`.

## Notes

- No `node_modules/` folders are included in this upload (clean repo state).
- The **wallet experience is now web-first** (bank-style portal). The native wallet repo is provided for reference only.
- Each folder is structured to be its **own repository** (multi-repo architecture). You can split them into separate git repos at any time.
