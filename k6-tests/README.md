# k6 Load Testing for Auto Repair Shop

This directory contains k6 load tests for the automobile repair shop management system. Tests use higher-intensity configurations — per-test maxima vary (for example, up to 200 virtual users for the vehicle search test).

## Prerequisites

### Install k6

**Windows (using Chocolatey):**

```powershell
choco install k6
```

**Windows (using Scoop):**

```powershell
scoop install k6
```

**Windows (using winget):**

```powershell
winget install k6 --source winget
```

**Manual installation:**
Download from https://k6.io/docs/get-started/installation/

### Verify Installation

```powershell
k6 version
```

## Test Files

### 1. `smoke-test.js` - Minimal Load Test

- **VUs:** 2 users
- **Duration:** 2 minutes
- **Purpose:** Verify system works under minimal load

```powershell
k6 run k6-tests/smoke-test.js
```

### 2. `auth-test.js` - Authentication Flow Test

- **VUs:** Ramps to a peak of 50 users (10 → 25 → 50)
- **Duration:** ~5 minutes
- **Purpose:** Test login/logout and authenticated pages under heavier load
- **Max concurrent users:** 50

```powershell
k6 run k6-tests/auth-test.js
```

### 3. `api-test.js` - API Endpoint Test

- **VUs:** 50 constant users
- **Duration:** 5 minutes
- **Purpose:** Test API performance with sustained medium-high load
- **Max concurrent users:** 50

```powershell
k6 run k6-tests/api-test.js
```

### 4. `stress-test.js` - Stress Test

- **VUs:** Ramps up to 40 users max (10 → 25 → 40)
- **Duration:** ~11 minutes
- **Purpose:** Test system stability under higher stress
- **Max concurrent users:** 40

```powershell
k6 run k6-tests/stress-test.js
# or
pnpm load-test:stress
```

### 5. `user-journey-test.js` - End-to-End User Journey

- **VUs:** Ramps to a peak of 20 users (5 → 10 → 20)
- **Duration:** ~7 minutes
- **Purpose:** Test complete user workflow (login → navigate → search) under higher concurrency
- **Max concurrent users:** 20

```powershell
pnpm load-test:journey
```

### 6. `spike-test.js` - Spike Test

- **VUs:** Sudden spike from 5 → 50 users
- **Duration:** ~3.5 minutes
- **Purpose:** Test system resilience to sudden traffic spikes
- **Max concurrent users:** 50

```powershell
pnpm load-test:spike
```

### 7. `vehicles-api-test.js` - Vehicle Search API Load Test 🚗

- **VUs:** Ramps from 20 → 100 → 200 users
- **Duration:** ~10 minutes
- **Purpose:** Load test vehicle search, filter, pagination, and debt calculations at high scale
- **Max concurrent users:** 200
- **Tests:**
  - Vehicle page loading
  - License plate search
  - Brand filtering
  - Customer name search
  - Pagination
  - Debt calculations
  - Sorting
  - Multiple filters combined

```powershell
pnpm load-test:vehicles
```

## Configuration

Edit `config.js` to customize:

```javascript
{
  baseUrl: 'http://localhost:3000',  // Your app URL
  testUsers: [/* test user credentials */],
  scenarios: {/* Test scenarios - per-test VU limits vary (see each test file) */}
}
```

### Environment Variables

You can override configuration using environment variables:

```powershell
# Windows PowerShell
$env:BASE_URL="http://localhost:3000"; k6 run k6-tests/smoke-test.js

# Or set multiple variables
$env:BASE_URL="http://localhost:3000"
$env:TEST_USER_EMAIL_1="admin@example.com"
$env:TEST_USER_PASSWORD_1="securepass123"
k6 run k6-tests/auth-test.js
```

## Running Tests

### Before Running Tests

1. Start your Next.js application:

```powershell
pnpm dev --turbopack
```

2. Ensure test users exist in your database (see Test Data Setup below)

### Run Individual Tests

```powershell
# Smoke test (2 users)
pnpm load-test:smoke

# Auth test (peak 50 users)
pnpm load-test:auth

# API test (50 constant users)
pnpm load-test:api

# Stress test (ramp to 40 users)
pnpm load-test:stress

# User journey test (peak 20 users)
pnpm load-test:journey

# Spike test (sudden spike to 50 users)
pnpm load-test:spike

# Vehicles API test (peak 200 users)
pnpm load-test:vehicles

# Run all tests
pnpm load-test:all
```

