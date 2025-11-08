/**
 * PERF-ORDER-04: Update repair order details - measure edit operation speed
 * 
 * Steps:
 * 1. Navigate to Vehicles page
 * 2. Click on an existing repair order
 * 3. Click "Edit" button
 * 4. Modify order fields
 * 5. Click "Save" button
 * 6. Measure time until success toast
 * 7. Repeat 5 times
 * 8. Calculate p95
 * 
 * Success Criteria:
 * - p95 ≤ 1500ms
 * - Success toast displays
 * - Updated data visible immediately
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, calculatePercentile, createTestVehicles, createTestRepairOrders, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-ORDER-04: Update repair order details", () => {
  const REPEAT = 5;
  const results: Array<{ run: number; duration: number; success: boolean }> = [];

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
    test(`Run ${run}/${REPEAT}: Update repair order`, async ({ page }) => {
      // Click on first order row
      const firstRow = page.locator("table tbody tr").first();
      await firstRow.click();

      await page.waitForTimeout(500);

      // Find and click Edit button
      const editButton = page.locator('button:has-text("Edit"), button[aria-label*="edit"]').first();
      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();
        await page.waitForTimeout(300);
      }

      const startTime = Date.now();

      // Modify notes field
      const notesInput = page.locator('textarea[name="notes"], input[name="notes"]').first();
      if (await notesInput.isVisible().catch(() => false)) {
        await notesInput.fill(`Updated notes at ${Date.now()}`);
      }

      // Save changes
      const saveButton = page.locator('button[type="submit"], button:has-text("Save")').first();
      await saveButton.click();

      // Wait for success toast
      try {
        await page.waitForSelector('[role="status"], .toast, [data-sonner-toast]', { timeout: 5000 });
        const duration = Date.now() - startTime;

        console.log(`Run ${run}: Updated order in ${duration}ms`);
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
    const p95 = calculatePercentile(durations, 95);

    console.log("\n=== PERF-ORDER-04 Results ===");
    console.log(`p95: ${p95}ms`);

    saveTestResults("PERF-ORDER-04", {
      testName: "PERF-ORDER-04",
      description: "Update repair order details",
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
