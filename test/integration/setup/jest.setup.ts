/**
 * Jest Setup for Integration Tests
 * 
 * Configures the test environment before running integration tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';

// Increase test timeout for database operations
jest.setTimeout(30000);

// Global setup - runs once before all tests
beforeAll(async () => {
  console.log('Starting integration test suite...');
});

// Global teardown - runs once after all tests
afterAll(async () => {
  console.log('Integration test suite completed');
});
