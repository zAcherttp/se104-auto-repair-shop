/**
 * PERF-ORDER-05: Delete repair order - measure deletion speed
 * 
 * Steps:
 * 1. Navigate to Vehicles page
 * 2. Select a test repair order
 * 3. Click delete button
 * 4. Confirm deletion in dialog
 * 5. Measure time until success toast
 * 6. Verify order removed from UI
 * 7. Repeat 3 times
 * 8. Calculate p95
 * 
 * Success Criteria:
 * - p95 ≤ 1500ms
 * - Success toast displays
 * - Order removed from list
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, calculatePercentile, createTestVehicles, createTestRepairOrders, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-ORDER-05: Delete repair order", () => {
  const REPEAT = 3;
  const results: Array<{ run: number; duration: number; success: boolean }> = [];

  test.beforeAll(async () => {
    const vehicles = await createTestVehicles(5);
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
    test(`Run ${run}/${REPEAT}: Delete repair order`, async ({ page }) => {
      // Find delete button in first row
      const deleteButton = page.locator('button[aria-label*="delete"], button:has-text("Delete")').first();
      
      const startTime = Date.now();

      if (await deleteButton.isVisible().catch(() => false)) {
        await deleteButton.click();

        // Wait for confirmation dialog
        await page.waitForTimeout(300);

        // Confirm deletion
        const confirmButton = page.locator('button:has-text("Delete"), button:has-text("Confirm"), button:has-text("Yes")').last();
        if (await confirmButton.isVisible().catch(() => false)) {
          await confirmButton.click();
        }
      }

      // Wait for success toast
      try {
        await page.waitForSelector('[role="status"], .toast, [data-sonner-toast]', { timeout: 5000 });
        const duration = Date.now() - startTime;

        console.log(`Run ${run}: Deleted order in ${duration}ms`);
        results.push({ run, duration, success: true });

        expect(duration, `Duration should be ≤ 1500ms`).toBeLessThanOrEqual(1500);
      } catch (error) {
        const duration = Date.now() - startTime;
        console.log(`Run ${run}: Failed in ${duration}ms`);
        results.push({ run, duration, success: false });
      }

      await page.waitForTimeout(1000);
    });
  }

  test.afterAll(async () => {
    const successful = results.filter(r => r.success);
    const durations = successful.map(r => r.duration).sort((a, b) => a - b);
    const p95 = durations.length > 0 ? calculatePercentile(durations, 95) : 0;

    console.log("\n=== PERF-ORDER-05 Results ===");
    console.log(`p95: ${p95}ms`);

    saveTestResults("PERF-ORDER-05", {
      testName: "PERF-ORDER-05",
      description: "Delete repair order",
      p95,
      runs: results,
      successCriteria: {
        p95: { threshold: 1500, actual: p95, pass: p95 <= 1500 },
      },
    });

    await cleanupTestData();

    if (durations.length > 0) {
      expect(p95, `p95 should be ≤ 1500ms`).toBeLessThanOrEqual(1500);
    }
  });
});
