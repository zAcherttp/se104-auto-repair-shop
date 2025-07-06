# Pending Tasks

## Todo template

- [ ] Task
  - [ ] Sub-task

## Planned

- [ ] [Setting function] In setting admin can change garage info + banner image and those get displayed on the landing page.

  - [x] Garage info (name, phone, email, address) now displayed on landing page
  - [ ] Banner image functionality still needs implementation

- [x] [TSK0706000] Fix payment dialog input formatting and add to order tracking
  - [x] Fix payment dialog to properly handle currency input (dot for thousands, comma for cents) - currently fails on inputs like $347.50
- [x] [TSK0706001] Add payment dialog to order tracking section on landing page
  - [x] Set created_by field to null when payment is made through order tracking dialog
