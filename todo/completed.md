# Completed Tasks

## Done ✓

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
