# CI + E2E Implementation Plan (GitHub Actions)

## 1) Current state (codebase assessment)
- Stack: Node/Express server + Apollo GraphQL + React frontend bundled by webpack.
- Existing scripts (`package.json`): `lint`, `test` (Jest GraphQL integration), `build`, `start`.
- Current workflow coverage: only CLA check (`.github/workflows/cla.yml`).
- Current automated test depth: server GraphQL integration tests only (`server/tests/index.spec.js`).
- Gap summary:
  - No build/lint/test workflow on pull requests.
  - No end-to-end browser tests for onboarding and core merchant flows.
  - No artifact capture for debugging CI failures.

## 2) Target outcomes
1. Every PR to `main` runs lint + unit/integration tests + production build.
2. E2E suite validates critical merchant journeys in a repeatable CI environment.
3. Failures are diagnosable through uploaded reports, traces, and screenshots.
4. Pipeline remains fast via dependency caching and split jobs.

## 3) Recommended workflow architecture

### Workflow A: `ci.yml` (required on PR + push to main)
Jobs:
1. **lint**
   - `yarn install --frozen-lockfile --ignore-engines`
   - `yarn lint`
2. **test**
   - same install step
   - `NODE_ENV=test yarn test`
3. **build**
   - same install step
   - `yarn build`
   - upload `dist` artifact

Implementation notes:
- Use `actions/setup-node@v4` with Node `16.13.1` (matches `engines.node`).
- Enable Yarn cache in `setup-node`.
- Use `concurrency` to cancel superseded runs per branch.

### Workflow B: `e2e.yml` (required on PR, push to main, manual dispatch)
Jobs:
1. **e2e**
   - Install dependencies + Playwright browsers.
   - Boot app with test env (`NODE_ENV=test`) on a fixed local port.
   - Run Playwright tests headless.
   - Upload artifacts on failure (HTML report, traces, videos, screenshots).
2. **e2e-smoke-nightly** (optional scheduled trigger)
   - Runs smoke subset daily for drift detection.

## 4) E2E test strategy (exhaustive but maintainable)

### Tooling
- Add Playwright (`@playwright/test`) and config under `e2e/`.
- Use deterministic fixtures/mocks for Shopify-dependent APIs:
  - mock GraphQL/REST upstream responses where external auth is required.
  - keep one optional “real integration” profile for manual workflow dispatch.

### Scenario inventory (priority order)
1. **App shell loads**
   - root route renders without runtime errors.
2. **Onboarding happy path**
   - merchant accepts terms.
   - onboarding info completion.
   - onboarding completion state persisted.
3. **Onboarding validation/error states**
   - missing required fields.
   - failed mutation retry path.
4. **Settings page workflow**
   - settings fetch and save behavior.
5. **GraphQL failure resiliency**
   - API returns error; UI shows non-blocking error state.
6. **Regression checks**
   - route navigation, browser refresh, and persisted state.

### Reliability guardrails
- Use explicit `data-testid` selectors for stable locators.
- Disable animation/timing flake sources where possible.
- Capture trace on first retry and retain artifacts for failed retries.
- Retry policy: 1 retry in CI only.

## 5) Step-by-step implementation backlog

### Phase 1: CI foundation
- [ ] Add `.github/workflows/ci.yml` with lint/test/build split jobs.
- [ ] Add required status checks in branch protection (`lint`, `test`, `build`).
- [ ] Add dependency/cache strategy and concurrency cancellation.

### Phase 2: E2E harness
- [ ] Add Playwright dependencies and `playwright.config.*`.
- [ ] Add `yarn e2e` and `yarn e2e:headed` scripts.
- [ ] Add `e2e.yml` workflow with artifact uploads.

### Phase 3: Critical path coverage
- [ ] Implement onboarding happy-path and app-shell specs first.
- [ ] Add settings + error-path specs.
- [ ] Add screenshots for key checkpoints (success + error state).

### Phase 4: Hardening and speed
- [ ] Parallelize Playwright by project/spec grouping.
- [ ] Tag tests as `@smoke` vs `@full` and wire scheduled smoke run.
- [ ] Track flaky tests and quarantine policy.

## 6) Definition of done
- PRs are blocked unless `ci.yml` and `e2e.yml` required checks pass.
- E2E suite covers onboarding + settings + error paths with reproducible fixtures.
- Failed runs provide actionable artifacts (trace, screenshot, video, logs).
- Median CI runtime target: <= 10 minutes for PR pipelines.

## 7) Rollout recommendation for `skintwin-ai`
1. Start with required `ci.yml` and smoke E2E checks.
2. Expand to full E2E gating once flake rate is consistently low.
3. Reuse this workflow design as an org-standard template across `skintwin-ai` repositories.
