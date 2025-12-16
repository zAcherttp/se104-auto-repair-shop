This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a>
</p>
<br/>

## Features

- Vehicle repairing flow from reception to payment.
- Customer can search for their repair order and see its status + cost.
- Periodic reporting for garage metrics.

## Clone and run locally

1. You'll first need a Supabase project, which can be made [via the Supabase dashboard](https://database.new).

2. Set up the database with the schema provided in /supabase/schema.

3. Clone the repository:

   ```bash
   git clone https://github.com/zAcherttp/SE104-auto-repair-shop.git
   ```

4. Navigate to the project directory:

   ```bash
   cd SE104-auto-repair-shop
   ```

5. Install dependencies:

   ```bash
   pnpm i
   ```

6. Set up environment variables:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

7. (Optional) Seed the database with test data:

   ```bash
   pnpm db:seed
   ```

8. Start the development server:

   ```bash
   pnpm dev
   ```

### Database Seeding

To populate your database with realistic test data for development:

```bash
pnpm db:seed
```

This creates 5-10 rows for each table including customers, vehicles, repair orders, payments, and more. See [scripts/SEEDING.md](scripts/SEEDING.md) for details.
