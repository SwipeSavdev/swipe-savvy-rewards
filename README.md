# SwipeSavvy Mobile App

React Native mobile wallet application with AI Concierge integration.

## Quick Start

```bash
npm install
npm start
```

## Project Structure

- `src/app/` - App entry, navigation, providers
- `src/features/` - Feature modules (auth, home, accounts, transfers, ai-concierge)
- `src/packages/ai-sdk/` - AI Concierge SDK
- `src/shared/` - Shared utilities
- `src/design-system/` - Design system components

## Key Features

- ✅ AI Concierge Chat (natural language assistant)
- ✅ Account management
- ✅ Money transfers
- ✅ Authentication
- ✅ Offline support
- ✅ Streaming responses

## Documentation

See [AI-MOBILE-INTEGRATION-PLAN.md](../swipesavvy-ai-agents/docs/AI-MOBILE-INTEGRATION-PLAN.md) for complete integration details.

## Development

```bash
npm run ios       # Run on iOS
npm run android   # Run on Android
npm test          # Run tests
npm run lint      # Lint code
```

## Backend Integration

Connects to `swipesavvy-ai-agents` backend:
- API: `http://localhost:8000`
- WebSocket: `ws://localhost:8000/ws`
- Streaming chat via Server-Sent Events

## Status

✅ Core structure scaffolded
✅ AI Concierge feature complete
✅ Navigation setup
✅ Authentication flow
⏳ Additional features (in progress)
