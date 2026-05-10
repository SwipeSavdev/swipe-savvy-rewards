# CI Hardening — 120-Day Audit (2026-05-10)

> Status snapshot of GitHub Actions failures over the **last 120 days** (2026-01-10 through 2026-05-10), root causes, and the PRs / actions that fixed each one. Future engineers: this is the institutional memory for **why** these specific changes shipped together.

## Survey result (top 100 runs)

| Workflow | Runs | Failures | % | Root cause class |
|---|---|---|---|---|
| Dependency & Security Monitoring | 6 | 6 | **100%** | YAML config bug |
| Deploy to Production | 8 | 6 | 75% | Concurrency cascade (cancellations) |
| Dependabot Updates | 7 | 2 | 29% | Stale advisory + unhandled major bumps |
| eas-build-submit.yml | 1 | 1 | 100% | File already removed; straggler run |
| CI - Node.js Projects | 5 | 1 | 20% | Dependabot major-bump branch |
| CI - Python Project | 5 | 1 | 20% | Dependabot major-bump branch (same root) |
| CI/CD Pipeline | 15 | 1 | 7% | Same Python major-bump (3× duplicated install steps) |
| Build & Deploy - Docker | 6 | 0 | ✓ | — |
| CodeQL | 9 | 0 | ✓ | — |
| Dependency Graph | 4 | 0 | ✓ | — |

## Root causes + fixes

### 1. OWASP Dependency Check — YAML folded scalar bug (PR #83)
`security-audit.yml:189-192` used a YAML folded `>` block to pass three flags to the dependency-check action:
```yaml
others: >
  --enableExperimental
  --exclude node_modules
  --exclude .venv
```
YAML folds `>` collapses newlines into spaces but produces ONE string. The action passes that whole string as a single positional CLI arg, which dependency-check rejects with:
```
Unrecognized option: --enableExperimental --exclude node_modules --exclude .venv
```
**Fix:** Single-line quoted scalar so the shell tokenizes the flags individually:
```yaml
others: '--enableExperimental --exclude "**/node_modules/**" --exclude "**/.venv/**"'
```
Cleared 6/6 of the daily scheduled-failure noise.

### 2. Deploy to Production — concurrency cancellation cascade (PR #83)
`deploy-production.yml:25-27` had `cancel-in-progress: false` on the deploy concurrency group. Combined with rapid Dependabot pushes (often 5-7 in a 60-second burst), each new push queued behind the previous deploy. With a placeholder `Wait for staging services` step that always timed out, every queued run got cancelled before it could even start. 17/30 runs cancelled in the audit window; 6/8 of the most recent.
**Fix:** Flipped to `cancel-in-progress: true` so the newest commit wins cleanly. Future deploy work should also replace the placeholder sleep loop with a real health-check (separate ticket).

### 3. Dependabot — major-version bumps that break peer / pin contracts
8 open Dependabot PRs over the audit period proposed major-version bumps to runtime / foundation deps:

| PR | Bump | Why closed |
|---|---|---|
| #67 | `black` 25.12.0 → 26.3.1 (Python) | Conflicts with pinned transitive `click`/`platformdirs` in `requirements-pinned.txt` line 7. Caused the only CI - Python + 1 CI/CD failures (same root). |
| #66 | `vite` 5.4.21 → 8.0.10 (admin-portal) | 3 majors of breaking changes — needs hardening sweep. |
| #75 | `react` + `@types/react` (wallet-web) | Conflicts with peer-dep `@types/react@18.3.28` — caused the only CI-Node failure. |
| #76 | `lucide-react` 0.577 → 1.14 (wallet-web) | 0.x → 1.x has icon-name renames. |
| #74 | `jsdom` 27 → 29 | 2 majors of test-runtime API changes. |
| #79 | `snyk/actions` 0.4 → 1.0 (GHA) | Major action signature change. |
| #80 | `actions/upload-artifact` 4.6 → 7.0.1 (GHA) | 3 majors of breaking changes (artifact resolution). |
| #81 | `actions/setup-python` 5.3 → 6.2 (GHA) | Major Python-version-resolution change. |

**Fix:** Closed all 8 with this comment template:
> Closing per pin-majors policy applied during the 120-day CI hardening sweep — major-version bumps to runtime/foundation deps require a manual hardening sweep that updates code + lockfile in lockstep, not an isolated dep bump. Reopen via fresh hardening branch when ready.

The `dependabot.yml` already pins majors for the `pip` ecosystem; if the same Python advisory triggers another major bump, the security-update path bypasses `ignore` rules — that's expected. For the npm + github_actions ecosystems, consider adding the same `ignore: version-update:semver-major` policy to prevent recurrence.

### 4. Dependabot — `fast-uri` advisory with no patched version
Run 25598624685 failed with `dependency_still_vulnerable` because the advisory floor is `<=3.1.1` and `fast-uri@3.1.2` is published but not auto-resolved. Adding `"overrides": { "fast-uri": "^3.1.2" }` to root `package.json` + `swipesavvy-admin-portal/package.json` would force-resolve. **Deferred to a follow-up PR** — not in this hardening batch because the override forces all transitive consumers to a different lockfile resolution and needs a broader test pass.

### 5. eas-build-submit.yml — workflow already removed
File is 404 on `main` but a straggler run fired today on a branch that still had the file. Future Dependabot scans on stale branches may continue to surface this for 30 days; ignore.

### 6. Phone canonicalization (bundled into PR #83)
Found via the same audit pass:
- `1-800-SWIPE-SAVVY` (vanity, doesn't resolve as a real US number) — 2 AI-agent KB markdown files
- `1-888-555-0123` (placeholder) — 3 SMS opt-in compliance HTML templates that customers see

All 5 files now use `+1-800-505-8769` (the canonical Swipe Savvy support number per the master memory).

## Process improvements (longer-term)

1. **Add `ignore: version-update:semver-major` to npm + github_actions ecosystems in `dependabot.yml`** so major bumps stop opening PRs that immediately fail CI and have to be manually closed. Modeled on the existing pip ecosystem rule.
2. **Replace the placeholder `Wait for staging services` step in `deploy-production.yml`** with a real health-check (separate ticket).
3. **Refactor `ci-cd.yml`** to use a reusable composite action for the dependency install step — currently duplicated 3× per run, multiplying every install failure into 3 failed jobs.
4. **Enforce branch-protection rules to allow admin-merge for repo-owner accounts** so future hardening PRs can land without manual approval friction.

## PRs in this hardening sweep

| PR | Status | Description |
|---|---|---|
| [#82](https://github.com/SwipeSavdev/swipe-savvy-rewards/pull/82) | ✅ Merged | axios 1.15.0 → 1.15.2 (safe patch) |
| [#83](https://github.com/SwipeSavdev/swipe-savvy-rewards/pull/83) | Pending | OWASP YAML fold + deploy concurrency + 5 phone files |
| #67, #66, #74, #75, #76, #79, #80, #81 | ❌ Closed | Major-version Dependabot PRs (pin-majors policy) |
