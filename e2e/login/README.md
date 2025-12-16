# E2E Performance Testing

This directory contains end-to-end performance tests using Playwright.

## Test Cases

### PERF-LOGIN-01: Login Form Performance

- **Description**: Measures end-to-end latency from form submit to successful redirect
- **Iterations**: 10 attempts
- **Success Criteria**:
  - p50 ≤ 2000ms
  - p95 ≤ 3000ms
  - Success rate: 100%
  - All attempts redirect to /reception

## Setup

1. Install Playwright:

```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

2. Ensure test user exists in Supabase with credentials in `.env.test`

3. Start the dev server:

```bash
pnpm dev
```

## Running Tests

### Run all e2e tests:

```bash
pnpm test:e2e
```

### Run with UI mode (interactive):

```bash
pnpm test:e2e:ui
```

### Run in headed mode (see browser):

```bash
pnpm test:e2e:headed
```

### Run specific performance test:

```bash
pnpm test:perf:login
```

## Results

Test results are saved to:

- `test-results/PERF-LOGIN-01-results.json` - Detailed JSON metrics
- `playwright-report/` - HTML test report

## Important Notes

- Tests include Supabase auth latency in measurements
- Tests run sequentially (workers: 1) to avoid conflicts
- Each test attempt includes automatic logout to ensure clean state
- Performance metrics include p50, p95, min, max, and average timings
