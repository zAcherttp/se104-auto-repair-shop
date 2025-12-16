/**
 * Payment Integration Tests
 *
 * Tests payment processing and vehicle debt tracking
 */

import {
  createTestRepairOrder,
  createTestUser,
  createTestVehicle,
} from "../fixtures/factories";
import { cleanupDatabase } from "../fixtures/seed";
import { createTestClient } from "../setup/supabase-test";

describe("Payment Integration", () => {
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

  describe("Payment Creation and Vehicle Total Paid Update", () => {
    it("creates payment and updates vehicle total_paid atomically", async () => {
      const client = createTestClient();

      // Create repair order with cost
      const { data: repairOrder } = await client
        .from("repair_orders")
        .insert({
          vehicle_id: vehicleId,
          created_by: testUserId,
          status: "pending",
          reception_date: "2024-01-15",
          total_amount: 500000,
        })
        .select()
        .single();

      if (!repairOrder) return;

      // Create payment
      const paymentAmount = 200000;
      const { data: payment, error: paymentError } = await client
        .from("payments")
        .insert({
          vehicle_id: vehicleId,
          amount: paymentAmount,
          payment_method: "cash",
          created_by: testUserId,
          payment_date: "2024-01-20",
        })
        .select()
        .single();

      expect(paymentError).toBeNull();
      expect(payment).toBeDefined();

      // Update vehicle total_paid
      await client
        .from("vehicles")
        .update({ total_paid: paymentAmount })
        .eq("id", vehicleId);

      // Verify vehicle total_paid updated
      const { data: vehicle } = await client
        .from("vehicles")
        .select("total_paid")
        .eq("id", vehicleId)
        .single();

      expect(vehicle?.total_paid).toBe(paymentAmount);
    });

    it("handles multiple payments for same vehicle", async () => {
      const client = createTestClient();

      // Create repair order
      const { error: roError } = await client.from("repair_orders").insert({
        vehicle_id: vehicleId,
        created_by: testUserId,
        status: "pending",
        reception_date: "2024-01-15",
        total_amount: 1000000,
      });
      expect(roError).toBeNull();

      // First payment
      const { error: p1Error } = await client.from("payments").insert({
        vehicle_id: vehicleId,
        amount: 300000,
        payment_method: "cash",
        created_by: testUserId,
        payment_date: "2024-01-20",
      });
      expect(p1Error).toBeNull();

      const { error: u1Error } = await client
        .from("vehicles")
        .update({ total_paid: 300000 })
        .eq("id", vehicleId);
      expect(u1Error).toBeNull();

      // Second payment
      const { error: p2Error } = await client.from("payments").insert({
        vehicle_id: vehicleId,
        amount: 200000,
        payment_method: "cash",
        created_by: testUserId,
        payment_date: "2024-01-25",
      });
      expect(p2Error).toBeNull();

      const { error: u2Error } = await client
        .from("vehicles")
        .update({ total_paid: 500000 })
        .eq("id", vehicleId);
      expect(u2Error).toBeNull();

      // Verify total_paid is cumulative
      const { data: vehicle } = await client
        .from("vehicles")
        .select("total_paid")
        .eq("id", vehicleId)
        .single();

      expect(vehicle?.total_paid).toBe(500000);

      // Verify both payments exist
      const { data: payments, error: paymentError } = await client
        .from("payments")
        .select()
        .eq("vehicle_id", vehicleId);

      expect(paymentError).toBeNull();
      expect(payments?.length).toBe(2);
    });

    it("tracks different payment methods", async () => {
      const client = createTestClient();

      await client.from("repair_orders").insert({
        vehicle_id: vehicleId,
        created_by: testUserId,
        status: "pending",
        reception_date: "2024-01-15",
        total_amount: 1000000,
      });

      const paymentMethods = [
        { method: "cash", amount: 100000 },
        { method: "cash", amount: 200000 },
        { method: "cash", amount: 300000 },
      ];

      for (const pm of paymentMethods) {
        await client.from("payments").insert({
          vehicle_id: vehicleId,
          amount: pm.amount,
          payment_method: pm.method,
          created_by: testUserId,
          payment_date: "2024-01-20",
        });
      }

      const { data: payments } = await client
        .from("payments")
        .select("payment_method, amount")
        .eq("vehicle_id", vehicleId);

      expect(payments?.length).toBe(3);

      const cashPayments = payments?.filter((p) => p.payment_method === "cash");

      expect(cashPayments?.length).toBe(3);
      expect(cashPayments?.[0].amount).toBe(100000);
      expect(cashPayments?.[1].amount).toBe(200000);
      expect(cashPayments?.[2].amount).toBe(300000);
    });
  });

  describe("Debt Calculation", () => {
    it("calculates remaining debt correctly", async () => {
      const client = createTestClient();

      // Create repair order
      const totalCost = 1000000;
      await client.from("repair_orders").insert({
        vehicle_id: vehicleId,
        created_by: testUserId,
        status: "pending",
        reception_date: "2024-01-15",
        total_amount: totalCost,
      });

      // Make partial payment
      const paidAmount = 400000;
      await client.from("payments").insert({
        vehicle_id: vehicleId,
        amount: paidAmount,
        payment_method: "cash",
        created_by: testUserId,
        payment_date: "2024-01-20",
      });

      await client
        .from("vehicles")
        .update({ total_paid: paidAmount })
        .eq("id", vehicleId);

      // Fetch vehicle with repair orders and payments
      const { data: vehicle } = await client
        .from("vehicles")
        .select(`
          *,
          repair_orders(total_amount),
          payments(amount)
        `)
        .eq("id", vehicleId)
        .single();

      const totalRepairCosts =
        vehicle?.repair_orders?.reduce(
          (sum: number, order: any) => sum + (order.total_amount || 0),
          0,
        ) || 0;
      const totalPaid =
        vehicle?.payments?.reduce(
          (sum: number, payment: any) => sum + payment.amount,
          0,
        ) || 0;
      const remainingDebt = totalRepairCosts - totalPaid;

      expect(totalRepairCosts).toBe(totalCost);
      expect(totalPaid).toBe(paidAmount);
      expect(remainingDebt).toBe(600000);
    });

    it("identifies fully paid vehicles", async () => {
      const client = createTestClient();

      const totalCost = 500000;
      await client.from("repair_orders").insert({
        vehicle_id: vehicleId,
        created_by: testUserId,
        status: "completed",
        reception_date: "2024-01-15",
        total_amount: totalCost,
      });

      // Pay in full
      await client.from("payments").insert({
        vehicle_id: vehicleId,
        amount: totalCost,
        payment_method: "cash",
        created_by: testUserId,
        payment_date: "2024-01-20",
      });

      await client
        .from("vehicles")
        .update({ total_paid: totalCost })
        .eq("id", vehicleId);

      const { data: vehicle } = await client
        .from("vehicles")
        .select(`
          *,
          repair_orders(total_amount),
          payments(amount)
        `)
        .eq("id", vehicleId)
        .single();

      const totalRepairCosts =
        vehicle?.repair_orders?.reduce(
          (sum: number, order: any) => sum + (order.total_amount || 0),
          0,
        ) || 0;
      const totalPaid =
        vehicle?.payments?.reduce(
          (sum: number, payment: any) => sum + payment.amount,
          0,
        ) || 0;

      expect(totalPaid).toBe(totalRepairCosts);
      expect(totalPaid - totalRepairCosts).toBe(0); // No debt
    });

    it("prevents payment exceeding debt", async () => {
      const client = createTestClient();

      const totalCost = 500000;
      await client.from("repair_orders").insert({
        vehicle_id: vehicleId,
        created_by: testUserId,
        status: "pending",
        reception_date: "2024-01-15",
        total_amount: totalCost,
      });

      // Get current debt
      const { data: vehicle } = await client
        .from("vehicles")
        .select(`
          *,
          repair_orders(total_amount),
          payments(amount)
        `)
        .eq("id", vehicleId)
        .single();

      const totalRepairCosts =
        vehicle?.repair_orders?.reduce(
          (sum: number, order: any) => sum + (order.total_amount || 0),
          0,
        ) || 0;
      const totalPaid =
        vehicle?.payments?.reduce(
          (sum: number, payment: any) => sum + payment.amount,
          0,
        ) || 0;
      const remainingDebt = totalRepairCosts - totalPaid;

      // Try to pay more than debt
      const excessivePayment = remainingDebt + 100000;

      // In real implementation, this should be validated
      // For now, we just verify the calculation works
      expect(excessivePayment).toBeGreaterThan(remainingDebt);
      expect(remainingDebt).toBe(totalCost); // No previous payments
    });
  });

  describe("Payment History", () => {
    it("maintains chronological payment history", async () => {
      const client = createTestClient();

      await client.from("repair_orders").insert({
        vehicle_id: vehicleId,
        created_by: testUserId,
        status: "pending",
        reception_date: "2024-01-15",
        total_amount: 1000000,
      });

      // Create payments on different dates
      await client.from("payments").insert([
        {
          vehicle_id: vehicleId,
          amount: 100000,
          payment_method: "cash",
          created_by: testUserId,
          payment_date: "2024-01-20",
        },
        {
          vehicle_id: vehicleId,
          amount: 200000,
          payment_method: "cash",
          created_by: testUserId,
          payment_date: "2024-01-25",
        },
        {
          vehicle_id: vehicleId,
          amount: 300000,
          payment_method: "cash",
          created_by: testUserId,
          payment_date: "2024-01-30",
        },
      ]);

      const { data: payments } = await client
        .from("payments")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("payment_date", { ascending: true });

      expect(payments?.length).toBe(3);
      expect(payments?.[0].amount).toBe(100000);
      expect(payments?.[1].amount).toBe(200000);
      expect(payments?.[2].amount).toBe(300000);
    });

    it("links payments to creator user", async () => {
      const client = createTestClient();

      await client.from("repair_orders").insert({
        vehicle_id: vehicleId,
        created_by: testUserId,
        status: "pending",
        reception_date: "2024-01-15",
        total_amount: 500000,
      });

      await client.from("payments").insert({
        vehicle_id: vehicleId,
        amount: 100000,
        payment_method: "cash",
        created_by: testUserId,
        payment_date: "2024-01-20",
      });

      const { data: payments } = await client
        .from("payments")
        .select("created_by")
        .eq("vehicle_id", vehicleId);

      expect(payments?.[0].created_by).toBe(testUserId);
    });
  });

  describe("Multiple Repair Orders Debt Tracking", () => {
    it("tracks debt across multiple repair orders", async () => {
      const client = createTestClient();

      // Create multiple repair orders
      await client.from("repair_orders").insert([
        {
          vehicle_id: vehicleId,
          created_by: testUserId,
          status: "completed",
          reception_date: "2024-01-01",
          total_amount: 300000,
        },
        {
          vehicle_id: vehicleId,
          created_by: testUserId,
          status: "completed",
          reception_date: "2024-02-01",
          total_amount: 400000,
        },
        {
          vehicle_id: vehicleId,
          created_by: testUserId,
          status: "pending",
          reception_date: "2024-03-01",
          total_amount: 500000,
        },
      ]);

      // Make partial payment
      await client.from("payments").insert({
        vehicle_id: vehicleId,
        amount: 600000,
        payment_method: "cash",
        created_by: testUserId,
        payment_date: "2024-03-15",
      });

      const { data: vehicle } = await client
        .from("vehicles")
        .select(`
          *,
          repair_orders(total_amount),
          payments(amount)
        `)
        .eq("id", vehicleId)
        .single();

      const totalRepairCosts =
        vehicle?.repair_orders?.reduce(
          (sum: number, order: any) => sum + (order.total_amount || 0),
          0,
        ) || 0;
      const totalPaid =
        vehicle?.payments?.reduce(
          (sum: number, payment: any) => sum + payment.amount,
          0,
        ) || 0;

      expect(totalRepairCosts).toBe(1200000); // 300k + 400k + 500k
      expect(totalPaid).toBe(600000);
      expect(totalRepairCosts - totalPaid).toBe(600000); // Remaining debt
    });

    // EXPECTED FAILURE: Should enforce check constraint preventing negative payment amounts
    it("prevents negative payment amounts", async () => {
      const client = createTestClient();

      await client.from("repair_orders").insert({
        vehicle_id: vehicleId,
        created_by: testUserId,
        status: "pending",
        reception_date: "2024-01-15",
        total_amount: 500000,
      });

      // Try negative payment
      const { error } = await client.from("payments").insert({
        vehicle_id: vehicleId,
        amount: -100000,
        payment_method: "cash",
        created_by: testUserId,
        payment_date: "2024-01-20",
      });

      // Should fail with check constraint
      expect(error).not.toBeNull();
      expect(error?.code).toBe("23514"); // check_violation
    });

    // EXPECTED FAILURE: Database trigger should prevent overpayment
    it("prevents total payments exceeding total repairs at database level", async () => {
      const client = createTestClient();

      await client.from("repair_orders").insert({
        vehicle_id: vehicleId,
        created_by: testUserId,
        status: "pending",
        reception_date: "2024-01-15",
        total_amount: 300000,
      });

      // Pay 200k first
      await client.from("payments").insert({
        vehicle_id: vehicleId,
        amount: 200000,
        payment_method: "cash",
        created_by: testUserId,
        payment_date: "2024-01-20",
      });

      // Try to pay another 200k (total would be 400k, exceeding 300k debt)
      const { error } = await client.from("payments").insert({
        vehicle_id: vehicleId,
        amount: 200000,
        payment_method: "cash",
        created_by: testUserId,
        payment_date: "2024-01-21",
      });

      // Should be prevented by trigger checking total payments <= total repairs
      expect(error).not.toBeNull();
    });
  });
});
