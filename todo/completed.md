# Completed Tasks

## ✅ Integration Tests MVP (Nov 25, 2024)

### Summary

- **Duration**: 5 days
- **Total Test Cases**: 34 across 4 test files
- **Test Files Created**: 8 files (config, setup, fixtures, tests)
- **Status**: All MVP requirements completed ✅

### Day 1: Test Infrastructure ✅

- [x] Create `test/integration/setup/supabase-test.ts`
- [x] Add `.env.test.local.example` with Supabase test credentials template
- [x] Create `jest.config.integration.mjs` (timeout: 30s)
- [x] Implement `seedTestDatabase()` in `test/integration/fixtures/seed.ts`
- [x] Implement `cleanupDatabase()` for afterEach cleanup
- [x] Create test factories: `createTestGarage()`, `createTestUser()`, `createTestVehicle()`, etc.

### Day 2: Reception Workflow ✅

- [x] **Reception Integration Test** (`test/integration/workflows/reception.test.ts`)
  - Test: createReception with new customer → creates customer + vehicle + repair_order
  - Test: createReception with existing customer → reuses customer, creates vehicle + repair_order
  - Test: License plate uniqueness validation
  - Test: Multiple repair orders for same vehicle
  - **Total**: 10 test cases

### Day 3: Inventory Management ✅

- [x] **Inventory Integration** (`test/integration/modules/inventory.test.ts`)
  - Test: Adding repair_order_items decreases spare_parts.stock_quantity
  - Test: Deleting repair_order_items restores stock
  - Test: Labor types (no stock impact)
  - Test: Mixed spare parts + labor types in single order
  - Test: Negative stock prevention
  - **Total**: 8 test cases

### Day 4: Payment & Security ✅

- [x] **Payment Integration** (`test/integration/modules/payments.test.ts`)
  - Test: handleVehiclePayment creates payment record + updates vehicle.total_paid
  - Test: Payment validation (prevents exceeding debt)
  - Test: Multiple payments tracking (cumulative)
  - Test: Different payment methods
  - Test: Debt across multiple repair orders
  - **Total**: 9 test cases

- [x] **RLS Security** (`test/integration/security/rls.test.ts`)
  - Test: Multi-tenant data isolation
  - Test: Authentication requirements
  - Test: Admin vs employee permissions
  - Test: Profile creation with user
  - **Total**: 7 test cases

### Day 5: Documentation ✅

- [x] Update `test/README.md` with integration test instructions
- [x] Document test environment setup
- [x] Update `todo/tasks.md` with completion status

### Running Tests

```bash
pnpm test:integration              # Run all integration tests
pnpm test:integration:watch        # Watch mode
pnpm test:integration reception    # Specific test file
```

---

## Done ✓

- [x] Garage info (name, phone, email, address) now displayed on landing page

- [x] [TSK0706000] Fix payment dialog input formatting and add to order tracking
  - [x] Fix payment dialog to properly handle currency input (dot for thousands, comma for cents) - currently fails on inputs like $347.50
- [x] [TSK0706001] Add payment dialog to order tracking section on landing page
  - [x] Set created_by field to null when payment is made through order tracking dialog
- [x] [Reception page] remove status column

- [x] [Inventory page] Show "ending stock" of the inventory report page as stock quantity column as above; plan to reuse function for code optimization.

  - [x] Implement ending stock calculation in inventory page
  - [x] Create reusable function for stock calculations
  - [x] Optimize code by sharing logic between inventory and reports pages

- [x] [Inventory page] Remove "add new part" button in inventory.

  - [x] Remove add new part button from inventory page
  - [x] Ensure part addition is only available through settings page

- [x] [Inventory report page] Update the current inventory report logic to be calculated that way, no new UI is needed, only logic update.

  - [x] Update beginning stock calculation to show inventory at start of selected month
  - [x] Update addition calculation to show parts used during selected month
  - [x] Update ending stock calculation with formula (beginning - addition)
  - [x] Modify inventory report queries and server actions to use new calculation logic
  - [x] Ensure existing UI columns display the updated calculated values
  - [x] Update test files to match new calculation logic
  - [x] Update mock data to reflect new inventory calculation patterns

- [x] [Inventory report page] Fix inventory report calculation logic bug _(Completed 2025-01-07)_

  - [x] Fixed beginning stock calculation that was incorrectly incrementing
  - [x] Corrected stock calculation to properly show beginning stock + additions = ending stock
  - [x] Updated `calculateStockLevels` function in `lib/inventory-calculations.ts`
  - [x] Ensured ending stock properly reflects current stock levels
  - [x] Fixed time-based stock tracking to properly calculate beginning stock for selected periods
  - [x] Implemented correct formula: Beginning Stock - Usage During Period = Ending Stock

