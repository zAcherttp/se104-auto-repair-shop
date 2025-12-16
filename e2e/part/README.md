# Spare Parts / Inventory Performance Tests

This directory contains 10 comprehensive performance tests for the spare parts and inventory functionality of the automobile repair shop application.

## Test Overview

| Test ID      | Description                                            | Iterations | Success Criteria                   |
| ------------ | ------------------------------------------------------ | ---------- | ---------------------------------- |
| PERF-PART-01 | Navigate to Inventory page - measure page load and LCP | 3          | Median LCP ≤ 2500ms, Requests ≤ 30 |
| PERF-PART-02 | Load parts list with 50 items + pagination             | 10         | p95 ≤ 1200ms, Payload ≤ 250KB      |
| PERF-PART-03 | Search/filter parts by name or code                    | 10         | p95 ≤ 1500ms                       |
| PERF-PART-04 | Update spare part stock quantity                       | 5          | p95 ≤ 1200ms                       |
| PERF-PART-05 | View inventory summary/statistics                      | 5          | Cold ≤ 1800ms, Warm ≤ 600ms        |
| PERF-PART-06 | Add multiple spare parts (bulk 20)                     | 1          | Total ≤ 40s (avg 2s/part)          |
| PERF-PART-07 | Edit spare part with inventory change                  | 5          | p95 ≤ 1500ms                       |
| PERF-PART-08 | Delete spare part                                      | 3          | p95 ≤ 1200ms                       |
| PERF-PART-09 | Export inventory data                                  | 3          | p95 ≤ 2000ms                       |
| PERF-PART-10 | Concurrent operations (3 users)                        | 1          | Success rate 100%                  |

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

### Run All Part Tests

```bash
pnpm exec playwright test e2e/part
```

### Run Specific Test

```bash
pnpm exec playwright test e2e/part/PERF-PART-01.spec.ts
```

### Run with UI Mode

```bash
pnpm exec playwright test e2e/part --ui
```

### Run in Debug Mode

```bash
pnpm exec playwright test e2e/part --debug
```

## Test Data Management

All tests automatically:

- **Create test data** before execution using the admin Supabase client
- **Clean up test data** after completion
- Test spare parts have codes starting with `PERF-P-` or `PERF-BULK-`
- Isolated from production data via naming conventions

### Manual Cleanup

```bash
pnpm run clean:test-data
```

## Test Results

Results are saved to `test-results/` directory:

- Individual test results: `PERF-PART-XX-results.json`
- Screenshots on failure: `PERF-PART-XX-failure-Y.png`
- HTML report: `playwright-report/index.html`

### View HTML Report

```bash
pnpm exec playwright show-report
```

## Test Architecture

### Helper Functions (`helpers.ts`)

- `loginUser()`: Authenticates user for tests
- `navigateToInventory()`: Navigate to inventory page with fallbacks
- `createTestSpareParts()`: Seeds spare parts data
- `cleanupTestData()`: Removes all test data
- `calculatePercentile()`: Computes percentile values
- `saveTestResults()`: Writes results to JSON
- `captureNetworkMetrics()`: Tracks network requests and payload size

### Key Features

1. **Serial Execution**: Tests run sequentially to avoid conflicts
2. **Automatic Cleanup**: Test data is removed even if tests fail
3. **Performance Metrics**: LCP, network requests, payload size, FPS
4. **Retry Logic**: Robust selectors with fallback strategies
5. **Detailed Logging**: Console output for debugging
6. **Network Monitoring**: Request count and response size tracking

## Performance Metrics Explained

- **LCP (Largest Contentful Paint)**: Time until largest content element is rendered
- **Network Requests**: Total HTTP requests during page load
- **Payload Size**: Total size of response data (target: ≤250KB)
- **p50 (Median)**: 50th percentile - typical performance
- **p95**: 95th percentile - worst-case performance excluding outliers
- **CLS (Cumulative Layout Shift)**: Visual stability metric (target: <0.1)
- **Cold vs Warm**: First load vs subsequent cached loads

