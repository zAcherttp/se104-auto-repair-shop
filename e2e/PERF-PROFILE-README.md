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

### 🚧 PERF-PROFILE-06: Delete Employee

**Status:** To be implemented

Measures deletion speed and UI update.

**Success Criteria:**

- p95 ≤ 1200ms
- Success toast displays
- Employee removed from UI immediately
- Profile deleted from DB

**Iterations:** 3 attempts
**Dependency:** PERF-PROFILE-04

### 🚧 PERF-PROFILE-07: Add Employee Dialog Load Time

**Status:** To be implemented

Measures dialog render performance.

**Success Criteria:**

- p95 ≤ 300ms
- Dialog renders completely
- All fields visible
- Form is immediately interactive

**Iterations:** 5 attempts
**Dependency:** PERF-PROFILE-01

### 🚧 PERF-PROFILE-08: Role Selector Dropdown Performance

**Status:** To be implemented

Measures dropdown render and interaction speed.

**Success Criteria:**

- Average dropdown open time ≤ 100ms
- Selection updates immediately
- No keyboard navigation lag

**Dependency:** PERF-PROFILE-07

### 🚧 PERF-PROFILE-09: Concurrent Employee Operations

**Status:** To be implemented

Simulates multiple admin actions simultaneously.

**Success Criteria:**

- Success rate 100% (all 3 operations succeed)
- No data conflicts
- All contexts show updated data
- No duplicate or missing records

**Dependencies:** PERF-PROFILE-04, 05, 06

### 🚧 PERF-PROFILE-10: Employee Table Pagination/Scrolling

**Status:** To be implemented

Measures large list performance with 100+ employees.

**Success Criteria:**

- Initial render ≤ 3000ms
- Scroll FPS ≥30
- All 100 employees render without crash
- Memory usage stable

**Iterations:** 3 attempts
**Dependency:** PERF-PROFILE-02

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
- Database seeded with employee records for PERF-PROFILE-02, 10
- Clean database state for CRUD tests (04, 05, 06)

## Test Data Setup

For PERF-PROFILE-02 and PERF-PROFILE-10, seed the database with test employees:

```sql
-- Insert 50+ test employees (example)
INSERT INTO profiles (user_id, garage_id, full_name, created_at, updated_at)
SELECT
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'Test Employee ' || generate_series,
  NOW(),
  NOW()
FROM generate_series(1, 50);
```

## Results

Test results are saved to:

- **JSON:** `test-results/PERF-PROFILE-XX-results.json`
- **Screenshots:** `test-results/PERF-PROFILE-XX-*.png`
- **HTML Report:** `playwright-report/index.html`

## Test Status

- ✅ Implemented: 3 tests
- 🚧 Pending: 7 tests
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
