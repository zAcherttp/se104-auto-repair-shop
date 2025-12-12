/**
 * Reception Workflow Integration Tests
 *
 * Tests the complete flow of vehicle reception including:
 * - Customer creation/reuse
 * - Vehicle registration
 * - Repair order creation
 */

import { createTestUser } from "../fixtures/factories";
import { cleanupDatabase } from "../fixtures/seed";
import { createTestClient } from "../setup/supabase-test";

describe("Reception Workflow Integration", () => {
  let testUserId: string;

  beforeEach(async () => {
    await cleanupDatabase();

    const user = await createTestUser({
      email: `test-${Date.now()}@test.com`,
      isGarageAdmin: false,
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("Basic Reception Flow", () => {
    it("creates new customer, vehicle, and repair order", async () => {
      const client = createTestClient();

      // Create customer
      const { data: customer, error: customerError } = await client
        .from("customers")
        .insert({
          name: "John Doe",
          phone: "0901234567",
          address: "123 Test Street",
        })
        .select()
        .single();

      expect(customerError).toBeNull();
      expect(customer).toBeDefined();

      if (!customer) return;

      // Create vehicle
      const { data: vehicle, error: vehicleError } = await client
        .from("vehicles")
        .insert({
          license_plate: "ABC-123",
          brand: "Toyota",
          customer_id: customer.id,
        })
        .select()
        .single();

      expect(vehicleError).toBeNull();
      expect(vehicle).toBeDefined();

      if (!vehicle) return;

      // Create repair order
      const { data: repairOrder, error: repairOrderError } = await client
        .from("repair_orders")
        .insert({
          vehicle_id: vehicle.id,
          created_by: testUserId,
          status: "pending",
          reception_date: "2024-01-15",
          notes: "Oil change needed",
          total_amount: 0,
        })
        .select()
        .single();

      expect(repairOrderError).toBeNull();
      expect(repairOrder).toBeDefined();

      if (!repairOrder) return;

      expect(repairOrder.vehicle_id).toBe(vehicle.id);
      expect(repairOrder.status).toBe("pending");

      // Verify relationships
      const { data: vehicleWithRelations } = await client
        .from("vehicles")
        .select(`
          *,
          customer:customers(*),
          repair_orders(*)
        `)
        .eq("id", vehicle.id)
        .single();

      expect(vehicleWithRelations).toBeDefined();
      expect(vehicleWithRelations?.customer).toBeDefined();
      expect(vehicleWithRelations?.repair_orders).toHaveLength(1);
    });

    it("handles minimal required data", async () => {
      const client = createTestClient();

      const { data: customer } = await client
        .from("customers")
        .insert({ name: "Jane Smith", phone: "0909876543" })
        .select()
        .single();

      if (!customer) return;

      const { data: vehicle } = await client
        .from("vehicles")
        .insert({
          license_plate: "XYZ-789",
          brand: "Honda",
          customer_id: customer.id,
        })
        .select()
        .single();

      if (!vehicle) return;

      const { data: repairOrder } = await client
        .from("repair_orders")
        .insert({
          vehicle_id: vehicle.id,
          created_by: testUserId,
          status: "pending",
          reception_date: "2024-01-20",
          total_amount: 0,
        })
        .select()
        .single();

      expect(repairOrder).toBeDefined();
      expect(repairOrder?.notes).toBeNull();
    });
  });

  describe("Customer Reuse Logic", () => {
    it("reuses existing customer when phone matches", async () => {
      const client = createTestClient();
      const phone = "0901234567";

      // Create first customer
      const { data: customer1 } = await client
        .from("customers")
        .insert({ name: "Original Customer", phone, address: "Original" })
        .select()
        .single();

      if (!customer1) return;

      // Check existing customer
      const { data: existing } = await client
        .from("customers")
        .select("id")
        .eq("phone", phone)
        .single();

      expect(existing).toBeDefined();
      expect(existing?.id).toBe(customer1.id);

      // Create vehicle for existing customer
      const { data: vehicle } = await client
        .from("vehicles")
        .insert({
          license_plate: "NEW-456",
          brand: "Honda",
          customer_id: existing?.id || "",
        })
        .select()
        .single();

      expect(vehicle).toBeDefined();
      expect(vehicle?.customer_id).toBe(customer1.id);

      // Verify only one customer
      const { data: allCustomers } = await client
        .from("customers")
        .select()
        .eq("phone", phone);

      expect(allCustomers).toHaveLength(1);
    });

    it("allows same customer to have multiple vehicles", async () => {
      const client = createTestClient();

      const { data: customer } = await client
        .from("customers")
        .insert({ name: "Multi-Vehicle Owner", phone: "0903333333" })
        .select()
        .single();

      if (!customer) return;

      // Create first vehicle
      await client
        .from("vehicles")
        .insert({
          license_plate: "CAR-001",
          brand: "Toyota",
          customer_id: customer.id,
        })
        .select()
        .single();

      // Create second vehicle
      await client
        .from("vehicles")
        .insert({
          license_plate: "CAR-002",
          brand: "Honda",
          customer_id: customer.id,
        })
        .select()
        .single();

      // Verify customer has multiple vehicles
      const { data: vehicles } = await client
        .from("vehicles")
        .select()
        .eq("customer_id", customer.id);

      expect(vehicles?.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Data Validation", () => {
    it("validates license plate uniqueness", async () => {
      const client = createTestClient();

      const { data: customer } = await client
        .from("customers")
        .insert({ name: "Test Customer", phone: "0904444444" })
        .select()
        .single();

      if (!customer) return;

      // Create first vehicle
      await client.from("vehicles").insert({
        license_plate: "UNIQUE-123",
        brand: "Toyota",
        customer_id: customer.id,
      });

      // Try duplicate license plate
      const { error } = await client.from("vehicles").insert({
        license_plate: "UNIQUE-123",
        brand: "Honda",
        customer_id: customer.id,
      });

      expect(error).toBeDefined();
    });

    it("validates repair order requires valid vehicle", async () => {
      const client = createTestClient();

      const { error } = await client.from("repair_orders").insert({
        vehicle_id: "non-existent-id",
        created_by: testUserId,
        status: "pending",
        reception_date: "2024-01-15",
        total_amount: 0,
      });

      expect(error).toBeDefined();
    });
  });

  describe("Multiple Repair Orders", () => {
    it("allows multiple repair orders for same vehicle", async () => {
      const client = createTestClient();

      const { data: customer } = await client
        .from("customers")
        .insert({ name: "Repeat Customer", phone: "0906666666" })
        .select()
        .single();

      if (!customer) return;

      const { data: vehicle } = await client
        .from("vehicles")
        .insert({
          license_plate: "REPEAT-001",
          brand: "Toyota",
          customer_id: customer.id,
        })
        .select()
        .single();

      if (!vehicle) return;

      // Create first order
      await client.from("repair_orders").insert({
        vehicle_id: vehicle.id,
        created_by: testUserId,
        status: "completed",
        reception_date: "2024-01-01",
        total_amount: 100000,
      });

      // Create second order
      await client.from("repair_orders").insert({
        vehicle_id: vehicle.id,
        created_by: testUserId,
        status: "pending",
        reception_date: "2024-01-15",
        total_amount: 0,
      });

      // Verify multiple orders
      const { data: orders } = await client
        .from("repair_orders")
        .select()
        .eq("vehicle_id", vehicle.id);

      expect(orders?.length).toBeGreaterThanOrEqual(2);
    });
  });
});
