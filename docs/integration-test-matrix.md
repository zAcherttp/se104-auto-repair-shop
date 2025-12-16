# Integration Test Catalog

Below are eight tables (one per integration test module). Each row maps to a single `it()` case with a brief description and steps.

## Inventory Integration

ID|Test Case Description|Test Case Procedure|Expected Output|Inter-test case Dependence|Result|Test date|Note
-|-|-|-|-|-|-|-
INV-1|Decrease stock on item add|Create spare part (stock=50) → Create order → Add item qty=5 → Manually update stock to simulate app|Stock becomes 45|None|Pass|2025-12-16|From test/integration/modules/inventory.test.ts
INV-2|Increase stock on item delete|Create part (stock=40) → Create order → Add item qty=10 → Simulate stock 30 → Delete item → Restore to 40|Stock returns to 40|None|Pass|2025-12-16|From modules/inventory.test.ts
INV-3|Multiple parts stock decrease|Create part A(20), B(15) → Create order → Add items (A:2, B:1) → Update stocks 18 and 14|A=18, B=14|None|Pass|2025-12-16|From modules/inventory.test.ts
INV-4|Prevent negative stock (logic)|Create part (stock=5) → Create order → Add item qty=10 → Clamp update to ≥0|Stock=0, never negative|None|Pass|2025-12-16|From modules/inventory.test.ts
INV-5|Labor items don't affect stock|Create labor type → Create order → Add labor item|Item inserted; no stock change|None|Pass|2025-12-16|From modules/inventory.test.ts
INV-6|Mixed parts and labor in order|Create part and labor → Create order → Insert 2 items (part+labor)|Two items present; shapes correct|None|Pass|2025-12-16|From modules/inventory.test.ts
INV-7|Cumulative stock math|Create part (100) → Use 20 → Use 15 → Update stock each step|Final stock=65|None|Pass|2025-12-16|From modules/inventory.test.ts
INV-8|DB enforces non-negative stock|Update `spare_parts.stock_quantity` to -5 directly|Insert/update rejected (check_violation 23514)|None|Fail|2025-12-16|Missing DB CHECK constraint
INV-9|Low stock alert threshold|Query parts with `stock_quantity` ≤ 5|Part flagged in result set/view|None|Pass|2025-12-16|From modules/inventory.test.ts

## Payments Integration

ID|Test Case Description|Test Case Procedure|Expected Output|Inter-test case Dependence|Result|Test date|Note
-|-|-|-|-|-|-|-
PAY-1|Create payment updates vehicle total_paid|Create order (500k) → Create payment (200k) → Update vehicle.total_paid → Fetch vehicle|vehicle.total_paid=200k|None|Pass|2025-12-16|From modules/payments.test.ts
PAY-2|Multiple payments accumulate|Create order (1M) → Pay 300k then 200k → Update vehicle totals → Verify|vehicle.total_paid=500k; 2 payments|None|Pass|2025-12-16|From modules/payments.test.ts
PAY-3|Track payment methods|Create order → Insert 3 cash payments → Query methods|3 cash payments with amounts 100k/200k/300k|None|Pass|2025-12-16|From modules/payments.test.ts
PAY-4|Debt calculation accuracy|Create order (1M) → Pay 400k → Fetch with joins → Compute|Remaining debt=600k|None|Pass|2025-12-16|From modules/payments.test.ts
PAY-5|Fully paid vehicle has zero debt|Create order (500k) → Pay 500k → Fetch with joins|Debt=0|None|Pass|2025-12-16|From modules/payments.test.ts
PAY-6|Excess payment detection (calc)|Create order (500k) → Compute remaining → Compare with excessive amount|Excessive > remaining (calc only)|None|Pass|2025-12-16|From modules/payments.test.ts
PAY-7|Chronological payment history|Create 3 payments on ascending dates → Query ordered asc|Amounts 100k,200k,300k in order|None|Pass|2025-12-16|From modules/payments.test.ts
PAY-8|Link payments to creator|Create payment with `created_by` → Query|created_by matches user|None|Pass|2025-12-16|From modules/payments.test.ts
PAY-9|Track debt across many orders|Create 3 orders (300k+400k+500k) → Pay 600k → Compute|Total=1.2M; Paid=600k; Debt=600k|None|Pass|2025-12-16|From modules/payments.test.ts
PAY-10|Disallow negative payment amount|Insert payment with amount -100k|Rejected (check_violation 23514)|None|Fail|2025-12-16|Missing DB CHECK constraint
PAY-11|Disallow overpayment at DB level|Pay 200k on 300k debt then try another 200k|Second insert rejected by trigger|None|Fail|2025-12-16|Missing DB trigger

