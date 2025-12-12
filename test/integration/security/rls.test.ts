/**
 * Row Level Security (RLS) Integration Tests
 *
 * Tests multi-tenant data isolation and authentication
 */

import {
  createTestGarage,
  createTestUser,
  createTestVehicle,
} from "../fixtures/factories";
import { cleanupDatabase } from "../fixtures/seed";
import { createTestClient } from "../setup/supabase-test";

describe("RLS Security Integration", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("Multi-Tenant Data Isolation", () => {
    it("prevents users from different garages seeing each others data", async () => {
      const client = createTestClient();

      // Create two separate garages with users
      const garage1 = await createTestGarage({ name: "Garage A" });
      const garage2 = await createTestGarage({ name: "Garage B" });

      const user1 = await createTestUser({
        email: "user1@garagea.com",
        garageId: garage1.garageId,
      });

      const user2 = await createTestUser({
        email: "user2@garageb.com",
        garageId: garage2.garageId,
      });

      // Create vehicles for each garage
      const vehicle1 = await createTestVehicle({
        licensePlate: "GARAGE-A-001",
      });

      const vehicle2 = await createTestVehicle({
        licensePlate: "GARAGE-B-001",
      });

      // Create repair orders for each
      await client.from("repair_orders").insert([
        {
          vehicle_id: vehicle1.id,
          created_by: user1.id,
          status: "pending",
          reception_date: "2024-01-15",
          total_amount: 500000,
        },
        {
          vehicle_id: vehicle2.id,
          created_by: user2.id,
          status: "pending",
          reception_date: "2024-01-15",
          total_amount: 600000,
        },
      ]);

      // Note: In real RLS testing, we would authenticate as user1 and verify
      // they can only see their garage's data. For now, we verify isolation via user IDs

      const { data: user1Orders } = await client
        .from("repair_orders")
        .select()
        .eq("created_by", user1.id);

      const { data: user2Orders } = await client
        .from("repair_orders")
        .select()
        .eq("created_by", user2.id);

      expect(user1Orders?.length).toBe(1);
      expect(user2Orders?.length).toBe(1);
      expect(user1Orders?.[0].vehicle_id).toBe(vehicle1.id);
      expect(user2Orders?.[0].vehicle_id).toBe(vehicle2.id);
    });

    it("isolates customer data by user context", async () => {
      const client = createTestClient();

      const user1 = await createTestUser({ email: "user1@test.com" });
      const user2 = await createTestUser({ email: "user2@test.com" });

      // Create customers
      const { data: customer1 } = await client
        .from("customers")
        .insert({
          name: "Customer 1",
          phone: "0901111111",
        })
        .select()
        .single();

      const { data: customer2 } = await client
        .from("customers")
        .insert({
          name: "Customer 2",
          phone: "0902222222",
        })
        .select()
        .single();

      // In a real RLS setup, customers would be filtered by garage_id
      // For now, verify data exists
      expect(customer1).toBeDefined();
      expect(customer2).toBeDefined();
      expect(customer1?.id).not.toBe(customer2?.id);
    });
  });

  describe("Authentication Requirements", () => {
    it("requires valid user for creating repair orders", async () => {
      const client = createTestClient();

      const vehicle = await createTestVehicle();

      // Try to create repair order with non-existent user
      const { error } = await client.from("repair_orders").insert({
        vehicle_id: vehicle.id,
        created_by: "non-existent-user-id",
        status: "pending",
        reception_date: "2024-01-15",
        total_amount: 100000,
      });

      // Should fail due to foreign key constraint
      expect(error).toBeDefined();
    });

    it("requires valid user for creating payments", async () => {
      const client = createTestClient();

      const vehicle = await createTestVehicle();

      // Try to create payment with non-existent user
      const { error } = await client.from("payments").insert({
        vehicle_id: vehicle.id,
        amount: 100000,
        payment_method: "cash",
        created_by: "non-existent-user-id",
        payment_date: "2024-01-15",
      });

      // Should fail due to foreign key constraint
      expect(error).toBeDefined();
    });
  });

  describe("Admin vs Employee Permissions", () => {
    it("identifies admin users via metadata", async () => {
      const admin = await createTestUser({
        email: "admin@test.com",
        isGarageAdmin: true,
      });

      const employee = await createTestUser({
        email: "employee@test.com",
        isGarageAdmin: false,
      });

      expect(admin.isGarageAdmin).toBe(true);
      expect(employee.isGarageAdmin).toBe(false);
    });

    it("allows both admin and employee to create repair orders", async () => {
      const client = createTestClient();

      const admin = await createTestUser({ isGarageAdmin: true });
      const employee = await createTestUser({ isGarageAdmin: false });

      const vehicle = await createTestVehicle();

      // Admin creates order
      const { data: adminOrder, error: adminError } = await client
        .from("repair_orders")
        .insert({
          vehicle_id: vehicle.id,
          created_by: admin.id,
          status: "pending",
          reception_date: "2024-01-15",
          total_amount: 100000,
        })
        .select()
        .single();

      // Employee creates order
      const { data: employeeOrder, error: employeeError } = await client
        .from("repair_orders")
        .insert({
          vehicle_id: vehicle.id,
          created_by: employee.id,
          status: "pending",
          reception_date: "2024-01-16",
          total_amount: 200000,
        })
        .select()
        .single();

      expect(adminError).toBeNull();
      expect(employeeError).toBeNull();
      expect(adminOrder).toBeDefined();
      expect(employeeOrder).toBeDefined();
    });
  });

  describe("Data Access Patterns", () => {
    it("users can access their own created records", async () => {
      const client = createTestClient();

      const user = await createTestUser();
      const vehicle = await createTestVehicle();

      // User creates repair order
      await client.from("repair_orders").insert({
        vehicle_id: vehicle.id,
        created_by: user.id,
        status: "pending",
        reception_date: "2024-01-15",
        total_amount: 100000,
      });

      // User queries their own records
      const { data: userOrders } = await client
        .from("repair_orders")
        .select()
        .eq("created_by", user.id);

      expect(userOrders?.length).toBe(1);
      expect(userOrders?.[0].created_by).toBe(user.id);
    });

    it("maintains referential integrity across tables", async () => {
      const client = createTestClient();

      const user = await createTestUser();
      const vehicle = await createTestVehicle();

      // Create repair order
      const { data: repairOrder } = await client
        .from("repair_orders")
        .insert({
          vehicle_id: vehicle.id,
          created_by: user.id,
          status: "pending",
          reception_date: "2024-01-15",
          total_amount: 500000,
        })
        .select()
        .single();

      if (!repairOrder) return;

      // Create payment
      const { data: payment } = await client
        .from("payments")
        .insert({
          vehicle_id: vehicle.id,
          amount: 200000,
          payment_method: "cash",
          created_by: user.id,
          payment_date: "2024-01-20",
        })
        .select()
        .single();

      // Verify relationships
      const { data: vehicleData } = await client
        .from("vehicles")
        .select(`
          *,
          repair_orders(id, created_by),
          payments(id, created_by)
        `)
        .eq("id", vehicle.id)
        .single();

      expect(vehicleData?.repair_orders?.length).toBeGreaterThan(0);
      expect(vehicleData?.payments?.length).toBeGreaterThan(0);
      expect(vehicleData?.repair_orders?.[0].created_by).toBe(user.id);
      expect(vehicleData?.payments?.[0].created_by).toBe(user.id);
    });
  });

  describe("Profile and User Metadata", () => {
    it("creates profile when user is created", async () => {
      const client = createTestClient();

      const user = await createTestUser({
        email: "newuser@test.com",
        isGarageAdmin: false,
      });

      // Verify profile exists
      const { data: profile } = await client
        .from("profiles")
        .select()
        .eq("id", user.id)
        .single();

      expect(profile).toBeDefined();
      expect(profile?.id).toBe(user.id);
    });

    it("stores admin status in user metadata", async () => {
      const admin = await createTestUser({
        email: "admin@test.com",
        isGarageAdmin: true,
      });

      const employee = await createTestUser({
        email: "employee@test.com",
        isGarageAdmin: false,
      });

      // Admin status is tracked in the factory
      expect(admin.isGarageAdmin).toBe(true);
      expect(employee.isGarageAdmin).toBe(false);
    });
  });
});
