# Repair Order Performance Tests

This directory contains 10 comprehensive performance tests for the repair order functionality of the automobile repair shop application.

## Test Overview

| Test ID       | Description                                           | Iterations | Success Criteria                  |
| ------------- | ----------------------------------------------------- | ---------- | --------------------------------- |
| PERF-ORDER-01 | Navigate to Vehicles page - measure page load and LCP | 3          | Median LCP ≤ 2500ms               |
| PERF-ORDER-02 | Create new repair order - end-to-end flow             | 5          | p95 ≤ 2000ms                      |
| PERF-ORDER-03 | Filter/search repair orders by status                 | 10         | p95 ≤ 1500ms                      |
| PERF-ORDER-04 | Update repair order details                           | 5          | p95 ≤ 1500ms                      |
| PERF-ORDER-05 | Delete repair order                                   | 3          | p95 ≤ 1500ms                      |
| PERF-ORDER-06 | Render list with 100+ records + scroll performance    | 3          | Initial render ≤ 3000ms, FPS ≥ 50 |
| PERF-ORDER-07 | Add multiple items (5) to order                       | 3          | Total time ≤ 2500ms               |
| PERF-ORDER-08 | View repair order details                             | 5          | p95 ≤ 1500ms                      |
| PERF-ORDER-09 | Update order status workflow                          | 5          | p95 ≤ 1200ms                      |
| PERF-ORDER-10 | Concurrent operations (3 users)                       | 1          | Success rate 100%                 |

## Prerequisites

1. **Environment Variables**: Ensure `.env.local` file exists with:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE=your_service_role_key
   ```

2. **Test User**: A valid user account with credentials:

   - Email: `saladegg24@gmail.com`
   - Password: `123456`

3. **Running Application**: The dev server must be running:
   ```bash
   pnpm dev
   ```

## Running Tests

### Run All Tests

```bash
pnpm exec playwright test e2e/order
```

### Run Specific Test

```bash
pnpm exec playwright test e2e/order/PERF-ORDER-01.spec.ts
```

### Run with UI Mode

```bash
pnpm exec playwright test e2e/order --ui
```

### Run in Debug Mode

```bash
pnpm exec playwright test e2e/order --debug
```

## Test Data Management

All tests automatically:

- **Create test data** before execution using the admin Supabase client
- **Clean up test data** after completion
- Test vehicles have license plates starting with `PERF-` or `TEST-`
- Test repair orders have notes containing "Performance test order" or "Seeded test repair order"

## Test Results

Results are saved to `test-results/` directory:

- Individual test results: `PERF-ORDER-XX-results.json`
- Screenshots on failure: `PERF-ORDER-XX-failure-Y.png`
- HTML report: `playwright-report/index.html`

### View HTML Report

```bash
pnpm exec playwright show-report
```

## Test Architecture

### Helper Functions (`helpers.ts`)

- `loginUser()`: Authenticates user for tests
- `createTestVehicles()`: Seeds vehicle data
- `createTestRepairOrders()`: Seeds repair order data
- `cleanupTestData()`: Removes all test data
- `calculatePercentile()`: Computes percentile values
- `saveTestResults()`: Writes results to JSON

### Key Features

1. **Serial Execution**: Tests run sequentially to avoid conflicts
2. **Automatic Cleanup**: Test data is removed even if tests fail
3. **Performance Metrics**: LCP, FPS, frame timing, memory usage
4. **Retry Logic**: Robust selectors with fallback strategies
5. **Detailed Logging**: Console output for debugging

## Performance Metrics Explained

- **LCP (Largest Contentful Paint)**: Time until largest content element is rendered
- **FPS (Frames Per Second)**: Scroll smoothness indicator (target: ≥50)
- **p50 (Median)**: 50th percentile - typical performance
- **p95**: 95th percentile - worst-case performance excluding outliers
- **CLS (Cumulative Layout Shift)**: Visual stability metric (target: <0.1)

## Troubleshooting

### Tests Fail with "No rows found"

- Ensure test data is created properly
- Check RLS policies allow admin client access
- Verify `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE` is set

### Authentication Fails

- Verify test user credentials are correct
- Check Supabase Auth is enabled
- Ensure user has `is_garage_admin` set if needed

### Tests Timeout

- Increase timeout in `playwright.config.ts`
- Check network conditions
- Verify dev server is running on port 3000

### Clean Up Test Data Manually

```bash
pnpm run clean:test-data
```

## CI/CD Integration

For continuous integration, run:

```bash
CI=true pnpm exec playwright test e2e/order
```

This will:

- Run tests with 2 retries
- Disable parallel execution
- Generate JSON and HTML reports
- Fail build on test failures

## Best Practices

1. **Run tests on stable environment**: Don't run during active development
2. **Review results holistically**: Single outliers may not indicate issues
3. **Monitor trends**: Track metrics over time
4. **Isolate network factors**: Use consistent network conditions
5. **Clean between runs**: Ensure fresh state for accurate results

## Contributing

When adding new performance tests:

1. Follow the naming convention: `PERF-ORDER-XX.spec.ts`
2. Use helper functions from `helpers.ts`
3. Document success criteria in test header
4. Clean up test data in `afterAll()`
5. Save results to JSON file
6. Update this README

## License

Part of SE104 Auto Repair Shop project.
