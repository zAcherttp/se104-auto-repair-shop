/**
 * Repair Order Items Integration Tests (lean)
 */

import { createTestUser, createTestVehicle, createTestSparePart } from "../fixtures/factories";
import { cleanupDatabase } from "../fixtures/seed";
import { createTestClient } from "../setup/supabase-test";

describe("Repair Order Items Integration", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });
  afterEach(async () => {
    await cleanupDatabase();
  });

  it("fetches items with joined spare_part and labor_type fields", async () => {
    const client = createTestClient();
    const user = await createTestUser();
    const vehicle = await createTestVehicle();

    // Seed spare part and labor type
    const spare = await createTestSparePart({ name: "Filter", price: 80000, stock_quantity: 5 });
    const { data: laborType } = await client
      .from("labor_types")
      .insert({ name: "Diagnostic", cost: 150000 })
      .select()
      .single();

    // Create order
    const { data: order } = await client
      .from("repair_orders")
      .insert({
        vehicle_id: vehicle.id,
        created_by: user.id,
        status: "pending",
        reception_date: "2024-04-01",
        total_amount: 0,
      })
      .select()
      .single();

    if (!order) return;

    // Insert one spare_part item and one labor item
    await client.from("repair_order_items").insert([
      {
        repair_order_id: order.id,
        spare_part_id: spare.id,
        quantity: 1,
        unit_price: spare.price,
        total_amount: spare.price,
        description: "Replace filter",
      },
      {
        repair_order_id: order.id,
        labor_type_id: laborType!.id,
        labor_cost: laborType!.cost,
        total_amount: laborType!.cost,
        description: "Diagnostics",
      },
    ]);

    // Query with joins like action fetchExistingRepairOrderItems()
    const { data: items, error } = await client
      .from("repair_order_items")
      .select(`
        *,
        spare_part:spare_parts(id, name, price),
        labor_type:labor_types(id, name, cost)
      `)
      .eq("repair_order_id", order.id);

    expect(error).toBeNull();
    expect(items?.length).toBe(2);

    const spareItem = items?.find((i: any) => i.spare_part_id);
    const laborItem = items?.find((i: any) => i.labor_type_id);

    expect(spareItem?.spare_part?.name).toBe("Filter");
    expect(laborItem?.labor_type?.name).toBe("Diagnostic");
  });

  // EXPECTED FAILURE: Should enforce check constraint that either spare_part_id OR labor_type_id is set
  it("prevents item with both spare_part_id and labor_type_id", async () => {
    const client = createTestClient();
    const user = await createTestUser();
    const vehicle = await createTestVehicle();
    const spare = await createTestSparePart({ name: "Part X", price: 50000, stock_quantity: 3 });
    
    const { data: laborType } = await client
      .from("labor_types")
      .insert({ name: "Service Y", cost: 100000 })
      .select()
      .single();

    const { data: order } = await client
      .from("repair_orders")
      .insert({
        vehicle_id: vehicle.id,
        created_by: user.id,
        status: "pending",
        reception_date: "2024-04-10",
        total_amount: 0,
      })
      .select()
      .single();

    if (!order) return;

    // Try to insert item with BOTH spare_part_id and labor_type_id
    const { error } = await client.from("repair_order_items").insert({
      repair_order_id: order.id,
      spare_part_id: spare.id,
      labor_type_id: laborType!.id,
      quantity: 1,
      unit_price: 50000,
      total_amount: 50000,
      description: "Invalid dual type",
    });

    // Should fail with check constraint
    expect(error).not.toBeNull();
    expect(error?.code).toBe("23514"); // check_violation
  });
});
