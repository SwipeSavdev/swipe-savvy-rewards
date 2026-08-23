# SwipeSavvy Rewards — Claude Code Context

> **How to use this file.** Claude Code auto-loads this file plus any nested
> `CLAUDE.md` found while walking the directory tree. Personal preferences go
> in `~/.claude/CLAUDE.md` or `CLAUDE.local.md` (both gitignored). Treat this
> file like code: review changes in PRs, prune ruthlessly.

## Project Overview

Full-stack fintech platform for card-linked rewards, AI-powered marketing, and digital wallet management. **The local checkout is the React Native + Expo mobile app** (package name `swipesavvy-mobile-app`). The broader platform spans multiple sibling repos: FastAPI backend (`swipesavvy-ai-agents/`), iOS SwiftUI app (`SwipeSavvy-iOS/`), Android Jetpack Compose app (`SwipeSavvy-Android/`), admin portal, wallet web, customer website, Terraform infra.

Last security audit: **2026-03-14**. Production-hardened across all layers.

## How to build / test / run locally

```bash
npm install
npm run start              # Expo dev server (web + iOS + Android)
npm run android            # native Android run
npm run ios                # native iOS run
npm run web                # web-only dev
npm run lint               # eslint src
```

## Conventions specific to this repo

- **Expo SDK + React Native.** No bare-RN — keep the managed workflow.
- **Card-linked reward processing is regulated** (PCI scope). Never store PAN / CVV — use tokenized references.
- **AI-powered marketing features** call sibling FastAPI service; don't reimplement here.

## Owners / on-call

- Primary: rewards-eng team.

## When NOT to touch this from Claude

- Card tokenization logic — PCI boundary.
- Wallet balance math — financial integrity.
- Ejecting from Expo — the managed workflow is load-bearing.

---

## See also

- [`.mcp.json`](.mcp.json) — project-scoped MCP servers (GitHub, Sentry, AWS). Each dev approves on first session.
- [`.githooks/pre-commit`](.githooks/pre-commit) — activate via `git config core.hooksPath .githooks`.
- Sister repos: `swipesavvy-ai-agents`, `SwipeSavvy-iOS`, `SwipeSavvy-Android`, `swipesavvy-admin-portal`, `swipesavvy-wallet-web`.