### Run with Custom Options

```powershell
# Override VUs and duration (use with caution; ensure your environment can handle the load)
k6 run --vus 50 --duration 30s k6-tests/smoke-test.js

# Run with specific base URL
k6 run --env BASE_URL=http://localhost:3000 k6-tests/api-test.js

# Generate detailed output
k6 run --out json=test-results.json k6-tests/stress-test.js
```

## Test Data Setup

Create 10 test users in your Supabase database for load testing:

```sql
-- Insert 10 test users (adjust garage_id as needed)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES
  ('test1@example.com', crypt('password123', gen_salt('bf')), now(), '{"is_garage_admin": false}'::jsonb),
  ('test2@example.com', crypt('password123', gen_salt('bf')), now(), '{"is_garage_admin": false}'::jsonb),
  -- ... repeat for test3 through test10
  ('test10@example.com', crypt('password123', gen_salt('bf')), now(), '{"is_garage_admin": false}'::jsonb);
```

Or use the test credentials in `config.js` and create users through your application's signup flow.

## Understanding Results

### Key Metrics

- **http_req_duration**: Response time for HTTP requests

  - `p(95)`: 95th percentile (95% of requests faster than this)
  - `p(99)`: 99th percentile (99% of requests faster than this)
  - `avg`: Average response time

- **http_req_failed**: Percentage of failed requests

  - Should be < 5% for passing tests

- **http_reqs**: Total number of requests

  - Rate = requests per second

- **VUs**: Virtual Users (concurrent users)
  - **Per-test limits:** VU limits vary by test file (see each test's header for the peak VU).

### Thresholds

Tests will **FAIL** if:

- 95% of requests take longer than 2-3 seconds
- More than 5-10% of requests fail
- Less than 90% of logins succeed (auth test)

### Output Files

After tests complete, check:

- `*-summary.json`: Detailed metrics in JSON format
- `*-summary.html`: HTML report (api-test only)
- Console output: Real-time test progress

## Performance Benchmarks

### Example Expected Results (varies by test and load)

| Metric              | Target (low) | Target (high)      | Warning | Critical |
| ------------------- | ------------ | ------------------ | ------- | -------- |
| Response Time (p95) | < 1s         | < 3s (at high VUs) | 1-3s    | > 3s     |
| Response Time (p99) | < 2s         | < 5s (at high VUs) | 2-5s    | > 5s     |
| Error Rate          | < 1%         | < 5% (at high VUs) | 1-5%    | > 5%     |
| Requests/sec        | > 50         | > 100 (high VUs)   | 20-100  | < 20     |

## Troubleshooting

### Test Failures

1. **High error rate**: Check application logs, ensure all services are running
2. **Slow response times**: Check database queries, add indexes, optimize API calls
3. **Login failures**: Verify test user credentials, check auth service

### Common Issues

**k6 not found:**

```powershell
# Install k6 first (see Prerequisites)
choco install k6
```

**Connection refused:**

```powershell
# Ensure your app is running
pnpm dev --turbopack
```

**Authentication errors:**

```powershell
# Check test user credentials in config.js
# Ensure users exist in database
```

## Best Practices

1. **Always start with smoke test** before running larger tests
2. **Monitor your application** during tests (CPU, memory, database)
3. **Run tests in isolation** (no other heavy processes)
4. **Respect per-test limits and your environment capacity** - adjust VUs responsibly
5. **Create dedicated test data** - don't test with production data
6. **Clean up after tests** - remove test data if needed

## Advanced Usage

### Cloud Testing with k6 Cloud

```powershell
k6 cloud k6-tests/stress-test.js
```

### CI/CD Integration

```yaml
# Example GitHub Actions
- name: Run k6 load tests
  run: |
    k6 run --summary-export=results.json k6-tests/smoke-test.js
    k6 run --summary-export=results.json k6-tests/api-test.js
```

### Custom Metrics

All test files support custom metrics. Check `auth-test.js` for examples of:

- Custom success rates
- Response time trends
- Business-specific metrics

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Test Types](https://k6.io/docs/test-types/introduction/)
- [k6 Metrics](https://k6.io/docs/using-k6/metrics/)
- [k6 Thresholds](https://k6.io/docs/using-k6/thresholds/)

## Support

For issues or questions:

1. Check k6 documentation
2. Review test output and error messages
3. Check application logs during test execution
4. Verify test configuration in `config.js`
