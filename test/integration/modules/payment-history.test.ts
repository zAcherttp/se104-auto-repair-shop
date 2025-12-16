/**
 * Payment History Integration Tests (lean)
 */

import { createTestUser, createTestVehicle } from "../fixtures/factories";
import { cleanupDatabase } from "../fixtures/seed";
import { createTestClient } from "../setup/supabase-test";

describe("Payment History Integration", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });
  afterEach(async () => {
    await cleanupDatabase();
  });

  it("returns payments with created_by_profile full_name", async () => {
    const client = createTestClient();
    const user = await createTestUser({ isGarageAdmin: false });
    const vehicle = await createTestVehicle();

    // Insert a payment created by this user
    const { error: pErr } = await client.from("payments").insert({
      vehicle_id: vehicle.id,
      amount: 120000,
      payment_method: "cash",
      created_by: user.id,
      payment_date: "2024-02-10",
    });
    expect(pErr).toBeNull();

    const { data: rows, error } = await client
      .from("payments")
      .select(`*, created_by_profile:profiles(full_name)`) // shape aligned with action
      .eq("vehicle_id", vehicle.id);

    expect(error).toBeNull();
    expect(rows?.length || 0).toBeGreaterThan(0);
    const first = rows?.[0] as any;
    expect(first.created_by_profile?.full_name).toBeDefined();
  });

  // EXPECTED FAILURE: Payments should be ordered by payment_date desc by default
  it("returns payments ordered by payment_date descending by default", async () => {
    const client = createTestClient();
    const user = await createTestUser();
    const vehicle = await createTestVehicle();

    // Insert payments with different dates
    await client.from("payments").insert([
      {
        vehicle_id: vehicle.id,
        amount: 50000,
        payment_method: "cash",
        created_by: user.id,
        payment_date: "2024-01-10",
      },
      {
        vehicle_id: vehicle.id,
        amount: 75000,
        payment_method: "cash",
        created_by: user.id,
        payment_date: "2024-03-15",
      },
      {
        vehicle_id: vehicle.id,
        amount: 100000,
        payment_method: "cash",
        created_by: user.id,
        payment_date: "2024-02-20",
      },
    ]);

    const { data: rows } = await client
      .from("payments")
      .select("payment_date, amount")
      .eq("vehicle_id", vehicle.id);

    // Should be ordered desc by payment_date if view/default sort exists
    expect(rows?.[0]?.payment_date).toBe("2024-03-15");
    expect(rows?.[1]?.payment_date).toBe("2024-02-20");
    expect(rows?.[2]?.payment_date).toBe("2024-01-10");
  });
});
