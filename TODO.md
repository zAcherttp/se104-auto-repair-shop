# TODO or future considerations of app

## Todo template

- [ ] Task

  - [ ] Sub-task

### Planned

- [ ] [Task page] boom
- [ ] [Setting function] In setting admin can change garage info + banner image and those get displayed on the landing page.

### Done ✓

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
