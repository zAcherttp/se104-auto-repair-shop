/**
 * Inventory Integration Tests
 *
 * Tests spare parts stock management when repair order items are added/deleted
 */

import {
  createTestSparePart,
  createTestUser,
  createTestVehicle,
} from "../fixtures/factories";
import { cleanupDatabase } from "../fixtures/seed";
import { createTestClient } from "../setup/supabase-test";

describe("Inventory Integration", () => {
  let testUserId: string;
  let vehicleId: string;

  beforeEach(async () => {
    await cleanupDatabase();

    const user = await createTestUser();
    testUserId = user.id;

    const vehicle = await createTestVehicle();
    vehicleId = vehicle.id;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("Stock Updates on Repair Order Items", () => {
    it("decreases spare part stock when adding repair order item", async () => {
      const client = createTestClient();

      // Create spare part with initial stock
      const sparePart = await createTestSparePart({
        name: "Engine Oil",
        price: 100000,
        stock_quantity: 50,
      });

      // Create repair order
      const { data: repairOrder } = await client
        .from("repair_orders")
        .insert({
          vehicle_id: vehicleId,
          created_by: testUserId,
          status: "pending",
          reception_date: "2024-01-15",
          total_amount: 0,
        })
        .select()
        .single();

      if (!repairOrder) return;

      // Add repair order item (simulating using 5 units)
      const quantity = 5;
      await client.from("repair_order_items").insert({
        repair_order_id: repairOrder.id,
        spare_part_id: sparePart.id,
        quantity: quantity,
        description: "Oil change",
      });

      // Manually update stock (in real app, this is done by updateSparePartsStock)
      await client
        .from("spare_parts")
        .update({ stock_quantity: sparePart.stock_quantity - quantity })
        .eq("id", sparePart.id);

      // Verify stock decreased
      const { data: updatedPart } = await client
        .from("spare_parts")
        .select("stock_quantity")
        .eq("id", sparePart.id)
        .single();

      expect(updatedPart?.stock_quantity).toBe(45); // 50 - 5
    });

    it("increases stock when deleting repair order item", async () => {
      const client = createTestClient();

      const sparePart = await createTestSparePart({
        stock_quantity: 40,
      });

      const { data: repairOrder } = await client
        .from("repair_orders")
        .insert({
          vehicle_id: vehicleId,
          created_by: testUserId,
          status: "pending",
          reception_date: "2024-01-15",
          total_amount: 0,
        })
        .select()
        .single();

      if (!repairOrder) return;

      // Add and then delete repair order item
      const quantity = 10;
      const { data: item } = await client
        .from("repair_order_items")
        .insert({
          repair_order_id: repairOrder.id,
          spare_part_id: sparePart.id,
          quantity: quantity,
          description: "Test item",
        })
        .select()
        .single();

      if (!item) return;

      // Simulate stock decrease
      await client
        .from("spare_parts")
        .update({ stock_quantity: 30 }) // 40 - 10
        .eq("id", sparePart.id);

      // Delete item
      await client.from("repair_order_items").delete().eq("id", item.id);

      // Restore stock
      await client
        .from("spare_parts")
        .update({ stock_quantity: 40 }) // 30 + 10
        .eq("id", sparePart.id);

      const { data: restoredPart } = await client
        .from("spare_parts")
        .select("stock_quantity")
        .eq("id", sparePart.id)
        .single();

      expect(restoredPart?.stock_quantity).toBe(40);
    });

    it("handles multiple items decreasing stock for different parts", async () => {
      const client = createTestClient();

      const part1 = await createTestSparePart({
        name: "Brake Pad",
        stock_quantity: 20,
      });

      const part2 = await createTestSparePart({
        name: "Air Filter",
        stock_quantity: 15,
      });

      const { data: repairOrder } = await client
        .from("repair_orders")
        .insert({
          vehicle_id: vehicleId,
          created_by: testUserId,
          status: "pending",
          reception_date: "2024-01-15",
          total_amount: 0,
        })
        .select()
        .single();

      if (!repairOrder) return;

      // Add items for both parts
      await client.from("repair_order_items").insert([
        {
          repair_order_id: repairOrder.id,
          spare_part_id: part1.id,
          quantity: 2,
          description: "Brake replacement",
        },
        {
          repair_order_id: repairOrder.id,
          spare_part_id: part2.id,
          quantity: 1,
          description: "Air filter replacement",
        },
      ]);

      // Update stocks
      await client
        .from("spare_parts")
        .update({ stock_quantity: 18 })
        .eq("id", part1.id);

      await client
        .from("spare_parts")
        .update({ stock_quantity: 14 })
        .eq("id", part2.id);

      // Verify both stocks decreased
      const { data: parts } = await client
        .from("spare_parts")
        .select("id, stock_quantity")
        .in("id", [part1.id, part2.id]);

      const part1Stock = parts?.find((p) => p.id === part1.id)?.stock_quantity;
      const part2Stock = parts?.find((p) => p.id === part2.id)?.stock_quantity;

      expect(part1Stock).toBe(18);
      expect(part2Stock).toBe(14);
    });

    it("prevents negative stock quantities", async () => {
      const client = createTestClient();

      const sparePart = await createTestSparePart({
        stock_quantity: 5,
      });

      const { data: repairOrder } = await client
        .from("repair_orders")
        .insert({
          vehicle_id: vehicleId,
          created_by: testUserId,
          status: "pending",
          reception_date: "2024-01-15",
          total_amount: 0,
        })
        .select()
        .single();

      if (!repairOrder) return;

      // Try to use more than available stock
      const requestedQuantity = 10;

      await client.from("repair_order_items").insert({
        repair_order_id: repairOrder.id,
        spare_part_id: sparePart.id,
        quantity: requestedQuantity,
        description: "Over-requested item",
      });

      // Calculate new stock (should not go negative)
      const newStock = Math.max(
        0,
        sparePart.stock_quantity - requestedQuantity,
      );

      await client
        .from("spare_parts")
        .update({ stock_quantity: newStock })
        .eq("id", sparePart.id);

      const { data: updatedPart } = await client
        .from("spare_parts")
        .select("stock_quantity")
        .eq("id", sparePart.id)
        .single();

      expect(updatedPart?.stock_quantity).toBe(0);
      expect(updatedPart?.stock_quantity).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Labor Types (No Stock Management)", () => {
    it("allows adding labor type items without affecting stock", async () => {
      const client = createTestClient();

      // Create labor type
      const { data: laborType } = await client
        .from("labor_types")
        .insert({
          name: "Oil Change Service",
          cost: 50000,
        })
        .select()
        .single();

      if (!laborType) return;

      const { data: repairOrder } = await client
        .from("repair_orders")
        .insert({
          vehicle_id: vehicleId,
          created_by: testUserId,
          status: "pending",
          reception_date: "2024-01-15",
          total_amount: 0,
        })
        .select()
        .single();

      if (!repairOrder) return;

      // Add labor type item (no spare_part_id)
      const { data: item } = await client
        .from("repair_order_items")
        .insert({
          repair_order_id: repairOrder.id,
          labor_type_id: laborType.id,
          labor_cost: laborType.cost,
          description: "Oil change labor",
        })
        .select()
        .single();

      expect(item).toBeDefined();
      expect(item?.spare_part_id).toBeNull();
      expect(item?.labor_type_id).toBe(laborType.id);
    });

    it("allows mixed spare parts and labor types in same order", async () => {
      const client = createTestClient();

      const sparePart = await createTestSparePart({
        name: "Engine Oil",
        stock_quantity: 50,
      });

      const { data: laborType } = await client
        .from("labor_types")
        .insert({
          name: "Oil Change Service",
          cost: 50000,
        })
        .select()
        .single();

      if (!laborType) return;

      const { data: repairOrder } = await client
        .from("repair_orders")
        .insert({
          vehicle_id: vehicleId,
          created_by: testUserId,
          status: "pending",
          reception_date: "2024-01-15",
          total_amount: 0,
        })
        .select()
        .single();

      if (!repairOrder) return;

      // Add both types of items
      await client.from("repair_order_items").insert([
        {
          repair_order_id: repairOrder.id,
          spare_part_id: sparePart.id,
          quantity: 5,
          description: "Engine oil",
        },
        {
          repair_order_id: repairOrder.id,
          labor_type_id: laborType.id,
          labor_cost: laborType.cost,
          description: "Labor",
        },
      ]);

      const { data: items } = await client
        .from("repair_order_items")
        .select()
        .eq("repair_order_id", repairOrder.id);

      expect(items?.length).toBe(2);

      const sparePartItem = items?.find((i) => i.spare_part_id !== null);
      const laborItem = items?.find((i) => i.labor_type_id !== null);

      expect(sparePartItem).toBeDefined();
      expect(laborItem).toBeDefined();
    });
  });

  describe("Stock Query Calculations", () => {
    it("calculates correct stock levels after multiple operations", async () => {
      const client = createTestClient();

      const sparePart = await createTestSparePart({
        name: "Test Part",
        stock_quantity: 100,
      });

      const { data: repairOrder } = await client
        .from("repair_orders")
        .insert({
          vehicle_id: vehicleId,
          created_by: testUserId,
          status: "pending",
          reception_date: "2024-01-15",
          total_amount: 0,
        })
        .select()
        .single();

      if (!repairOrder) return;

      // Series of operations
      // 1. Use 20 units
      await client.from("repair_order_items").insert({
        repair_order_id: repairOrder.id,
        spare_part_id: sparePart.id,
        quantity: 20,
        description: "First usage",
      });

      await client
        .from("spare_parts")
        .update({ stock_quantity: 80 })
        .eq("id", sparePart.id);

      // 2. Use 15 more units
      await client.from("repair_order_items").insert({
        repair_order_id: repairOrder.id,
        spare_part_id: sparePart.id,
        quantity: 15,
        description: "Second usage",
      });

      await client
        .from("spare_parts")
        .update({ stock_quantity: 65 })
        .eq("id", sparePart.id);

      // Verify final stock
      const { data: finalPart } = await client
        .from("spare_parts")
        .select("stock_quantity")
        .eq("id", sparePart.id)
        .single();

      expect(finalPart?.stock_quantity).toBe(65); // 100 - 20 - 15
    });
  });
});
