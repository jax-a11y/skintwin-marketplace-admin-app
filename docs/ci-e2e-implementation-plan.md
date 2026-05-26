# CI + E2E Implementation Plan (GitHub Actions)

> ✅ **Implementation Status: COMPLETE** (May 2026)
> 
> All phases of this plan have been implemented. See the sections below for implementation details.

## 1) Current state (codebase assessment)
- Stack: Node/Express server + Apollo GraphQL + React frontend bundled by webpack.
- Existing scripts (`package.json`): `lint`, `test` (Jest GraphQL integration), `build`, `start`.
- ~~Current workflow coverage: only CLA check (`.github/workflows/cla.yml`).~~
- ✅ **Updated:** Now includes `ci.yml`, `e2e.yml`, and `dependency-check.yml` workflows.
- Current automated test depth: server GraphQL integration tests only (`server/tests/index.spec.js`).
- ✅ **Updated:** E2E tests now cover app shell, onboarding, home, GraphQL, and SkinTwin integration.

## 2) Target outcomes
1. ✅ Every PR to `main` runs lint + unit/integration tests + production build.
2. ✅ E2E suite validates critical merchant journeys in a repeatable CI environment.
3. ✅ Failures are diagnosable through uploaded reports, traces, and screenshots.
4. ✅ Pipeline remains fast via dependency caching and split jobs.

## 3) Implemented workflow architecture

### Workflow A: `ci.yml` ✅
Location: `.github/workflows/ci.yml`

Jobs:
1. **lint** - ESLint for JS/JSX files
2. **test** - Jest tests with coverage upload to Codecov
3. **build** - Webpack production build with artifact upload

Features:
- Node 16.13.1 with Yarn cache
- Concurrency cancellation for superseded runs
- Build artifacts retained for 7 days

### Workflow B: `e2e.yml` ✅
Location: `.github/workflows/e2e.yml`

Jobs:
1. **e2e** - Playwright tests on push/PR
2. **e2e-smoke-scheduled** - Daily smoke tests at 5 AM UTC

Features:
- Chromium browser testing
- Automatic artifact upload on failure
- `@smoke` tag filtering for scheduled runs

### Workflow C: `dependency-check.yml` ✅
Location: `.github/workflows/dependency-check.yml`

Features:
- Weekly security audit (Monday 6 AM UTC)
- PR-triggered checks on package.json/yarn.lock changes
- GitHub Dependency Review integration

## 4) E2E test strategy (exhaustive but maintainable)

### Tooling ✅
- Playwright (`@playwright/test` v1.42.0) with config at `playwright.config.js`
- Test fixtures at `e2e/fixtures/graphql-mocks.js` and `e2e/fixtures/seed.js`
- GraphQL response mocking for isolated testing

### Implemented Test Suites

| File | Coverage | Tests |
|------|----------|-------|
| `e2e/app-shell.spec.js` | App loading, Polaris theme, navigation, responsive layout | 9 tests |
| `e2e/onboarding.spec.js` | Multi-step wizard, terms acceptance, completion redirect | 12 tests |
| `e2e/home.spec.js` | Introduction/overview states, product counts, error handling | 11 tests |
| `e2e/graphql.spec.js` | Query/mutation operations, error states, caching | 14 tests |
| `e2e/skintwin-integration.spec.js` | Integration settings, sync status, B2B companies | 12 tests |

### Reliability guardrails ✅
- `@smoke` tag for critical path tests
- 1 retry in CI with trace capture
- Screenshot/video on failure
- Network request mocking for deterministic tests

## 5) Implementation backlog (COMPLETED)

### Phase 1: CI foundation ✅
- [x] Add `.github/workflows/ci.yml` with lint/test/build split jobs.
- [x] Add dependency/cache strategy and concurrency cancellation.

### Phase 2: E2E harness ✅
- [x] Add Playwright dependencies and `playwright.config.js`.
- [x] Add `yarn e2e`, `yarn e2e:headed`, `yarn e2e:ui`, `yarn e2e:debug` scripts.
- [x] Add `e2e.yml` workflow with artifact uploads.

### Phase 3: Critical path coverage ✅
- [x] Implement app-shell specs.
- [x] Implement onboarding happy-path and error-state specs.
- [x] Implement home/overview specs.
- [x] Implement GraphQL integration specs.

### Phase 4: SkinTwin Integration ✅
- [x] Add `server/integrations/` module with API client SDK.
- [x] Extend GraphQL schema with B2B queries and sync mutations.
- [x] Add webhook handler for skintwin-integrations events.
- [x] Add database migration for sync metadata fields.
- [x] Implement integration E2E tests.

### Phase 5: Hardening ✅
- [x] Add `dependency-check.yml` for security audits.
- [x] Tag tests as `@smoke` for scheduled runs.
- [x] Configure trace/screenshot/video capture.

## 6) Definition of done ✅

All criteria met:
- [x] PRs are blocked unless `ci.yml` checks pass.
- [x] E2E suite covers onboarding + settings + error paths with reproducible fixtures.
- [x] Failed runs provide actionable artifacts (trace, screenshot, video, logs).
- [x] Median CI runtime target: <= 10 minutes for PR pipelines.

## 7) Rollout recommendation for `skintwin-ai`
1. ✅ Start with required `ci.yml` and smoke E2E checks.
2. Expand to full E2E gating once flake rate is consistently low.
3. Reuse this workflow design as an org-standard template across `skintwin-ai` repositories.

## Quick Reference

### Running Tests Locally

```bash
# Install dependencies
yarn install

# Run linting
yarn lint

# Run unit/integration tests
yarn test

# Run E2E tests
yarn e2e

# Run E2E tests with UI
yarn e2e:ui

# Run E2E tests in headed mode
yarn e2e:headed

# Debug E2E tests
yarn e2e:debug
```

### SkinTwin Integration

Environment variables for skintwin-ai integration:
```bash
SKINTWIN_API_URL=https://api.skintwin.ai
SKINTWIN_API_KEY=your-api-key
SKINTWIN_WEBHOOK_SECRET=your-webhook-secret
```

GraphQL queries:
- `b2bCompanies` - List B2B companies from Shopify
- `syncStatus` - Get current sync status
- `syncedAppointments` - List synced appointments
- `syncedProducts` - List synced products

GraphQL mutations:
- `enableSkintwinIntegration(platforms: [String]!)` - Enable integration
- `disableSkintwinIntegration` - Disable integration
- `triggerSync(platforms: [String])` - Trigger manual sync
