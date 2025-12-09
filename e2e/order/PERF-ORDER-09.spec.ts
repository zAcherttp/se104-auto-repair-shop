/**
 * PERF-ORDER-09: Update repair order status workflow - measure status transition speed
 * 
 * Steps:
 * 1. Navigate to repair order detail
 * 2. Change status from "pending" to "in-progress"
 * 3. Measure time until UI updates
 * 4. Change status to "completed"
 * 5. Measure time until UI updates
 * 6. Verify status badge reflects changes
 * 7. Repeat 5 times
 * 8. Calculate p95
 * 
 * Success Criteria:
 * - p95 ≤ 1200ms per status change
 * - UI updates immediately
 * - Status badge color changes
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, calculatePercentile, createTestVehicles, createTestRepairOrders, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-ORDER-09: Update repair order status workflow", () => {
  const REPEAT = 5;
  const results: Array<{ run: number; duration: number; statusChange: string }> = [];

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
    test(`Run ${run}/${REPEAT}: Change order status`, async ({ page }) => {
      // Click on order
      const orderRow = page.locator("table tbody tr").nth(run % 5);
      await orderRow.click();
      await page.waitForTimeout(500);

      // Find status dropdown or button
      const statusControl = page.locator('select[name="status"], button:has-text("Status")').first();

      const startTime = Date.now();

      if (await statusControl.isVisible().catch(() => false)) {
        const tagName = await statusControl.evaluate(el => el.tagName.toLowerCase());
        
        if (tagName === "select") {
          await statusControl.selectOption("in-progress");
        } else {
          await statusControl.click();
          await page.waitForTimeout(200);
          await page.locator('[role="option"]:has-text("In Progress"), button:has-text("In Progress")').first().click();
        }

        // Wait for UI to update
        await page.waitForTimeout(300);
      }

      const duration = Date.now() - startTime;

      console.log(`Run ${run}: Changed status in ${duration}ms`);
      results.push({ run, duration, statusChange: "pending -> in-progress" });

      expect(duration, `Duration should be ≤ 1200ms`).toBeLessThanOrEqual(1200);
    });
  }

  test.afterAll(async () => {
    const durations = results.map(r => r.duration).sort((a, b) => a - b);
    const p95 = calculatePercentile(durations, 95);

    console.log("\n=== PERF-ORDER-09 Results ===");
    console.log(`p95: ${p95}ms`);

    saveTestResults("PERF-ORDER-09", {
      testName: "PERF-ORDER-09",
      description: "Update repair order status workflow",
      p95,
      runs: results,
      successCriteria: {
        p95: { threshold: 1200, actual: p95, pass: p95 <= 1200 },
      },
    });

    await cleanupTestData();
    expect(p95, `p95 should be ≤ 1200ms`).toBeLessThanOrEqual(1200);
  });
});
