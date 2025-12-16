/**
 * Jest Setup for Integration Tests
 *
 * Configures the test environment before running integration tests
 */

// Increase test timeout for database operations
jest.setTimeout(30000);

// Validate environment configuration before running tests
function validateEnvironment() {
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE",
  ];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for integration tests: ${missing.join(
        ", ",
      )}\n\n` +
        `Copy .env.test.local.example to .env.test.local and fill in your test database credentials:\n` +
        `  cp .env.test.local.example .env.test.local\n\n` +
        `Then update the values with your Supabase test project credentials.`,
    );
  }
}

// Validate environment on test startup
validateEnvironment();

// Global setup - runs once before all tests
beforeAll(async () => {
});

// Global teardown - runs once after all tests
afterAll(async () => {
});
