# Database Seeding Script - Setup Complete ✅

## Quick Start

The database seeding script is now ready to use!

```bash
pnpm db:seed
```

## Files Created

### 1. `scripts/seed-db.js`

Main seeding script that:

- Creates realistic test data for all database tables
- Generates 5-10 rows per table
- Respects all foreign key relationships
- Handles errors gracefully with detailed logging

### 2. `scripts/SEEDING.md`

Complete documentation including:

- Usage instructions
- What data gets created
- Prerequisites and setup
- Troubleshooting guide
- Example output

### 3. Updated `package.json`

Added new npm script:

```json
"db:seed": "node scripts/seed-db.js"
```

### 4. Updated `README.md`

Added Database Seeding section with quick instructions

## What Gets Seeded

| Table | Count | Details |
|-------|-------|---------|
| **Profiles** | 8 | User accounts with auth (2 admins, 6 employees) |
| **Customers** | 5-10 | Contact info, addresses |
| **Vehicles** | 5-10 | Linked to customers, random brands |
| **Spare Parts** | 10 | Pre-defined parts with prices |
| **Labor Types** | 8 | Service definitions with costs |
| **Repair Orders** | 5-10 | Linked to vehicles/users, various statuses |
| **Repair Order Items** | 20-40 | 2-4 per repair order (70% parts, 30% labor) |
| **Payments** | 5-10 | Linked to vehicles, cash/transfer methods |
| **System Settings** | 5 | Configuration values |

## Prerequisites

Set environment variables in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE=your_service_role_key
```

## Usage

```bash
# From project root
pnpm db:seed
```

## Key Features

✅ **No build tools needed** - Pure JavaScript  
✅ **Respects relationships** - All foreign keys valid  
✅ **Realistic data** - Random but sensible values  
✅ **Auth users created** - Can test login with seeded users  
✅ **Error handling** - Graceful failures with clear messages  
✅ **Detailed logging** - See exactly what was created  

## Notes

- Uses service role key (bypasses RLS for data insertion)
- Can be run multiple times to generate different datasets
- Created auth users can be used to test the application
- Format: `user-<random>@garage.test` with password `TestPassword123!`

## Related Files

- [scripts/SEEDING.md](SEEDING.md) - Full documentation
- [README.md](../README.md) - Project setup instructions
- [scripts/seed-db.js](seed-db.js) - Source code