- [x] [Settings] Make add employee only create profiles (not Supabase accounts); parameter is just name and role; assign employee to repair order line item by fetching profile.

  - [x] Modified employee creation to only store in profiles table (no auth user creation)
  - [x] Removed Supabase user account creation from employee flow
  - [x] Updated createEmployee action to generate UUID for profile-only employees
  - [x] Updated updateEmployee and deleteEmployee to only work with profiles table
  - [x] Removed email and password fields from employee creation/edit forms
  - [x] Updated employees table display to remove email column
  - [x] Verified employee assignment logic works correctly with profile-only data
  - [x] Ensured repair order line item assignment uses profiles.id in assigned_to field

- [x] [Task page] boom
- [x] [Vehicles page] Implement the page with comprehensive vehicle management

  - [x] Created server action to fetch all vehicles with debt calculation
  - [x] Built responsive data table with sorting, filtering, and pagination
  - [x] Added columns for license plate, customer name, car brand, total debt
  - [x] Implemented payment action using existing payment-dialog component
  - [x] Added search functionality across all vehicle data
  - [x] Color-coded debt status with badges for easy identification

- [x] [Schema Migration] Updated database schema following the new payment structure

  - [x] Changed payments table to use vehicle_id instead of repair_order_id foreign key
  - [x] Added total_paid column to vehicles table
  - [x] Removed paid_amount column from repair_orders table
  - [x] Updated payment_method enum and payment system
  - [x] Cascaded changes to all server actions and client components
  - [x] Updated debt management, vehicle actions, and payment processing
  - [x] Fixed data fetching queries and component logic
  - [x] Updated invoices page to show vehicle and customer information for payments
  - [x] Enhanced payment receipt dialog with comprehensive payment details

- [x] [Reception/Debt Management] Refactor payment system and create debt management page

  - [x] Remove payment-related columns/actions from vehicle page
  - [x] Change debt column in vehicle page to show total of repair order
  - [x] Create new debt management page with search and date range
  - [x] Move payment functionality to debt management page
  - [x] Implement payment amount validation (not exceed debt)
  - [x] Generate QR payment images using VietQR integration

- [x] [Settings page] Implement comprehensive settings page with admin role protection

  - [x] Create settings page with tabbed interface (Garage Settings, Employees, Parts, Labor Types)
  - [x] Implement admin role-based access control
  - [x] Create server actions for CRUD operations on system_settings, spare_parts, labor_types
  - [x] Build employee management functionality
  - [x] Add forms for garage configuration
  - [x] Implement data tables for parts and labor types management

- [x] [Reports page] Implement the page.

  - [x] Create enhanced MonthYearPicker for monthly/yearly selection
  - [x] Create report types and server actions
  - [x] Implement sales analysis with B5.1/B5.2 details
  - [x] Implement inventory analysis with charts
  - [x] Create tab-based interface
  - [x] Fix hydration issues and infinite loops

- [x] [Reception page] fix Update + Payment dialog modals.
- [x] [Reception page] Consider using tanstack/react-tables for advanced table sorting, pagination, filters.
- [x] [Reports page] Clean up UI by removing B5.1 and B5.2 references

  - [x] Removed "B5.1 -" prefix from Detailed Sales Report title
  - [x] Removed "B5.2 -" prefix from Inventory Status Report title
  - [x] Updated type definitions to remove B5.1/B5.2 comments
  - [x] Maintained clean, descriptive titles for better user experience

- [x] [Reception page] Add employee assignment to repair line items
- [x] [Tasks page] Implement the page.
- [x] [Inventory page] Implement the page.
- [x] [Invoices page] Implement the page.

- [x] [Settings Actions] Refactored admin role checking to use Supabase auth metadata instead of profiles table

  - [x] Created admin client helper for service role access
  - [x] Updated checkAdminRole to use auth admin API for role verification
  - [x] Modified createEmployee to set role in user_metadata during user creation
  - [x] Updated updateEmployee to sync role changes to auth metadata
  - [x] Added promoteUserToAdmin helper function for initial admin setup
  - [x] Maintained profiles table as complementary data storage
  - [x] All functions now use proper admin authentication for security

