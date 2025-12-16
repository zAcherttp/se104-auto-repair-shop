# Integration Test Defects

Below are the defects identified from integration test failures. Each defect represents a missing database constraint, trigger, or policy that should be implemented.

## Database Schema Defects

Defect ID|Module|Description|Type|Severity|Priority|Status|Created Date
-|-|-|-|-|-|-|-
DEF-001|Inventory|Missing CHECK constraint to enforce non-negative stock quantities in spare_parts table|Database Constraint|High|High|Open|2025-12-16
DEF-002|Payments|Missing CHECK constraint to prevent negative payment amounts in payments table|Database Constraint|High|High|Open|2025-12-16
DEF-003|Payments|Missing trigger to prevent total payments from exceeding total repair order amount|Database Trigger|Medium|Medium|Open|2025-12-16
DEF-004|Payment History|Missing default ORDER BY clause or view to sort payments by payment_date DESC|Database View|Low|Low|Open|2025-12-16
DEF-005|Repair Orders|Missing validation trigger to prevent invalid status transitions (e.g., completed → pending)|Database Trigger|Medium|Medium|Open|2025-12-16
DEF-006|Repair Orders|Missing trigger to auto-set completion_date when status changes to completed|Database Trigger|Medium|Low|Open|2025-12-16
DEF-007|Repair Order Items|Missing CHECK constraint to ensure spare_part_id and labor_type_id are mutually exclusive|Database Constraint|High|High|Open|2025-12-16
DEF-008|Reception|Missing trigger or policy to enforce daily vehicle reception limit per garage|Database Trigger|Low|Medium|Open|2025-12-16
DEF-009|Reception|Missing CHECK constraint to validate customer phone number format (09xx or 03xx, 10 digits)|Database Constraint|Medium|Medium|Open|2025-12-16
DEF-010|RLS Security|Missing RLS policy to prevent employees from updating other employees' profiles|RLS Policy|High|High|Open|2025-12-16
DEF-011|RLS Security|Missing CASCADE DELETE or SET NULL trigger for user-related data when user is deleted|Database Trigger|Medium|Medium|Open|2025-12-16

## Defect Details

### DEF-001: Non-negative Stock Constraint

- **Test Case**: INV-8
- **Current Behavior**: Allows negative stock quantities to be inserted/updated
- **Expected Behavior**: Reject with check_violation (23514)
- **Suggested Fix**: Add CHECK constraint `stock_quantity >= 0` to spare_parts table

### DEF-002: Non-negative Payment Constraint

- **Test Case**: PAY-10
- **Current Behavior**: Allows negative payment amounts to be inserted
- **Expected Behavior**: Reject with check_violation (23514)
- **Suggested Fix**: Add CHECK constraint `amount > 0` to payments table

### DEF-003: Overpayment Prevention Trigger

- **Test Case**: PAY-11
- **Current Behavior**: Allows total payments to exceed total repair order amounts
- **Expected Behavior**: Reject with trigger error when SUM(payments) > SUM(repair_orders.total_amount)
- **Suggested Fix**: Create BEFORE INSERT trigger on payments to validate total_paid <= total_repairs

### DEF-004: Default Payment Sort Order

- **Test Case**: PH-2
- **Current Behavior**: Returns payments in insertion order (ASC by default)
- **Expected Behavior**: Returns payments ordered by payment_date DESC by default
- **Suggested Fix**: Create database view with ORDER BY payment_date DESC or add default sort in query

### DEF-005: Status Transition Validation

- **Test Case**: RO-2
- **Current Behavior**: Allows invalid status transitions (e.g., completed → pending)
- **Expected Behavior**: Reject invalid transitions based on finite state machine rules
- **Suggested Fix**: Create trigger to validate status transitions follow: pending → in_progress → completed → delivered

### DEF-006: Auto-set Completion Date

- **Test Case**: RO-3
- **Current Behavior**: completion_date remains NULL when status changes to completed
- **Expected Behavior**: Auto-set completion_date to current timestamp when status becomes completed
- **Suggested Fix**: Create BEFORE UPDATE trigger to set completion_date when status = 'completed'

### DEF-007: Mutually Exclusive Item Type

- **Test Case**: ROI-2
- **Current Behavior**: Allows repair_order_items with both spare_part_id AND labor_type_id
- **Expected Behavior**: Reject with check_violation (23514)
- **Suggested Fix**: Add CHECK constraint `(spare_part_id IS NULL) != (labor_type_id IS NULL)`

### DEF-008: Daily Reception Limit

- **Test Case**: REC-8
- **Current Behavior**: No limit on daily vehicle receptions per garage
- **Expected Behavior**: Reject with error when daily limit exceeded
- **Suggested Fix**: Create trigger to count vehicles created today and reject if > limit from garage settings

### DEF-009: Phone Format Validation

- **Test Case**: REC-9
- **Current Behavior**: Allows invalid phone number formats in customers table
- **Expected Behavior**: Reject with check_violation (23514)
- **Suggested Fix**: Add CHECK constraint `phone ~ '^(09|03)[0-9]{8}$'` to customers table

### DEF-010: Profile Edit RLS Policy

- **Test Case**: RLS-11
- **Current Behavior**: Employees can update other employees' profiles
- **Expected Behavior**: Reject with insufficient_privilege (42501)
- **Suggested Fix**: Add RLS policy: `CREATE POLICY update_own_profile ON profiles FOR UPDATE USING (auth.uid() = id)`

### DEF-011: Cascade User Data Deletion

- **Test Case**: RLS-12
- **Current Behavior**: Orphaned records remain when user is deleted (created_by still references deleted user)
- **Expected Behavior**: Either cascade delete related records OR set created_by to NULL
- **Suggested Fix**: Modify foreign key constraints to `ON DELETE SET NULL` or create trigger to handle cleanup

## Priority Definitions

- **High**: Data integrity issue, could cause financial errors or security breaches
- **Medium**: Functional issue, affects user experience or data quality
- **Low**: Nice-to-have feature, minimal impact on core functionality

## Severity Definitions

- **High**: Critical data integrity or security issue
- **Medium**: Significant functional issue
- **Low**: Minor inconvenience or edge case
