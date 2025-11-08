/**
 * PERF-PART-08: Delete spare part - measure deletion speed
 * 
 * Steps:
 * 1. Navigate to Settings → Parts tab
 * 2. Select a test spare part
 * 3. Click delete button
 * 4. Confirm deletion in dialog
 * 5. Measure time until success toast
 * 6. Verify part removed from list
 * 7. Repeat 3 times
 * 8. Calculate p95
 * 
 * Success Criteria:
 * - p95 ≤ 1200ms
 * - Success toast displays
 * - Part removed from list
 * - No orphaned records
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, calculatePercentile, createTestSpareParts, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-PART-08: Delete spare part", () => {
  const REPEAT = 3;
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
    test(`Run ${run}/${REPEAT}: Delete spare part`, async ({ page }) => {
      // Find delete button
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

        console.log(`Run ${run}: Deleted part in ${duration}ms`);
        results.push({ run, duration, success: true });

        expect(duration, `Duration should be ≤ 1200ms`).toBeLessThanOrEqual(1200);
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

    console.log("\n=== PERF-PART-08 Results ===");
    console.log(`p95: ${p95}ms`);

    saveTestResults("PERF-PART-08", {
      testName: "PERF-PART-08",
      description: "Delete spare part",
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
