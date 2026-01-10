# SwipeSavvy Admin Portal - Knowledge Base

## Critical Deployment Rules

### ALWAYS USE PRODUCTION BUILD FOR AWS DEPLOYMENT

**DO NOT** use Vite dev server (`npm run dev`) in production. This was a mistake that caused:
- Cache issues with stale files
- 404 errors when files changed
- Poor performance
- Unreliable deployments

**CORRECT APPROACH:**
1. Build locally: `npm run build`
2. Upload the `dist/` folder to server
3. Serve static files with `serve` package

**Deployment Command:**
```bash
./deploy.sh
```

The deploy script (`deploy.sh`) now:
1. Builds production bundle locally
2. Uploads `dist/` to AWS EC2
3. Uses `serve -s dist -l 5173` via PM2
4. Verifies HTTP 200 response

### Server Configuration

- **Server**: ec2-user@54.224.8.14
- **SSH Key**: ~/.ssh/swipesavvy-prod-key.pem
- **Remote Dir**: /var/www/swipesavvy-admin-portal
- **Port**: 5173
- **URL**: http://54.224.8.14:5173

### PM2 Process

The admin portal runs as a PM2 process serving static files:
```bash
pm2 start ./node_modules/.bin/serve --name swipesavvy-admin -- -s dist -l 5173
```

To check logs:
```bash
ssh -i ~/.ssh/swipesavvy-prod-key.pem ec2-user@54.224.8.14 'pm2 logs swipesavvy-admin'
```

## Component Patterns

### StatCard Props
Use `change` prop, not `trend`:
```tsx
<StatCard
  title="Total Users"
  value={1234}
  change={{ value: 12.5, trend: 'up' }}  // CORRECT
  // trend={12.5}  // WRONG - deprecated
/>
```

### Recharts Typing
Handle potentially undefined values:
```tsx
// Pie chart label
label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}

// Tooltip formatter
formatter={(value) => [(value as number).toLocaleString(), 'Count']}
```

## API Structure

The app uses a unified API layer (`src/services/api.ts`) that switches between mock and real APIs based on `VITE_USE_MOCK_API` environment variable.

Real API endpoints are in `src/services/apiClient.ts`.
Mock data is in `src/services/mockApi.ts`.
