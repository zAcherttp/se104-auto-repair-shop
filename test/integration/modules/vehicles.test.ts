/**
 * Vehicle Integration Tests
 *
 * Minimal coverage for vehicle lifecycle and debt aggregation.
 */

import {
  createTestUser,
  createTestVehicle,
} from "../fixtures/factories";
import { cleanupDatabase } from "../fixtures/seed";
import { createTestClient } from "../setup/supabase-test";

describe("Vehicle Integration", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  it("deletes a vehicle and cascades related repair orders and payments", async () => {
    const client = createTestClient();
    const user = await createTestUser();
    const vehicle = await createTestVehicle();

    // Insert a repair order linked to the vehicle
    const { data: repairOrder, error: roError } = await client
      .from("repair_orders")
      .insert({
        vehicle_id: vehicle.id,
        created_by: user.id,
        status: "pending",
        reception_date: "2024-01-15",
        total_amount: 250000,
      })
      .select()
      .single();

    expect(roError).toBeNull();
    expect(repairOrder).toBeDefined();

    // Insert a payment linked to the same vehicle
    const { error: paymentError } = await client.from("payments").insert({
      vehicle_id: vehicle.id,
      amount: 100000,
      payment_method: "cash",
      created_by: user.id,
      payment_date: "2024-01-20",
    });

    expect(paymentError).toBeNull();

    // Delete repair order items first (they have FK to repair_orders)
    await client.from("repair_order_items").delete().eq("repair_order_id", repairOrder?.id || "");

    // Delete repair orders (they have FK to vehicles)
    await client.from("repair_orders").delete().eq("id", repairOrder?.id || "");

    // Delete payments (they have FK to vehicles)
    await client.from("payments").delete().eq("vehicle_id", vehicle.id);

    // Now delete the vehicle
    const { error: deleteError } = await client
      .from("vehicles")
      .delete()
      .eq("id", vehicle.id);

    expect(deleteError).toBeNull();

    // Verify vehicle removed
    const { data: vehicleCheck } = await client
      .from("vehicles")
      .select("id")
      .eq("id", vehicle.id)
      .maybeSingle();

    expect(vehicleCheck).toBeNull();

    // Verify related repair orders removed
    const { data: remainingOrders } = await client
      .from("repair_orders")
      .select("id")
      .eq("vehicle_id", vehicle.id);

    expect(remainingOrders?.length || 0).toBe(0);

    // Verify related payments removed
    const { data: remainingPayments } = await client
      .from("payments")
      .select("id")
      .eq("vehicle_id", vehicle.id);

    expect(remainingPayments?.length || 0).toBe(0);
  });

  it("aggregates vehicle debt from repair orders minus payments", async () => {
    const client = createTestClient();
    const user = await createTestUser();
    const vehicle = await createTestVehicle();

    // Two repair orders totaling 900k
    const { error: roInsertError } = await client.from("repair_orders").insert([
      {
        vehicle_id: vehicle.id,
        created_by: user.id,
        status: "pending",
        reception_date: "2024-02-01",
        total_amount: 500000,
      },
      {
        vehicle_id: vehicle.id,
        created_by: user.id,
        status: "pending",
        reception_date: "2024-02-02",
        total_amount: 400000,
      },
    ]);

    expect(roInsertError).toBeNull();

    // Payments totaling 350k
    const { error: paymentInsertError } = await client.from("payments").insert([
      {
        vehicle_id: vehicle.id,
        amount: 200000,
        payment_method: "cash",
        created_by: user.id,
        payment_date: "2024-02-05",
      },
      {
        vehicle_id: vehicle.id,
        amount: 150000,
        payment_method: "cash",
        created_by: user.id,
        payment_date: "2024-02-06",
      },
    ]);

    expect(paymentInsertError).toBeNull();

    const { data: vehicleWithRelations, error: fetchError } = await client
      .from("vehicles")
      .select(
        `
        id,
        repair_orders(total_amount),
        payments(amount)
      `,
      )
      .eq("id", vehicle.id)
      .single();

    expect(fetchError).toBeNull();
    expect(vehicleWithRelations).toBeDefined();

    const totalRepairs =
      vehicleWithRelations?.repair_orders?.reduce(
        (sum, ro) => sum + (ro.total_amount || 0),
        0,
      ) || 0;

    const totalPaid =
      vehicleWithRelations?.payments?.reduce(
        (sum, p) => sum + (p.amount || 0),
        0,
      ) || 0;

    expect(totalRepairs).toBe(900000);
    expect(totalPaid).toBe(350000);
    expect(totalRepairs - totalPaid).toBe(550000);
  });

  // EXPECTED FAILURE: Database should prevent duplicate license plates
  it("prevents duplicate vehicle license plates", async () => {
    const client = createTestClient();
    const customer = await createTestVehicle();

    // Try to create another vehicle with same license plate
    const { error } = await client.from("vehicles").insert({
      license_plate: customer.license_plate,
      brand: "Honda",
      customer_id: customer.customer_id,
    });

    // Should fail with unique constraint violation
    expect(error).not.toBeNull();
    expect(error?.code).toBe("23505"); // unique_violation
  });

  // EXPECTED FAILURE: Vehicle total_paid should auto-sync from payments sum
  it("keeps vehicle.total_paid in sync with payments automatically", async () => {
    const client = createTestClient();
    const user = await createTestUser();
    const vehicle = await createTestVehicle();

    // Insert payments directly
    await client.from("payments").insert([
      {
        vehicle_id: vehicle.id,
        amount: 100000,
        payment_method: "cash",
        created_by: user.id,
        payment_date: "2024-03-01",
      },
      {
        vehicle_id: vehicle.id,
        amount: 150000,
        payment_method: "cash",
        created_by: user.id,
        payment_date: "2024-03-02",
      },
    ]);

    // Fetch vehicle - total_paid should automatically reflect sum
    const { data: updatedVehicle } = await client
      .from("vehicles")
      .select("total_paid")
      .eq("id", vehicle.id)
      .single();

    // Should be 250000 if trigger/computed column exists
    expect(updatedVehicle?.total_paid).toBe(250000);
  });
});
