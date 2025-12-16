# Login Performance Test Suite

## Overview

This directory contains comprehensive performance tests for the login functionality of the automobile repair shop management system. The test suite follows the PERF-LOGIN test case specifications and measures various performance aspects of the login flow.

## Test Cases

### PERF-LOGIN-01: Login Form Submission with Valid Credentials ✅

**File:** `PERF-LOGIN-01.spec.ts`

Measures end-to-end latency from form submission to successful redirect.

**Success Criteria:**

- p50 ≤ 2000ms
- p95 ≤ 3000ms
- Success rate: 100%
- All 10 attempts redirect to /reception

**Iterations:** 10 attempts

### PERF-LOGIN-02: Invalid Credentials Error Handling ✅

**File:** `PERF-LOGIN-02.spec.ts`

Measures error handling speed when invalid credentials are submitted.

**Success Criteria:**

- p95 ≤ 1500ms
- Error toast displays correct message
- No redirect occurs
- User remains on /login page

**Iterations:** 5 attempts
**Dependency:** PERF-LOGIN-01

### PERF-LOGIN-03: Core Web Vitals ✅

**File:** `PERF-LOGIN-03.spec.ts`

Measures critical rendering metrics using Performance APIs.

**Success Criteria:**

- LCP ≤ 2500ms
- FCP ≤ 1800ms
- TBT ≤ 300ms
- CLS ≤ 0.1
- Performance score ≥ 85

**Iterations:** 3 attempts (median values reported)

### PERF-LOGIN-04: Initial Load Time ✅

**File:** `PERF-LOGIN-04.spec.ts`

Measures page load performance from empty cache.

**Success Criteria:**

- p50 ≤ 1500ms
- p95 ≤ 2000ms
- All resources loaded without errors

**Iterations:** 5 attempts

### PERF-LOGIN-05: JavaScript Bundle Size ✅

**File:** `PERF-LOGIN-05.spec.ts`

Measures network transfer size of JavaScript resources.

**Success Criteria:**

- Total JS transfer size ≤ 250KB (gzipped)
- Total JS parsed size ≤ 800KB (uncompressed)
- All JS served with Content-Encoding: gzip

**Iterations:** Single comprehensive measurement

### PERF-LOGIN-06: Logout Flow Latency ✅

**File:** `PERF-LOGIN-06.spec.ts`

Measures session cleanup and redirect speed during logout.

**Success Criteria:**

- p95 ≤ 1000ms
- Redirect to /login completes
- Auth cookies cleared
- Cannot access /reception without re-login

**Iterations:** 5 attempts
**Dependency:** PERF-LOGIN-01

### PERF-LOGIN-07: Memory Baseline ✅

**File:** `PERF-LOGIN-07.spec.ts`

Detects memory leaks and measures heap usage.

**Success Criteria:**

- Average JS heap ≤ 8MB
- Max heap increase ≤ 10% between reloads
- No DOM node leaks detected

**Iterations:** 5 attempts
**Dependency:** PERF-LOGIN-03

### PERF-LOGIN-08: Form Input Responsiveness ✅

**File:** `PERF-LOGIN-08.spec.ts`

Measures keystroke and interaction lag.

**Success Criteria:**

- Average keystroke delay ≤ 50ms
- No visible lag during typing
- Password masking renders immediately

**Test:** Types 20 characters in each field

### PERF-LOGIN-09: Concurrent Login Sessions ✅

**File:** `PERF-LOGIN-09.spec.ts`

Simulates multiple users logging in simultaneously.

**Success Criteria:**

- Success rate ≥ 95% (≥4 out of 5 succeed)
- p95 ≤ 4000ms
- No race conditions or auth conflicts
- Each session isolated correctly

**Sessions:** 5 concurrent sessions
**Dependency:** PERF-LOGIN-01

### PERF-LOGIN-10: Form Validation Speed ✅

**File:** `PERF-LOGIN-10.spec.ts`

Measures client-side validation response time.

**Success Criteria:**

- All validation errors display ≤ 200ms
- Correct error messages shown
- Form submission blocked
- No server request made

**Tests:**

- Empty email field
- Invalid email format
- Short password
- Empty form

## Running the Tests

### Run All Login Performance Tests

```powershell
pnpm playwright test e2e/PERF-LOGIN-*.spec.ts
```

### Run Individual Test

```powershell
pnpm playwright test e2e/PERF-LOGIN-01.spec.ts
```

### Run with UI Mode

```powershell
pnpm playwright test e2e/PERF-LOGIN-01.spec.ts --ui
```

### Run in Debug Mode

```powershell
pnpm playwright test e2e/PERF-LOGIN-01.spec.ts --debug
```

## Test Results

Test results are automatically saved to the `test-results/` directory:

- **JSON Files:** `PERF-LOGIN-XX-results.json` - Detailed metrics and statistics
- **Screenshots:** `PERF-LOGIN-XX-*.png` - Visual captures at key points
- **HTML Report:** `playwright-report/index.html` - Full test execution report

### View HTML Report

```powershell
pnpm playwright show-report
```

## Configuration

Tests use the default Playwright configuration from `playwright.config.ts`. Key settings:

- **Browser:** Chromium
- **Headless:** True (for CI/CD)
- **Timeout:** 30 seconds per test
- **Retries:** 0 (to ensure accurate performance metrics)
- **Workers:** 1 (sequential execution for performance tests)

## Credentials

Tests use the following credentials:

- **Valid Login:**

  - Email: `saladegg24@gmail.com`
  - Password: `123456`

- **Invalid Login (PERF-LOGIN-02):**
  - Email: `test@example.com`
  - Password: `wrongpassword`

## Metrics Explained

### Percentiles

- **p50 (Median):** Middle value when results are sorted
- **p95:** 95% of results are faster than this value

### Core Web Vitals

- **LCP (Largest Contentful Paint):** Time until largest content element is visible
- **FCP (First Contentful Paint):** Time until first content is painted
- **TBT (Total Blocking Time):** Sum of blocking time for long tasks
- **CLS (Cumulative Layout Shift):** Visual stability metric (lower is better)

## Troubleshooting

### Test Failures

1. **Network Issues:** Ensure stable internet connection for Supabase auth
2. **Slow Performance:** Check system resources and close unnecessary applications
3. **Authentication Errors:** Verify credentials are valid in Supabase dashboard
4. **Timeout Errors:** Increase timeout in test configuration if needed

### Debugging Tips

1. Run tests with `--headed` flag to see browser actions
2. Use `--debug` flag to pause execution and inspect
3. Check screenshots in `test-results/` directory
4. Review JSON results for detailed metrics
5. Use browser DevTools to inspect network/performance

## Best Practices

1. **Consistent Environment:** Run on same machine for comparable results
2. **Close Other Apps:** Minimize background processes
3. **Network Stability:** Use wired connection for reliability
4. **Sequential Execution:** Don't run multiple performance tests in parallel
5. **Fresh Browser State:** Tests clear cache/cookies automatically

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
- name: Run Performance Tests
  run: pnpm playwright test e2e/PERF-LOGIN-*.spec.ts --reporter=json

- name: Upload Results
  uses: actions/upload-artifact@v3
  with:
    name: performance-results
    path: test-results/
```

## Contributing

When adding new performance tests:

1. Follow the naming convention: `PERF-LOGIN-XX.spec.ts`
2. Include detailed JSDoc comments
3. Export results to JSON for analysis
4. Add success criteria assertions
5. Include proper error handling and screenshots
6. Update this README with test details

## Related Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Project README](../README.md)
