# Integration Tests

## Overview

Integration tests verify the interaction between different modules and the actual database. Unlike unit tests that mock dependencies, integration tests use a real Supabase test database.

## Setup

### 1. Create Test Database

Create a separate Supabase project for testing:

- Go to [supabase.com](https://supabase.com)
- Create a new project named "automobile-repair-shop-test"
- Run the same migrations as your production database

### 2. Configure Environment

Copy the environment template:

```bash
cp .env.test.local.example .env.test.local
```

Edit `.env.test.local` and add your test database credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE=your_test_service_role_key
```

⚠️ **Warning**: Never use production database for testing!

### 3. Run Integration Tests

```bash
# Run all integration tests
pnpm test:integration

# Run in watch mode
pnpm test:integration:watch

# Run specific test file
pnpm test:integration test/integration/workflows/reception.test.ts
```

## Test Structure

```
test/integration/
├── setup/
│   ├── supabase-test.ts    # Test database client
│   └── jest.setup.ts        # Jest configuration
├── fixtures/
│   ├── seed.ts              # Database seeding utilities
│   └── factories.ts         # Test data factories
├── workflows/
│   └── reception.test.ts    # Reception workflow tests
├── modules/
│   ├── inventory.test.ts    # Inventory integration tests
│   └── payments.test.ts     # Payment integration tests
└── security/
    └── rls.test.ts          # Row Level Security tests
```

## Test Utilities

### Database Cleanup

```typescript
import { cleanupDatabase } from '@/test/integration/fixtures/seed';

afterEach(async () => {
  await cleanupDatabase();
});
```

### Test Data Factories

```typescript
import { createTestUser, createTestVehicle } from '@/test/integration/fixtures/factories';

const user = await createTestUser({ email: 'test@example.com' });
const vehicle = await createTestVehicle({ licensePlate: 'TEST-123' });
```

### Supabase Test Client

```typescript
import { createTestClient } from '@/test/integration/setup/supabase-test';

const client = createTestClient(); // Admin client (bypasses RLS)
```

## Writing Integration Tests

### Example: Testing Reception Workflow

```typescript
import { createReception } from '@/app/actions/vehicles';
import { createTestClient } from '@/test/integration/setup/supabase-test';
import { cleanupDatabase } from '@/test/integration/fixtures/seed';

describe('Reception Workflow Integration', () => {
  afterEach(async () => {
    await cleanupDatabase();
  });

  it('creates customer, vehicle, and repair order', async () => {
    const formData = {
      customerName: 'John Doe',
      phoneNumber: '0901234567',
      licensePlate: 'ABC-123',
      carBrand: 'Toyota',
      receptionDate: new Date(),
    };

    const result = await createReception(formData);
    expect(result.error).toBeNull();

    // Verify data in database
    const client = createTestClient();
    const { data: customer } = await client
      .from('customers')
      .select()
      .eq('phone', formData.phoneNumber)
      .single();
    
    expect(customer).toBeDefined();
    expect(customer.name).toBe(formData.customerName);
  });
});
```

## Best Practices

1. **Cleanup**: Always cleanup database after each test
2. **Deterministic**: Use fixed IDs and timestamps for predictable results
3. **Isolation**: Each test should be independent
4. **Real Data**: Test with realistic data patterns
5. **Assertions**: Verify both success cases and database state

## Troubleshooting

### Tests Timing Out

- Check `.env.test.local` credentials
- Verify test database is accessible
- Increase timeout in `jest.config.integration.mjs`

### Database Connection Errors

- Ensure service role key is correct
- Check Supabase project is active
- Verify network connectivity

### RLS Policy Errors

- Use `createTestClient()` for admin operations
- Tests should bypass RLS for setup/teardown
- Use authenticated client for RLS testing

## CI/CD Integration

To run integration tests in GitHub Actions, add test database secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE`

Example workflow:

```yaml
- name: Run Integration Tests
  run: pnpm test:integration
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_SERVICE_ROLE: ${{ secrets.TEST_SERVICE_ROLE }}
```