## Payment History Integration

ID|Test Case Description|Test Case Procedure|Expected Output|Inter-test case Dependence|Result|Test date|Note
-|-|-|-|-|-|-|-
PH-1|Join payment with creator profile|Create payment by user → Select with `created_by_profile:profiles(full_name)`|Row has `created_by_profile.full_name`|None|Pass|2025-12-16|From modules/payment-history.test.ts
PH-2|Default sort by date desc|Insert 3 payments with different dates → Select without order|Rows returned payment_date in desc order|None|Fail|2025-12-16|Missing default sort/view

## Vehicles Integration

ID|Test Case Description|Test Case Procedure|Expected Output|Inter-test case Dependence|Result|Test date|Note
-|-|-|-|-|-|-|-
VEH-1|Delete vehicle with related data|Create vehicle, order, payment → Delete ROI → Delete RO → Delete payments → Delete vehicle|All related rows gone; vehicle missing|None|Pass|2025-12-16|From modules/vehicles.test.ts
VEH-2|Aggregate vehicle debt|Create two orders (500k, 400k) + payments (200k,150k) → Join and sum|Repairs=900k, Paid=350k, Debt=550k|None|Pass|2025-12-16|From modules/vehicles.test.ts
VEH-3|Unique license plate enforced|Insert vehicle → Try insert with same license_plate|Rejected (unique_violation 23505)|None|Pass|2025-12-16|From modules/vehicles.test.ts
VEH-4|Auto-sync total_paid from payments|Insert two payments (100k,150k) → Fetch vehicle.total_paid|total_paid=250k by trigger/computed|None|Pass|2025-12-16|From modules/vehicles.test.ts

## Repair Orders Integration

ID|Test Case Description|Test Case Procedure|Expected Output|Inter-test case Dependence|Result|Test date|Note
-|-|-|-|-|-|-|-
RO-1|Replace items and update total|Create order → Add 2×Part A → Update total → Replace with 1×Part B → Update total|Items reflect Part B; total=Part B price|None|Pass|2025-12-16|From modules/repair-orders.test.ts
RO-2|Validate status transitions|Create order with status completed → Try set back to pending|Update rejected by validation|None|Fail|2025-12-16|Missing status FSM validation
RO-3|Auto-set completion_date|Create pending order → Update status to completed → Fetch|completion_date set automatically|None|Fail|2025-12-16|Missing trigger

## Repair Order Items Integration

ID|Test Case Description|Test Case Procedure|Expected Output|Inter-test case Dependence|Result|Test date|Note
-|-|-|-|-|-|-|-
ROI-1|Join spare and labor fields|Create order → Insert one spare item and one labor item → Select with joins|Both items present with nested fields|None|Pass|2025-12-16|From modules/repair-order-items.test.ts
ROI-2|Mutually exclusive item type|Try insert item with both `spare_part_id` and `labor_type_id`|Rejected (check_violation 23514)|None|Fail|2025-12-16|Missing DB CHECK constraint

## Reception Workflow Integration

