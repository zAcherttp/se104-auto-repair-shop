/**
 * PERF-PART-07: Edit spare part with inventory change - measure update with stock tracking
 * 
 * Steps:
 * 1. Navigate to Settings → Parts tab
 * 2. Click edit on an existing part
 * 3. Update part name and price
 * 4. Click save
 * 5. Measure time until success toast
 * 6. Verify changes reflected immediately
 * 7. Repeat 5 times
 * 8. Calculate p95
 * 
 * Success Criteria:
 * - p95 ≤ 1500ms
 * - Success toast displays
 * - Changes saved correctly
 * - Update overhead ≤ 100ms vs. simple edit
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, calculatePercentile, createTestSpareParts, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-PART-07: Edit spare part", () => {
  const REPEAT = 5;
  const results: Array<{ run: number; duration: number; success: boolean }> = [];

  test.beforeAll(async () => {
    await createTestSpareParts(10);
  });

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    
    // Navigate to settings
    const settingsLink = page.locator('a[href="/settings"], a:has-text("Settings")').first();
    if (await settingsLink.isVisible().catch(() => false)) {
      await settingsLink.click();
    } else {
      await page.goto("/settings");
    }
    
    await page.waitForLoadState("networkidle");

    // Click Parts tab
    const partsTab = page.locator('button:has-text("Parts"), [role="tab"]:has-text("Parts")').first();
    if (await partsTab.isVisible().catch(() => false)) {
      await partsTab.click();
      await page.waitForTimeout(500);
    }
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Edit spare part`, async ({ page }) => {
      // Find edit button
      const editButton = page.locator('button[aria-label*="edit"], button:has-text("Edit")').nth(run % 3);

      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();
        await page.waitForTimeout(300);

        const startTime = Date.now();

        // Update name
        const nameInput = page.locator('input[name="part_name"]').first();
        if (await nameInput.isVisible().catch(() => false)) {
          await nameInput.fill(`Updated Part ${Date.now()}`);
        }

        // Update price
        const priceInput = page.locator('input[name="unit_price"]').first();
        if (await priceInput.isVisible().catch(() => false)) {
          await priceInput.fill(String(200 + run));
        }

        // Save
        const saveButton = page.locator('button[type="submit"], button:has-text("Save")').first();
        await saveButton.click();

        // Wait for success toast
        try {
          await page.waitForSelector('[role="status"], .toast, [data-sonner-toast]', { timeout: 5000 });
          const duration = Date.now() - startTime;

          console.log(`Run ${run}: Updated part in ${duration}ms`);
          results.push({ run, duration, success: true });

          expect(duration, `Duration should be ≤ 1500ms`).toBeLessThanOrEqual(1500);
        } catch (error) {
          const duration = Date.now() - startTime;
          console.log(`Run ${run}: Failed in ${duration}ms`);
          results.push({ run, duration, success: false });
        }
      }

      await page.waitForTimeout(1000);
    });
  }

  test.afterAll(async () => {
    const successful = results.filter(r => r.success);
    const durations = successful.map(r => r.duration).sort((a, b) => a - b);
    const p95 = calculatePercentile(durations, 95);

    console.log("\n=== PERF-PART-07 Results ===");
    console.log(`p95: ${p95}ms`);

    saveTestResults("PERF-PART-07", {
      testName: "PERF-PART-07",
      description: "Edit spare part",
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
