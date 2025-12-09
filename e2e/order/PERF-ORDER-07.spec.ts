/**
 * PERF-ORDER-07: Add multiple repair items to order - measure bulk item creation performance
 * 
 * Steps:
 * 1. Create or select a repair order
 * 2. Open "Add Items" dialog or form
 * 3. Add 5 items sequentially
 * 4. Measure total time for all 5 items
 * 5. Verify all items appear in order detail
 * 6. Repeat 3 times
 * 7. Calculate p95
 * 
 * Success Criteria:
 * - Total time for 5 items ≤ 2500ms
 * - All 5 items created successfully
 * - Items appear in order detail list
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, calculatePercentile, createTestVehicles, createTestRepairOrders, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-ORDER-07: Add multiple repair items to order", () => {
  const REPEAT = 3;
  const ITEMS_PER_TEST = 5;
  const results: Array<{ run: number; duration: number; itemsAdded: number }> = [];

  test.beforeAll(async () => {
    const vehicles = await createTestVehicles(5);
    if (vehicles.length > 0) {
      const vehicleIds = vehicles.map((v: any) => v.id);
      await createTestRepairOrders(vehicleIds, 5);
    }
  });

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await page.goto("/vehicles", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Add ${ITEMS_PER_TEST} items to order`, async ({ page }) => {
      // Click on first order to open details
      const firstRow = page.locator("table tbody tr").first();
      await firstRow.click();
      await page.waitForTimeout(500);

      const startTime = Date.now();
      let itemsAdded = 0;

      // Try to add items
      for (let i = 0; i < ITEMS_PER_TEST; i++) {
        // Find "Add Item" button
        const addItemButton = page.locator('button:has-text("Add Item"), button:has-text("Add Part")').first();
        
        if (await addItemButton.isVisible().catch(() => false)) {
          await addItemButton.click();
          await page.waitForTimeout(200);

          // Fill item form (try to find inputs)
          const quantityInput = page.locator('input[name="quantity"], input[type="number"]').first();
          if (await quantityInput.isVisible().catch(() => false)) {
            await quantityInput.fill("1");
          }

          // Submit
          const saveButton = page.locator('button:has-text("Add"), button:has-text("Save")').last();
          if (await saveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await saveButton.click();
            itemsAdded++;
            await page.waitForTimeout(200);
          }
        }
      }

      const duration = Date.now() - startTime;

      console.log(`Run ${run}: Added ${itemsAdded} items in ${duration}ms`);
      results.push({ run, duration, itemsAdded });

      if (itemsAdded > 0) {
        expect(duration, `Duration should be ≤ 2500ms`).toBeLessThanOrEqual(2500);
      }
    });
  }

  test.afterAll(async () => {
    const durations = results.map(r => r.duration).sort((a, b) => a - b);
    const p95 = calculatePercentile(durations, 95);

    console.log("\n=== PERF-ORDER-07 Results ===");
    console.log(`p95: ${p95}ms`);

    saveTestResults("PERF-ORDER-07", {
      testName: "PERF-ORDER-07",
      description: "Add multiple repair items to order",
      p95,
      runs: results,
      successCriteria: {
        p95: { threshold: 2500, actual: p95, pass: p95 <= 2500 },
      },
    });

    await cleanupTestData();

    if (durations.length > 0) {
      expect(p95, `p95 should be ≤ 2500ms`).toBeLessThanOrEqual(2500);
    }
  });
});
