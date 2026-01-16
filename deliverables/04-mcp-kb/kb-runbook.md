# Swipe Savvy KB Sync Runbook

## Overview

The KB Sync script crawls the SwipeSavvy monorepo and generates structured knowledge base indexes for:
- API documentation
- Component inventory
- File snapshots
- Infrastructure reference

## Local Usage

### 1. Setup

Ensure you're in the deliverables directory:

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/deliverables/04-mcp-kb
```

### 2. Run Sync

```bash
node kb-sync.js --config ./kb-config.json
```

### 3. View Output

Generated files appear in `generated/`:

```
generated/
├── index.md                          # Root KB index
└── projects/
    └── SWIPE_SAVVY/
        ├── snapshot-index.md         # File inventory
        ├── api-index.md              # API endpoints
        └── components.md             # Component inventory
```

## CI/CD Integration (GitHub Actions)

Add to your workflow:

```yaml
name: Sync MCP Knowledge Base

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # Nightly sync

jobs:
  sync-kb:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run KB Sync
        run: |
          cd deliverables/04-mcp-kb
          node kb-sync.js --config ./kb-config.json

      - name: Upload KB Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: kb-snapshot
          path: deliverables/04-mcp-kb/generated/
          retention-days: 30

      - name: Commit KB Updates (on main only)
        if: github.ref == 'refs/heads/main'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add deliverables/04-mcp-kb/generated/
          git diff --staged --quiet || git commit -m "chore: update KB snapshot [skip ci]"
          git push
```

## Configuration Reference

### kb-config.json Options

| Field | Type | Description |
|-------|------|-------------|
| `workspaceRoot` | string | Root directory to scan (relative to config) |
| `outputDir` | string | Where to write generated files |
| `projects` | array | List of projects to index |
| `projects[].name` | string | Project identifier |
| `projects[].repoGlobs` | array | Glob patterns for repo directories |
| `projects[].components` | array | Component definitions |
| `includePatterns` | array | File patterns to include |
| `excludePatterns` | array | File patterns to exclude |

### Example Configuration

```json
{
  "workspaceRoot": "../..",
  "outputDir": "generated",
  "projects": [
    {
      "name": "SWIPE_SAVVY",
      "repoGlobs": ["swipesavvy-*"],
      "components": [
        {
          "name": "mobile-app",
          "path": "swipesavvy-mobile-app-v2",
          "type": "frontend",
          "tech": ["react-native", "expo"]
        }
      ]
    }
  ],
  "includePatterns": [
    "README.md",
    "docs/**/*.md",
    "**/package.json"
  ],
  "excludePatterns": [
    "node_modules/**",
    ".git/**"
  ]
}
```

## Extending the KB Sync

### Add OpenAPI Parsing

```javascript
// In kb-sync.js, add:
function parseOpenApiSpec(filePath) {
  const yaml = require('js-yaml');
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content);
}
```

### Add Event Schema Parsing

```javascript
// Parse event schemas for topic/consumer matrix
function parseEventSchemas(schemasDir) {
  const schemas = [];
  // ... implementation
  return schemas;
}
```

### Generate Diff Summary

```javascript
// Compare current snapshot with previous
function generateDiffSummary(oldSnapshot, newSnapshot) {
  const added = [];
  const removed = [];
  const modified = [];
  // ... comparison logic
  return { added, removed, modified };
}
```

## Troubleshooting

### "ENOENT: no such file or directory"

Ensure `workspaceRoot` is correctly set relative to the config file location.

### Missing Files in Snapshot

Check `includePatterns` matches your file types. Add new patterns as needed:

```json
{
  "includePatterns": [
    "**/*.proto",      // Protocol buffers
    "**/*.graphql",    // GraphQL schemas
    "**/Dockerfile"    // Docker configs
  ]
}
```

### Slow Sync

Add more patterns to `excludePatterns` to skip large directories:

```json
{
  "excludePatterns": [
    "node_modules/**",
    ".expo/**",
    "dist/**",
    "build/**",
    "coverage/**",
    "*.lock"
  ]
}
```

## Related Documentation

- [Swipe Savvy Master Prompt](../../SWIPE_SAVVY_MASTER_PROMPT.md)
- [Agent Prompts](../01-agent-prompts/SWIPE_SAVVY_AGENT_PROMPTS.md)
- [Repo Mapped Plan](../02-repo-mapped-plans/SWIPE_SAVVY_REPO_MAPPED_PLAN.md)
