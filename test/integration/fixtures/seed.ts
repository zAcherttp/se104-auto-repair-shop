/**
 * Test Database Seeding and Cleanup Utilities
 *
 * Provides functions to seed deterministic test data and cleanup between tests
 */

import { createTestClient } from "../setup/supabase-test";

/**
 * Cleans all test data from the database
 * Should be called in afterEach or beforeEach hooks
 */
export async function cleanupDatabase() {
  const client = createTestClient();

  try {
    // Delete in reverse order to respect foreign keys
    // Use explicit queries for each table to maintain type safety
    await client
      .from("payments")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await client
      .from("repair_order_items")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await client
      .from("repair_orders")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await client
      .from("vehicles")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await client
      .from("customers")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await client
      .from("spare_parts")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await client
      .from("labor_types")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await client
      .from("profiles")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // Delete test users from auth.users
    // Note: This requires service role permissions
    const { data: users } = await client.auth.admin.listUsers();

    if (users?.users) {
      for (const user of users.users) {
        // Only delete users with test email pattern
        if (
          user.email?.includes("test-") ||
          user.email?.includes("@test.com")
        ) {
          await client.auth.admin.deleteUser(user.id);
        }
      }
    }
  } catch (error) {
    console.error("Error during database cleanup:", error);
    throw error;
  }
}

/**
 * Seeds the database with base test data
 * This creates minimal required data for tests to run
 */
export async function seedTestDatabase() {
  const client = createTestClient();

  try {
    // Seed base spare parts for inventory tests
    await client.from("spare_parts").insert([
      {
        id: "test-part-1",
        name: "Test Engine Oil",
        price: 100000,
        stock_quantity: 50,
      },
      {
        id: "test-part-2",
        name: "Test Brake Pad",
        price: 200000,
        stock_quantity: 30,
      },
    ]);

    // Seed base labor types
    await client.from("labor_types").insert([
      {
        id: "test-labor-1",
        name: "Test Oil Change",
        cost: 50000,
      },
      {
        id: "test-labor-2",
        name: "Test Brake Service",
        cost: 100000,
      },
    ]);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

/**
 * Seeds database and returns cleanup function
 * Useful for test setup
 */
export async function setupTestDatabase() {
  await cleanupDatabase();
  await seedTestDatabase();

  return async () => {
    await cleanupDatabase();
  };
}

// Note: For table-specific cleanup, use explicit table methods from cleanupDatabase