## Test Scenarios

### PERF-PART-01: Page Load

Measures initial navigation performance to inventory page with LCP and network request tracking.

### PERF-PART-02: List Rendering

Tests table rendering performance with 50+ items, including payload size validation.

### PERF-PART-03: Search/Filter

Measures search performance with debouncing, testing both name and part code searches.

### PERF-PART-04: Stock Update

Quick stock quantity adjustment performance test.

### PERF-PART-05: Summary Statistics

Tests cold vs warm load performance for inventory summary calculations.

### PERF-PART-06: Bulk Creation

Simulates adding 20 parts sequentially to measure bulk operation performance.

### PERF-PART-07: Edit Operations

Measures update performance with inventory tracking overhead.

### PERF-PART-08: Deletion

Tests deletion flow including confirmation dialog.

### PERF-PART-09: Data Export

Measures export functionality performance (CSV/Excel).

### PERF-PART-10: Concurrency

Multi-user simulation testing data consistency and race condition handling.

## Troubleshooting

### Tests Fail with "No table found"

- Ensure inventory page exists and is accessible
- Check navigation links in sidebar
- Verify RLS policies allow data access

### Authentication Fails

- Verify test user credentials are correct
- Check Supabase Auth is enabled
- Ensure user has proper permissions

### Test Data Not Created

- Verify `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE` is set
- Check admin client has proper permissions
- Review Supabase logs for errors

### Network Metrics Not Captured

- Ensure browser context allows network monitoring
- Check for CORS issues
- Verify response bodies are accessible

### Clean Up Test Data Manually

```bash
# Using Supabase SQL Editor
DELETE FROM spare_parts WHERE part_code LIKE 'PERF-%';
```

## CI/CD Integration

For continuous integration, run:

```bash
CI=true pnpm exec playwright test e2e/part
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
6. **Check payload sizes**: Large responses may indicate N+1 queries
7. **Validate caching**: Compare cold vs warm load times

## Database Schema

Tests assume the following `spare_parts` table structure:

```sql
CREATE TABLE spare_parts (
  id UUID PRIMARY KEY,
  part_code VARCHAR UNIQUE,
  part_name VARCHAR,
  category VARCHAR,
  unit VARCHAR,
  unit_price DECIMAL,
  quantity_in_stock INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Contributing

When adding new performance tests:

1. Follow the naming convention: `PERF-PART-XX.spec.ts`
2. Use helper functions from `helpers.ts`
3. Document success criteria in test header
4. Clean up test data in `afterAll()`
5. Save results to JSON file
6. Update this README

## Test Coverage Matrix

| Operation  | Tests          | Coverage |
| ---------- | -------------- | -------- |
| Read       | 01, 02, 05, 10 | ✅       |
| Create     | 06             | ✅       |
| Update     | 04, 07         | ✅       |
| Delete     | 08             | ✅       |
| Search     | 03             | ✅       |
| Export     | 09             | ✅       |
| Concurrent | 10             | ✅       |

## Performance Targets Summary

| Metric                 | Target   | Test |
| ---------------------- | -------- | ---- |
| Page Load LCP          | ≤ 2500ms | 01   |
| List Render (50 items) | ≤ 1200ms | 02   |
| Search Response        | ≤ 1500ms | 03   |
| Stock Update           | ≤ 1200ms | 04   |
| Summary Cold Load      | ≤ 1800ms | 05   |
| Summary Warm Load      | ≤ 600ms  | 05   |
| Bulk Add (20 parts)    | ≤ 40s    | 06   |
| Edit Operation         | ≤ 1500ms | 07   |
| Delete Operation       | ≤ 1200ms | 08   |
| Export Data            | ≤ 2000ms | 09   |
| Network Requests       | ≤ 30     | 01   |
| Payload Size           | ≤ 250KB  | 02   |

## Related Tests

- **Repair Order Tests**: `../order/` - Related repair order performance tests
- **Integration Tests**: `../../test/` - Unit and integration tests

## License

Part of SE104 Auto Repair Shop project.
