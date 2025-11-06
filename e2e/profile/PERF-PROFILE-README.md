# Employee Profile Performance Test Suite (PERF-PROFILE)

## Overview

This directory contains comprehensive performance tests for the Employee Profile/Settings functionality. The test suite measures various aspects of employee management operations including navigation, rendering, CRUD operations, and concurrent user scenarios.

## Test Cases

### ✅ PERF-PROFILE-01: Navigate to Employees Tab

**File:** `PERF-PROFILE-01.spec.ts`

Measures page load and employee list render time.

**Success Criteria:**

- p50 ≤ 1500ms
- p95 ≤ 2000ms
- Employee table renders completely
- All columns (Name, Role, Actions) visible

**Iterations:** 5 attempts

### ✅ PERF-PROFILE-02: Load 50+ Employees

**File:** `PERF-PROFILE-02.spec.ts`

Measures rendering performance with large dataset.

**Success Criteria:**

- p95 ≤ 2500ms
- All 50 employees displayed
- Scroll performance ≥30 FPS
- No layout shifts during render

**Iterations:** 3 attempts
**Dependency:** PERF-PROFILE-01
**Note:** Requires database seeded with 50+ employees

### ✅ PERF-PROFILE-03: Search/Filter Employee List

**File:** `PERF-PROFILE-03.spec.ts`

Measures client-side filtering speed.

**Success Criteria:**

- p95 ≤ 300ms per filter operation
- Correct employees displayed
- No duplicate requests
- Results update smoothly

**Iterations:** 10 attempts
**Dependency:** PERF-PROFILE-02

### 🚧 PERF-PROFILE-04: Add New Employee

**Status:** To be implemented

Measures form submission and database write latency.

**Success Criteria:**

- p95 ≤ 2000ms
- Success toast displays
- New employee appears in table
- Profile record created in DB

**Iterations:** 5 attempts
**Dependency:** PERF-PROFILE-01

### 🚧 PERF-PROFILE-05: Edit Employee Information

**Status:** To be implemented

Measures update operation speed.

**Success Criteria:**

- p95 ≤ 1500ms
- Success toast displays
- Updated data visible immediately
- No stale data shown

**Iterations:** 5 attempts
**Dependency:** PERF-PROFILE-04

### ✅ PERF-PROFILE-05: Delete Employee

**File:** `PERF-PROFILE-05.spec.ts`

Measures deletion speed and UI update.

**Success Criteria:**

- p95 ≤ 1200ms
- Success toast displays
- Employee removed from UI immediately
- Profile deleted from DB

**Iterations:** 3 attempts
**Dependency:** PERF-PROFILE-04

### ✅ PERF-PROFILE-06: Add Employee Dialog Load Time

**File:** `PERF-PROFILE-06.spec.ts`

Measures dialog render performance.

**Success Criteria:**

- p95 ≤ 500ms
- Dialog renders completely
- All fields visible
- Form is immediately interactive

**Iterations:** 5 attempts
**Dependency:** PERF-PROFILE-01

### ✅ PERF-PROFILE-07: Role Selector Dropdown Performance

**File:** `PERF-PROFILE-07.spec.ts`

Measures dropdown render and interaction speed.

**Success Criteria:**

- Average dropdown open time ≤ 100ms
- Selection updates immediately (≤ 50ms)
- No keyboard navigation lag
- Admin and Employee options visible

**Iterations:** 5 attempts
**Dependency:** PERF-PROFILE-06

### ✅ PERF-PROFILE-08: Employee Table Pagination/Scrolling

**File:** `PERF-PROFILE-08.spec.ts`

Measures large list performance with 100+ employees.

**Success Criteria:**

- Initial render ≤ 3000ms
- Scroll FPS ≥ 30 (average and minimum)
- All 100 employees render without crash
- Memory usage stable (no leak)
- No layout shifts during scroll

**Iterations:** 3 attempts
**Dependency:** PERF-PROFILE-02
**Note:** Requires database seeded with 100+ employees

### 🚧 PERF-PROFILE-09: Concurrent Employee Operations

**Status:** To be implemented

Simulates multiple admin actions simultaneously.

**Success Criteria:**

- Success rate 100% (all 3 operations succeed)
- No data conflicts
- All contexts show updated data
- No duplicate or missing records

**Dependencies:** PERF-PROFILE-04, 05, 06

### 🚧 PERF-PROFILE-10: Employee Table Memory Leak Test

**Status:** To be implemented

Long-running test to verify memory stability.

**Success Criteria:**

- Memory growth < 20% over 100 operations
- No performance degradation over time
- Garbage collection works properly

**Iterations:** 100 operations
**Dependencies:** PERF-PROFILE-02, 08

## Running the Tests

### Run All Profile Performance Tests

```powershell
pnpm playwright test e2e/PERF-PROFILE
```

### Run Specific Test

```powershell
pnpm playwright test e2e/PERF-PROFILE-01.spec.ts
```

### Run in UI Mode

```powershell
pnpm playwright test e2e/PERF-PROFILE-01.spec.ts --ui
```

## Prerequisites

- Admin account credentials (default: saladegg24@gmail.com / 123456)
- Database access for automatic seeding (tests handle this)
- Supabase admin client configured in `supabase/admin.ts`
- Environment variables in `.env.local`:
  - `E2E_ADMIN_EMAIL`
  - `E2E_ADMIN_PASSWORD`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Test Data Setup

For PERF-PROFILE-02, seed the database with 50+ test employees.
For PERF-PROFILE-08, seed the database with 100+ test employees.

The tests automatically seed the database using `createAdminClient()` if insufficient records exist:

```typescript
// Automatic seeding happens in test.beforeAll()
// Tests will create employees with email pattern:
// perf.employee.{timestamp}.{random}@example.com
// perf.emp.{timestamp}.{random}@example.com
```

Manual seeding (optional):

```sql
-- Insert test employees
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT
  gen_random_uuid(),
  'perf.employee.' || generate_series || '@example.com',
  'Performance Test Employee ' || generate_series,
  'employee',
  NOW(),
  NOW()
FROM generate_series(1, 100);
```

## Results

Test results are saved to:

- **JSON:** `test-results/PERF-PROFILE-XX-results.json`
- **Screenshots:** `test-results/PERF-PROFILE-XX-*.png`
- **HTML Report:** `playwright-report/index.html`

## Test Status

- ✅ Implemented: 7 tests (01, 02, 03, 05, 06, 07, 08)
- 🚧 Pending: 3 tests (04, 09, 10)
- **Total:** 10 test cases

## Next Steps

1. Implement PERF-PROFILE-04 through 10
2. Set up database seeding scripts
3. Add cleanup procedures for test data
4. Integrate with CI/CD pipeline

## Related Documentation

- [Login Performance Tests](./login/README.md)
- [Playwright Documentation](https://playwright.dev/)
- [Project README](../README.md)
