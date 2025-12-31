# SwipeSavvy Admin Portal (Enterprise UI)

This is a modern, enterprise-style **SwipeSavvy Admin Portal** scaffold built from the provided Branding Kit (design tokens + SVG icons).

## What you get

- ✅ Login page (mock authentication + demo credentials + error handling)
- ✅ Protected routes (redirects unauthenticated users to `/login`)
- ✅ Dashboard (4 stat cards + recent activity + chart placeholders)
- ✅ Placeholder pages implemented with real UI scaffolding:
  - Users Management
  - Analytics
  - Merchants
  - Settings
  - Support Dashboard
  - Support Tickets
  - Admin Users
  - Audit Logs
  - AI Marketing
  - Feature Flags
- ✅ UI component system (25+ components) in `src/components/ui`
- ✅ Zustand stores: `authStore`, `uiStore`, `toastStore`
- ✅ Mock API service layer (`src/services/mockApi.ts`) ready to swap for real endpoints
- ✅ Dark/light theme using SwipeSavvy CSS tokens (`src/styles/tokens.css`)

## Demo credentials

- **Email:** `admin@swipesavvy.com`
- **Password:** `Admin123!`

(You can change these in `src/services/mockApi.ts`.)

## Run locally

1. Open this folder in **VS Code**.
2. Install deps:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```

## Swap in your backend

All UI pages call the mocked API functions under:

- `src/services/mockApi.ts`

Replace those exports with real network calls (you can use the included `src/services/apiClient.ts`).

## Branding / Design Tokens

This project uses SwipeSavvy CSS variables from the kit:

- `src/styles/tokens.css`

To rebrand:
- Replace `tokens.css` with your own variables file.
- Icons are in `src/assets/icons/svg/...`.

---

Built for easy “drop-in replacement” in an existing admin portal repo.
