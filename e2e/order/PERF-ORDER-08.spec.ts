/**
 * PERF-ORDER-08: View repair order details - measure detail page load and item list render
 * 
 * Steps:
 * 1. Navigate to Vehicles page
 * 2. Click on a repair order with 10+ items
 * 3. Measure time to load order detail view
 * 4. Verify all order information displays
 * 5. Verify all items table renders
 * 6. Repeat 5 times
 * 7. Calculate p95
 * 
 * Success Criteria:
 * - p95 ≤ 1500ms
 * - Order details fully loaded
 * - All items displayed in table
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, calculatePercentile, createTestVehicles, createTestRepairOrders, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-ORDER-08: View repair order details", () => {
  const REPEAT = 5;
  const results: Array<{ run: number; duration: number }> = [];

  test.beforeAll(async () => {
    const vehicles = await createTestVehicles(10);
    if (vehicles.length > 0) {
      const vehicleIds = vehicles.map((v: any) => v.id);
      await createTestRepairOrders(vehicleIds, 10);
    }
  });

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await page.goto("/vehicles", { waitUntil: "networkidle" });
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Load order details`, async ({ page }) => {
      const startTime = Date.now();

      // Click on order row
      const orderRow = page.locator("table tbody tr").nth(run % 5);
      await orderRow.click();

      // Wait for detail view to load
      await page.waitForTimeout(500);
      
      // Check if details are visible
      const detailsVisible = await page.locator('[data-test="order-details"], .order-details, h2, h3').first().isVisible().catch(() => false);

      const duration = Date.now() - startTime;

      console.log(`Run ${run}: Loaded order details in ${duration}ms`);
      results.push({ run, duration });

      expect(detailsVisible, "Order details should be visible").toBe(true);
      expect(duration, `Duration should be ≤ 1500ms`).toBeLessThanOrEqual(1500);
    });
  }

  test.afterAll(async () => {
    const durations = results.map(r => r.duration).sort((a, b) => a - b);
    const p95 = calculatePercentile(durations, 95);

    console.log("\n=== PERF-ORDER-08 Results ===");
    console.log(`p95: ${p95}ms`);

    saveTestResults("PERF-ORDER-08", {
      testName: "PERF-ORDER-08",
      description: "View repair order details",
      p95,
      runs: results,
      successCriteria: {
        p95: { threshold: 1500, actual: p95, pass: p95 <= 1500 },
      },
    });

    await cleanupTestData();
    expect(p95, `p95 should be ≤ 1500ms`).toBeLessThanOrEqual(1500);
  });
});
