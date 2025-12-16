# Database Seeding Script

## Overview

The database seeding script (`scripts/seed-db.js`) populates your database with realistic test data across all tables.

## Usage

```bash
# Seed the database with random test data
pnpm db:seed
```

## Prerequisites

- Environment variables must be set in `.env.local`:

  ```
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_SERVICE_ROLE=your_service_role_key
  ```

- Environment variables must be set:

  ```bash
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_SERVICE_ROLE=your_service_role_key
  ```

- `tsx` must be installed (used to run TypeScript files directly)

  ```bash
  pnpm add -D tsx
  ```

## Features

- ✅ Respects all foreign key relationships
- ✅ Generates realistic random data
- ✅ Creates auth users with profiles
- ✅ Handles errors gracefully
- ✅ Provides detailed console output with seed counts
- ✅ Uses only valid enum values (e.g., payment methods)

## Example Output

```
🌱 Starting database seeding...

📝 Creating profiles...
  ✅ Created 8 profiles

👥 Creating customers...
  ✅ Created 7 customers

🚗 Creating vehicles...
  ✅ Created 9 vehicles

🔧 Creating spare parts...
  ✅ Created 10 spare parts

⚙️  Creating labor types...
  ✅ Created 8 labor types

📋 Creating repair orders...
  ✅ Created 8 repair orders

📦 Creating repair order items...
  ✅ Created 24 repair order items

💰 Creating payments...
  ✅ Created 6 payments

⚙️  Creating system settings...
  ✅ Created 5 system settings

✨ Database seeding completed successfully!

📊 Summary:
  - Profiles: 8
  - Customers: 7
  - Vehicles: 9
  - Spare Parts: 10
  - Labor Types: 8
  - Repair Orders: 8
  - Repair Order Items: 24
  - Payments: 6
  - System Settings: 5
```

## Notes

- The script uses the **service role key**, which bypasses Row Level Security policies
- Auth users are created for profiles, so you can use them to test the application
- All data is randomized, so you can run the script multiple times to generate different data sets
- If you need to clear the database first, you can use the integration tests' cleanup function or manually delete records from the Supabase dashboard

## Troubleshooting

### Missing environment variables

```
Error: Missing Supabase credentials...
```

**Solution**: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE` in your environment

### TypeScript compilation errors

```
Error: Cannot find module 'tsx'
```

**Solution**: Install tsx globally or add to devDependencies

```bash
pnpm add -D tsx
```

### Foreign key constraint errors

If you get constraint errors, your database schema might not be properly set up. Run your migrations first:

```bash
supabase db push
```
