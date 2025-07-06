# Pending Tasks

## Todo template

- [ ] Task
  - [ ] Sub-task

## Planned

- [ ] [Setting function] In setting admin can change garage info + banner image and those get displayed on the landing page.
  - [x] Garage info (name, phone, email, address) now displayed on landing page
  - [ ] Banner image functionality still needs implementation

## New Tasks

- [ ] [Settings] Make add employee only create profiles (not Supabase accounts); parameter is just name and role; assign employee to repair order line item by fetching profile.

  - [ ] Modify employee creation to only store in profiles table
  - [ ] Remove Supabase user account creation from employee flow
  - [ ] Update employee assignment to use profile data instead of auth users
  - [ ] Update repair order line item assignment logic

- [ ] [Inventory report page] Update the current inventory report logic to be calculated that way, no new UI is needed, only logic update.

  - [ ] Update beginning stock calculation to show inventory at start of selected month
  - [ ] Update addition calculation to show parts used during selected month
  - [ ] Update ending stock calculation with formula (beginning - addition)
  - [ ] Modify inventory report queries and server actions to use new calculation logic
  - [ ] Ensure existing UI columns display the updated calculated values

- [ ] [Inventory page] Show "ending stock" as above; plan to reuse function for code optimization.

  - [ ] Implement ending stock calculation in inventory page
  - [ ] Create reusable function for stock calculations
  - [ ] Optimize code by sharing logic between inventory and reports pages

- [ ] [Inventory page] Remove "add new part" button in inventory.

  - [ ] Remove add new part button from inventory page
  - [ ] Ensure part addition is only available through settings page

- [ ] [Vehicles/Reception pages] Add phone and address columns; unify columns: License plate | customer name | phone number | address | car brand.
  - [ ] Add phone number column to vehicles page
  - [ ] Add address column to vehicles page
  - [ ] Add phone number column to reception page
  - [ ] Add address column to reception page
  - [ ] Ensure consistent column order across both pages
  - [ ] Update data fetching to include phone and address information