ID|Test Case Description|Test Case Procedure|Expected Output|Inter-test case Dependence|Result|Test date|Note
-|-|-|-|-|-|-|-
REC-1|Create customer, vehicle, order|Insert customer → Insert vehicle → Insert repair order → Verify joins|Entities created; relations correct|None|Pass|2025-12-16|From workflows/reception.test.ts
REC-2|Minimal data flow|Create customer (name+phone) → Create vehicle → Create order|Order exists; optional fields null|None|Pass|2025-12-16|From workflows/reception.test.ts
REC-3|Reuse customer by phone|Create customer (phone) → Check by phone → Create vehicle using existing id|Single customer; new vehicle linked|None|Pass|2025-12-16|From workflows/reception.test.ts
REC-4|Customer with multiple vehicles|Create customer → Insert two vehicles → Query by customer|≥2 vehicles found|None|Pass|2025-12-16|From workflows/reception.test.ts
REC-5|License plate uniqueness|Insert vehicle → Attempt duplicate plate for same customer|Duplicate rejected|None|Pass|2025-12-16|From workflows/reception.test.ts
REC-6|Repair order requires valid vehicle|Insert repair order with fake `vehicle_id`|Insert rejected (FK violation)|None|Pass|2025-12-16|From workflows/reception.test.ts
REC-7|Multiple orders per vehicle|Create vehicle → Insert 2 orders → Query count|Count ≥ 2|None|Pass|2025-12-16|From workflows/reception.test.ts
REC-8|Daily reception limit enforced|Create up to limit vehicles then one extra|Extra insert rejected with limit message|None|Fail|2025-12-16|Missing daily limit policy
REC-9|Validate phone format|Insert customer with invalid phone string|Insert rejected (check_violation 23514)|None|Fail|2025-12-16|Missing phone format CHECK

## RLS Security Integration

ID|Test Case Description|Test Case Procedure|Expected Output|Inter-test case Dependence|Result|Test date|Note
-|-|-|-|-|-|-|-
RLS-1|Multi-tenant data isolation|Create 2 garages with users → Create vehicles/orders for each → Query by user|Users only see their garage's data|None|Pass|2025-12-16|From security/rls.test.ts
RLS-2|Isolate customer data by garage|Create 2 users → Create customer for each → Query by user context|Each user sees only their customers|None|Pass|2025-12-16|From security/rls.test.ts
RLS-3|Require valid user for repair orders|Create vehicle → Try insert order with non-existent user_id|Insert rejected (FK violation 23503)|None|Pass|2025-12-16|From security/rls.test.ts
RLS-4|Require valid user for payments|Create vehicle → Try insert payment with non-existent user_id|Insert rejected (FK violation 23503)|None|Pass|2025-12-16|From security/rls.test.ts
RLS-5|Identify admin via metadata|Create admin and employee users → Check isGarageAdmin flag|Admin=true, Employee=false|None|Pass|2025-12-16|From security/rls.test.ts
RLS-6|Both roles create repair orders|Create admin and employee → Each creates order → Verify both succeed|Both orders created successfully|None|Pass|2025-12-16|From security/rls.test.ts
RLS-7|Users access own created records|Create user → Create order as user → Query by created_by|User sees own records|None|Pass|2025-12-16|From security/rls.test.ts
RLS-8|Referential integrity across tables|Create user, vehicle, order, payment → Query with joins|All relationships maintained correctly|None|Pass|2025-12-16|From security/rls.test.ts
RLS-9|Profile created with user|Create new user → Query profiles table|Profile exists with same user.id|None|Pass|2025-12-16|From security/rls.test.ts
RLS-10|Admin status in user metadata|Create admin and employee → Check metadata|isGarageAdmin stored correctly|None|Pass|2025-12-16|From security/rls.test.ts
RLS-11|Prevent cross-employee profile edits|Create 2 employees → Try update other's profile|Update rejected (insufficient_privilege 42501)|None|Fail|2025-12-16|Missing RLS profile policy
RLS-12|Cascade delete user data|Create user with profile, orders, payments → Delete user|Related data cascaded or set NULL|None|Fail|2025-12-16|Missing cascade delete trigger