- [x] [Settings Actions] Updated admin role checking to use boolean flag instead of string role

  - [x] Changed from checking `role` string to `is_garage_admin` boolean in user_metadata
  - [x] Updated createEmployee to set `is_garage_admin: true` when role is "admin"
  - [x] Updated updateEmployee to toggle `is_garage_admin` based on role selection
  - [x] Updated promoteUserToAdmin to set `is_garage_admin: true`
  - [x] Removed debugging console.log statements for production readiness
  - [x] More reliable admin checking using boolean flags in auth metadata

- [x] [Settings Actions] Fixed data fetching issue for existing users without is_garage_admin flag

  - [x] Updated checkAdminRole to fallback to profiles table when is_garage_admin is not set
  - [x] Added migrateExistingAdmins function to update existing admin users with proper metadata
  - [x] Ensures backward compatibility with users created before the boolean flag implementation
  - [x] Prevents access denied errors for legitimate admin users

- [x] [Settings Actions] Cleaned up user_metadata to only contain is_garage_admin

  - [x] Removed role and full_name from user_metadata (kept in profiles table only)
  - [x] Updated createEmployee to only set is_garage_admin in user_metadata
  - [x] Updated updateEmployee to only set is_garage_admin in user_metadata
  - [x] Updated promoteUserToAdmin to only set is_garage_admin in user_metadata
  - [x] Updated migrateExistingAdmins to only set is_garage_admin in user_metadata
  - [x] Modified getEmployees to allow any authenticated user (not just admins) for assignment purposes

- [x] [Settings Actions] Fixed employee creation errors

  - [x] Fixed duplicate key error by using upsert instead of insert for profiles
  - [x] Fixed role assignment issue - now correctly sets the selected role in profiles table
  - [x] Added small delay to handle potential database triggers
  - [x] Improved error handling to prevent false error toasts
  - [x] Ensured both auth metadata and profile data are correctly synchronized

- [x] [Employee Management] Enhanced delete action with proper confirmation dialog

  - [x] Created DeleteEmployeeDialog component with warning icons and detailed messaging
  - [x] Replaced browser confirm() with custom UI dialog
  - [x] Added loading state during deletion process
  - [x] Shows employee name in confirmation message
  - [x] Includes warning about permanent deletion and data loss
  - [x] Better user experience with proper visual feedback

- [x] [Reception Page] Added daily vehicle limit display next to search bar

  - [x] Added useDailyVehicleLimit hook to reception data table
  - [x] Created Badge component to show current count vs daily limit
  - [x] Display independent of date range selector (uses TanStack Query caching)
  - [x] Color-coded badge: destructive (at limit), secondary (near limit), outline (normal)
  - [x] Shows "Daily: X/Y" format with infinity symbol for unlimited
  - [x] Auto-refreshes every minute to keep count current
  - [x] Positioned next to search bar for easy visibility

- [x] [Landing Page] Added garage information display

  - [x] Created public getGarageInfo function to fetch garage settings without admin access
  - [x] Added useGarageInfo hook with TanStack Query for caching
  - [x] Updated landing page header to show garage name dynamically
  - [x] Added contact information section with phone, email, and address
  - [x] Used Lucide React icons for professional appearance
  - [x] Includes fallback values to prevent page breaking if settings not configured
  - [x] Auto-refreshes every 10 minutes to keep information current

- [x] [Setting function] Add setting to change max part and labor type in garage settings; validate part usage in repair rows against monthly limit.

  - [x] Add garage setting fields for max parts and labor types per month
  - [x] Implement validation during repair order creation
  - [x] Display current usage vs limit in relevant pages
  - [x] Add appropriate error messages when limits are exceeded

- [x] [Landing page] Group customer order tracking expenses into a single card (Total expense, paid, remaining).

  - [x] Refactor existing expense display to show consolidated view
  - [x] Create single card component with total, paid, and remaining amounts
  - [x] Ensure proper calculation and display of financial summary

- [x] [TSK0706000] Fix payment dialog input formatting and add to order tracking

  - [x] Fix payment dialog to properly handle currency input with proper decimal and thousand separators
  - [x] Enhanced CurrencyInput component with correct decimal separator (.) and group separator (,)
  - [x] Added placeholder text and step configuration for better user experience

- [x] [TSK0706001] Add payment dialog to order tracking section on landing page
  - [x] Created new OrderTrackingPaymentDialog component for public order tracking
  - [x] Set created_by field to null when payment is made through order tracking dialog
  - [x] Added payment functionality to ExpenseSummaryCard component
  - [x] Updated OrderDetails component to support payment success callbacks
  - [x] Enhanced track-order page to refresh data after successful payments
  - [x] Implemented proper debt calculation and validation for public payments

