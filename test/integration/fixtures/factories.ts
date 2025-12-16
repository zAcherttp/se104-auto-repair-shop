/**
 * Test Data Factories
 *
 * Provides factory functions to create test data with realistic defaults
 */

import type { Database } from "@/supabase/types";
import { createTestClient } from "../setup/supabase-test";

type Customer = Database["public"]["Tables"]["customers"]["Insert"];
type Vehicle = Database["public"]["Tables"]["vehicles"]["Insert"];
type RepairOrder = Database["public"]["Tables"]["repair_orders"]["Insert"];
type SparePart = Database["public"]["Tables"]["spare_parts"]["Insert"];
/**
 * Creates a test user via Supabase Auth
 */
export async function createTestUser(options?: {
  email?: string;
  password?: string;
  isGarageAdmin?: boolean;
  garageId?: string;
}) {
  const client = createTestClient();

  // Generate truly unique email with timestamp + random
  const email =
    options?.email ||
    `test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}@test.com`;
  const password = options?.password || "TestPassword123!";

  // If trying to use a specific email, check if user exists first
  if (options?.email) {
    try {
      // Try to delete existing user with this email if it exists
      const { data: users } = await client.auth.admin.listUsers();
      if (users?.users) {
        const existingUser = users.users.find((u) => u.email === options.email);
        if (existingUser) {
          try {
            await client.auth.admin.deleteUser(existingUser.id);
            // Give it a moment to delete
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (e) {
            console.debug(`Failed to delete existing user: ${e}`);
          }
        }
      }
    } catch (e) {
      console.debug(`Error checking for existing user: ${e}`);
    }
  }

  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      is_garage_admin: options?.isGarageAdmin ?? false,
    },
  });

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  // Create profile entry
  if (data.user) {
    // First try to delete any existing profile (in case of cleanup failure)
    try {
      await client.from("profiles").delete().eq("id", data.user.id);
    } catch (e) {
      // Ignore - profile might not exist
    }

    const { error: profileError } = await client.from("profiles").insert({
      id: data.user.id,
      email: email,
      full_name: email.split("@")[0],
      role: options?.isGarageAdmin ? "admin" : "employee",
    });

    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }
  }

  return {
    id: data.user.id,
    email,
    password,
    isGarageAdmin: options?.isGarageAdmin ?? false,
  };
}

/**
 * Creates a test garage (via profile)
 */
export async function createTestGarage(options?: {
  name?: string;
  adminEmail?: string;
}) {
  const adminUser = await createTestUser({
    email: options?.adminEmail || `admin-${Date.now()}@test.com`,
    isGarageAdmin: true,
  });

  // For multi-tenant testing, garage_id is managed via user metadata
  // Return a synthetic garage ID for testing purposes
  return {
    garageId: `test-garage-${Date.now()}`,
    adminUserId: adminUser.id,
    adminEmail: adminUser.email,
  };
}

/**
 * Creates a test customer
 */
export async function createTestCustomer(options?: Partial<Customer>) {
  const client = createTestClient();

  const customerData: Customer = {
    name: options?.name || `Test Customer ${Date.now()}`,
    phone:
      options?.phone ||
      `090${Math.floor(Math.random() * 10000000)
        .toString()
        .padStart(7, "0")}`,
    address: options?.address || "123 Test Street",
    email: options?.email || null,
    ...options,
  };

  const { data, error } = await client
    .from("customers")
    .insert(customerData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test customer: ${error.message}`);
  }

  return data;
}

/**
 * Creates a test vehicle
 */
export async function createTestVehicle(
  options?: Partial<Vehicle> & { customerId?: string },
) {
  const client = createTestClient();

  // Create customer if not provided
  let customerId = options?.customerId;
  if (!customerId) {
    const customer = await createTestCustomer();
    customerId = customer.id;
  }

  const vehicleData: Vehicle = {
    license_plate:
      options?.license_plate || `TEST-${Math.floor(Math.random() * 1000)}`,
    brand: options?.brand || "Toyota",
    customer_id: customerId,
    total_paid: options?.total_paid || 0,
    ...options,
  };

  const { data, error } = await client
    .from("vehicles")
    .insert(vehicleData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test vehicle: ${error.message}`);
  }

  return data;
}

/**
 * Creates a test repair order
 */
export async function createTestRepairOrder(
  options?: Partial<RepairOrder> & {
    vehicleId?: string;
    createdBy?: string;
  },
) {
  const client = createTestClient();

  // Create vehicle if not provided
  let vehicleId = options?.vehicleId;
  if (!vehicleId) {
    const vehicle = await createTestVehicle();
    vehicleId = vehicle.id;
  }

  // Create user if not provided
  let createdBy = options?.createdBy;
  if (!createdBy) {
    const user = await createTestUser();
    createdBy = user.id;
  }

  const repairOrderData: RepairOrder = {
    vehicle_id: vehicleId,
    created_by: createdBy,
    status: options?.status || "pending",
    reception_date:
      options?.reception_date || new Date().toISOString().split("T")[0],
    total_amount: options?.total_amount || 0,
    notes: options?.notes || null,
    ...options,
  };

  const { data, error } = await client
    .from("repair_orders")
    .insert(repairOrderData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test repair order: ${error.message}`);
  }

  return data;
}

/**
 * Creates a test spare part
 */
export async function createTestSparePart(options?: Partial<SparePart>) {
  const client = createTestClient();

  const partData: SparePart = {
    name: options?.name || `Test Part ${Date.now()}`,
    price: options?.price || 50000,
    stock_quantity: options?.stock_quantity || 10,
    ...options,
  };

  const { data, error } = await client
    .from("spare_parts")
    .insert(partData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test spare part: ${error.message}`);
  }

  return data;
}

/**
 * Creates a complete test scenario with customer, vehicle, and repair order
 */
export async function createCompleteTestScenario(options?: {
  customerName?: string;
  licensePlate?: string;
  garageId?: string;
}) {
  const customer = await createTestCustomer({ name: options?.customerName });
  const vehicle = await createTestVehicle({
    customerId: customer.id,
    license_plate: options?.licensePlate,
  });
  const user = await createTestUser({ garageId: options?.garageId });
  const repairOrder = await createTestRepairOrder({
    vehicleId: vehicle.id,
    createdBy: user.id,
  });

  return {
    customer,
    vehicle,
    user,
    repairOrder,
  };
}
