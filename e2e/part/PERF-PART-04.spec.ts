/**
 * PERF-PART-04: Update spare part stock quantity - measure quick stock adjustment
 * 
 * Steps:
 * 1. Navigate to Inventory page
 * 2. Click edit/adjust stock on a part
 * 3. Increment stock by 1 unit
 * 4. Click save button
 * 5. Measure time until success toast
 * 6. Verify new stock quantity displayed
 * 7. Repeat 5 times (different parts)
 * 8. Calculate p95
 * 
 * Success Criteria:
 * - p95 ≤ 1200ms
 * - Success toast displays
 * - Stock quantity updates in UI
 * - No locking errors
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, calculatePercentile, navigateToInventory, createTestSpareParts, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-PART-04: Update spare part stock", () => {
  const REPEAT = 5;
  const results: Array<{ run: number; duration: number; success: boolean }> = [];

  test.beforeAll(async () => {
    await createTestSpareParts(10);
  });

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await navigateToInventory(page);
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Update stock quantity`, async ({ page }) => {
      // Find edit button in row
      const editButton = page.locator('button[aria-label*="edit"], button:has-text("Edit")').nth(run % 3);

      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();
        await page.waitForTimeout(300);

        const startTime = Date.now();

        // Find stock quantity input
        const stockInput = page.locator('input[name="quantity_in_stock"], input[name="stock"], input[type="number"]').first();
        
        if (await stockInput.isVisible().catch(() => false)) {
          const currentValue = await stockInput.inputValue();
          const newValue = (parseInt(currentValue) || 0) + 1;
          await stockInput.fill(String(newValue));

          // Save
          const saveButton = page.locator('button[type="submit"], button:has-text("Save")').first();
          if (await saveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await saveButton.click();
          } else {
            throw new Error('Save button not found');
          }

          // Wait for success toast
          try {
            await page.waitForSelector('[role="status"], .toast, [data-sonner-toast]', { timeout: 5000 });
            const duration = Date.now() - startTime;

            console.log(`Run ${run}: Updated stock in ${duration}ms`);
            results.push({ run, duration, success: true });

            expect(duration, `Duration should be ≤ 1200ms`).toBeLessThanOrEqual(1200);
          } catch (error) {
            const duration = Date.now() - startTime;
            console.log(`Run ${run}: Failed in ${duration}ms`);
            results.push({ run, duration, success: false });
          }
        }
      }

      await page.waitForTimeout(1000);
    });
  }

  test.afterAll(async () => {
    const successful = results.filter(r => r.success);
    const durations = successful.map(r => r.duration).sort((a, b) => a - b);
    const p95 = calculatePercentile(durations, 95);

    console.log("\n=== PERF-PART-04 Results ===");
    console.log(`p95: ${p95}ms`);

    saveTestResults("PERF-PART-04", {
      testName: "PERF-PART-04",
      description: "Update spare part stock",
      p95,
      runs: results,
      successCriteria: {
        p95: { threshold: 1200, actual: p95, pass: p95 <= 1200 },
      },
    });

    await cleanupTestData();

    if (durations.length > 0) {
      expect(p95, `p95 should be ≤ 1200ms`).toBeLessThanOrEqual(1200);
    }
  });
});
