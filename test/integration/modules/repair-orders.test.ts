/**
 * Repair Orders Integration Tests (lean)
 */

import { createTestUser, createTestVehicle, createTestSparePart } from "../fixtures/factories";
import { cleanupDatabase } from "../fixtures/seed";
import { createTestClient } from "../setup/supabase-test";

describe("Repair Orders Integration", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });
  afterEach(async () => {
    await cleanupDatabase();
  });

  it("replaces repair order items and updates order total", async () => {
    const client = createTestClient();
    const user = await createTestUser();
    const vehicle = await createTestVehicle();

    // Create parts
    const partA = await createTestSparePart({ name: "Part A", price: 100000, stock_quantity: 10 });
    const partB = await createTestSparePart({ name: "Part B", price: 200000, stock_quantity: 10 });

    // Create order
    const { data: order } = await client
      .from("repair_orders")
      .insert({
        vehicle_id: vehicle.id,
        created_by: user.id,
        status: "pending",
        reception_date: "2024-03-01",
        total_amount: 0,
      })
      .select()
      .single();

    if (!order) return;

    // Initial items: 2 x Part A
    await client.from("repair_order_items").insert({
      repair_order_id: order.id,
      spare_part_id: partA.id,
      quantity: 2,
      unit_price: partA.price,
      total_amount: partA.price * 2,
      description: "Init A",
    });

    // Update total for initial
    await client.from("repair_orders").update({ total_amount: partA.price * 2 }).eq("id", order.id);

    // Replace items: 1 x Part B
    await client.from("repair_order_items").delete().eq("repair_order_id", order.id);
    await client.from("repair_order_items").insert({
      repair_order_id: order.id,
      spare_part_id: partB.id,
      quantity: 1,
      unit_price: partB.price,
      total_amount: partB.price,
      description: "Replace with B",
    });

    // Update total for replacement
    await client.from("repair_orders").update({ total_amount: partB.price }).eq("id", order.id);

    // Verify
    const { data: items } = await client
      .from("repair_order_items")
      .select("spare_part_id, quantity, unit_price, total_amount")
      .eq("repair_order_id", order.id);

    expect(items?.length).toBe(1);
    expect(items?.[0].spare_part_id).toBe(partB.id);
    expect(items?.[0].total_amount).toBe(partB.price);

    const { data: updatedOrder } = await client
      .from("repair_orders")
      .select("total_amount")
      .eq("id", order.id)
      .single();

    expect(updatedOrder?.total_amount).toBe(partB.price);
  });

  // EXPECTED FAILURE: Status transitions should be validated
  it("prevents invalid status transitions", async () => {
    const client = createTestClient();
    const user = await createTestUser();
    const vehicle = await createTestVehicle();

    const { data: order } = await client
      .from("repair_orders")
      .insert({
        vehicle_id: vehicle.id,
        created_by: user.id,
        status: "completed",
        reception_date: "2024-03-01",
        total_amount: 500000,
      })
      .select()
      .single();

    if (!order) return;

    // Try to move from completed back to pending (invalid transition)
    const { error } = await client
      .from("repair_orders")
      .update({ status: "pending" })
      .eq("id", order.id);

    // Should fail if status transition validation exists
    expect(error).not.toBeNull();
  });

  // EXPECTED FAILURE: Completion date should auto-set when status changes to completed
  it("auto-sets completion_date when status becomes completed", async () => {
    const client = createTestClient();
    const user = await createTestUser();
    const vehicle = await createTestVehicle();

    const { data: order } = await client
      .from("repair_orders")
      .insert({
        vehicle_id: vehicle.id,
        created_by: user.id,
        status: "pending",
        reception_date: "2024-03-01",
        total_amount: 300000,
      })
      .select()
      .single();

    if (!order) return;

    // Update status to completed
    await client
      .from("repair_orders")
      .update({ status: "completed" })
      .eq("id", order.id);

    const { data: updated } = await client
      .from("repair_orders")
      .select("completion_date")
      .eq("id", order.id)
      .single();

    // Should auto-set completion_date via trigger
    expect(updated?.completion_date).not.toBeNull();
  });
});