## Testing Infrastructure

- [x] [Testing] Implemented comprehensive testing infrastructure
  - [x] Created Jest configuration with ES modules support
  - [x] Set up React Testing Library with proper mocking
  - [x] Wrote comprehensive landing page tests
  - [x] Created TESTING.md documentation
  - [x] Added test scripts to package.json
  - [x] Configured polyfills and global mocks

## Documentation

- [x] [Documentation] Enhanced project documentation for AI agents

  - [x] Optimized FEATURE.instructions.md with comprehensive guidelines
  - [x] Added project context and technology stack documentation
  - [x] Created testing strategy and best practices guide
  - [x] Structured workflow and code quality standards
  - [x] Added AI agent-specific development guidelines

- [x] [Inventory page] Show "ending stock" of the inventory report page as stock quantity column as above; plan to reuse function for code optimization.

  - [x] Implement ending stock calculation in inventory page
  - [x] Create reusable function for stock calculations
  - [x] Optimize code by sharing logic between inventory and reports pages
  - [x] Update inventory columns to show "Ending Stock" instead of "Stock Quantity"
  - [x] Created shared utility function `/lib/inventory-calculations.ts` for stock calculations
  - [x] Refactored inventory reports to use shared logic
  - [x] Updated inventory page to display calculated ending stock values

- [x] [Inventory page] Remove "add new part" button in inventory.

  - [x] Remove add new part button from inventory page
  - [x] Ensure part addition is only available through settings page
  - [x] Updated inventory data table to handle optional add button
  - [x] Verified that parts can still be added through Settings > Parts tab

- [x] [Vehicles/Reception pages] Add phone and address columns; unify columns: License plate | customer name | phone number | address | car brand.

  - [x] Add phone number column to vehicles page
  - [x] Add address column to vehicles page
  - [x] Add phone number column to reception page (already existed)
  - [x] Add address column to reception page (already existed)
  - [x] Ensure consistent column order across both pages
  - [x] Update data fetching to include phone and address information
  - [x] Update VehicleWithDebt type to include address field
  - [x] Update test mock data to include address information
  - [x] Fixed TypeScript compilation errors and ESLint issues

- [x] [Inventory report page] Fix date range picker not affecting inventory report _(Completed 2025-01-07)_

  - [x] Fixed query key caching issue in `useReportsQuery` hook
  - [x] Updated inventory analytics query to include period in queryKey for proper cache invalidation
  - [x] Changed Date objects to ISO strings in query keys to prevent serialization issues
  - [x] Updated inventory table column header from "Additions" to "Used" (Vietnamese)
  - [x] Verified that inventory report (b52Report) now properly refreshes when date range changes
  - [x] Ensured sales and inventory reports both respond to date range picker changes consistently

- [x] [Inventory report] Rework inventory report APIs to fix caching and period filtering issues _(Completed 2025-01-07)_

  - [x] Created `useSparePartsQuery` hook to cache spare parts data with TanStack Query
  - [x] Created `useStockCalculationsQuery` hook to cache stock calculations by period
  - [x] Fixed SQL query syntax in inventory calculations (repair_orders!inner vs repair_order:repair_orders)
  - [x] Optimized inventory report to use parallel execution for spare parts and stock calculations
  - [x] Eliminated duplicate spare parts fetching between analytics and report functions
  - [x] Added proper SQL joins with !inner to ensure correct date filtering
  - [x] Verified variable naming scheme: `partsUsageDuringPeriod`, `totalUsageToDate`, `usageBeforePeriod` are logically correct
  - [x] Updated query key serialization to use ISO strings for better caching

- [x] [App Layout] Complete useAdmin hook integration with app sidebar _(Completed 2025-01-07)_

  - [x] Fixed incomplete `useAdmin` hook implementation
  - [x] Created `ProtectedLayoutClient` component to wrap sidebar with admin state
  - [x] Updated protected layout to use client component for admin detection
  - [x] Fixed inverted admin logic in AppSidebar (admins now get Settings access)
  - [x] Added Tasks navigation item to dashboard menu
  - [x] Implemented proper loading state with skeleton UI during admin check
  - [x] Used TanStack Query for caching admin status with 10-minute stale time
  - [x] Integrated admin boolean prop into AppSidebar component correctly

- [x] [Inventory Calculations] Fixed beginning stock calculation logic for period-based reports _(Completed 2025-01-07)_

  - [x] Fixed stock calculation logic where beginning stock was incorrectly calculated
  - [x] Corrected calculation: beginning stock = current stock + usage between previous month and current period + current period usage
  - [x] Ensured ending stock of one period becomes beginning stock of next period
  - [x] Optimized Supabase queries to run in parallel using Promise.all for better performance
  - [x] Fixed issue where July ending stock (32) should become August beginning stock (32), not 50
  - [x] Verified that stock calculations now properly track inventory across time periods

- [x] [Inventory Stock Management] Fixed stock quantity updates for spare parts inventory _(Completed 2025-01-07)_

  - [x] Identified root cause: `stock_quantity` in `spare_parts` table wasn't being updated when repair orders were modified
  - [x] Created `updateSparePartsStock` function to automatically update stock quantities when repair order items change
  - [x] Updated `updateRepairOrder` function to handle stock updates for full item replacement
  - [x] Updated `updateRepairOrderSmart` function to handle stock updates for granular CRUD operations
  - [x] Added support for tracking original quantities when updating items
  - [x] Created `recalculateAllSparePartsStock` function to fix existing data inconsistencies
  - [x] Ensured stock quantities now properly decrease when parts are used and increase when items are deleted
  - [x] Stock calculations now work correctly with dynamically updated stock quantities

- [x] [Inventory Calculation Simplification] Simplified inventory report calculations with dynamic stock _(Completed 2025-01-07)_

  - [x] Removed complex multi-period queries that were working backwards from static stock
  - [x] Simplified to use current dynamic stock quantities as the source of truth
  - [x] For period reports: beginning stock = current stock + usage during period
  - [x] For total reports: beginning stock = current stock + total usage to date
  - [x] Reduced from 4 parallel queries to 2 for period-based calculations
  - [x] Eliminated complex previous month calculations and usage windowing
  - [x] Much cleaner and more maintainable code with dynamic stock updates in place

- [x] [Landing Page] Internationalization - Vietnamese and English support _(Completed 2025-01-07)_

  - [x] Implemented next-intl for internationalization support
  - [x] Created i18n configuration in `i18n/request.ts` with cookie-based locale detection
  - [x] Added English messages file with comprehensive landing page translations
  - [x] Added Vietnamese messages file with proper translations
  - [x] Created LanguageSwitcher component with dropdown for language selection
  - [x] Updated landing page to use translation keys with useTranslations hook
  - [x] Enhanced providers to pass locale and messages to NextIntlClientProvider
  - [x] Updated root layout to fetch locale and messages from server
  - [x] Added language switcher to top-right corner of landing page
  - [x] Supports dynamic language switching with page reload and cookie persistence
  - [x] All landing page text now supports both English and Vietnamese
  - [x] Properly integrated with existing Next.js 15 App Router architecture

- [x] [Authentication Routes] Internationalization - Vietnamese and English support _(Completed 2025-01-07)_

  - [x] Extended i18n support to all authentication routes (login, track-order, error)
  - [x] Updated login page and form components to use translation keys
  - [x] Translated track-order page including search form and vehicle information
  - [x] Completed order-data-detail component translations for repair history
  - [x] Added translations for table headers (Description, Type, Amount, Order Total, Completed on)
  - [x] Translated error page with proper error messages
  - [x] Added comprehensive Vietnamese translations for all auth flows
  - [x] Updated translation files with all necessary keys for authentication routes
  - [x] Integrated language switcher in track-order page
  - [x] All authentication routes now fully support both English and Vietnamese
  - [x] Proper translation of status labels, form fields, and user messages
  - [x] Complete i18n coverage for landing page and authentication flow

- [x] [Payment Dialog] Refactored vehicle debt fetching to use TanStack Query hook _(Completed 2025-07-07)_

  - [x] Created `useVehicleDebt` hook for centralized vehicle debt data management
  - [x] Refactored OrderTrackingPaymentDialog to use TanStack Query instead of inline Supabase calls
  - [x] Removed `debtAmount` prop from payment dialog interface - now calculated internally
  - [x] Updated ExpenseSummaryCard to use useVehicleDebt hook for real-time debt information
  - [x] Implemented automatic refetching of debt data after successful payments
  - [x] Added loading states for debt information fetching
  - [x] Enhanced payment success handling with automatic data refresh
  - [x] Simplified track-order page payment success logic (hook handles data refresh)
  - [x] Improved caching and performance with TanStack Query for debt calculations
  - [x] Ensured payment amounts are always validated against current debt levels
