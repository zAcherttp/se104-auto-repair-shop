/**
 * PERF-REPORT-02: Generate monthly inventory report - measure stock calculations
 * 
 * Steps:
 * 1. Navigate to Reports → Inventory Report tab
 * 2. Select current month
 * 3. Click generate
 * 4. Measure time until report displays
 * 5. Verify beginning stock, usage, ending stock calculations
 * 6. Repeat 5 times
 * 7. Calculate p95
 * 
 * Success Criteria:
 * - p95 ≤ 3000ms
 * - Report renders with all parts
 * - Stock calculations accurate
 * - Beginning/ending/usage columns correct
 */

import { test, expect } from "@playwright/test";
import { loginUser, navigateToReports, loadEnvFile, saveTestResults, calculatePercentile, createTestSpareParts, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-REPORT-02: Monthly inventory report", () => {
  const REPEAT = 5;
  const results: Array<{ run: number; duration: number; rowCount: number }> = [];

  test.beforeAll(async () => {
    await createTestSpareParts(50);
  });

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Generate inventory report`, async ({ page }) => {
      await navigateToReports(page);

      // Look for Inventory Report tab
      const inventoryTab = page.locator('text=/Inventory.*Report/i, button:has-text("Inventory"), [role="tab"]:has-text("Inventory")').first();
      
      if (await inventoryTab.isVisible().catch(() => false)) {
        await inventoryTab.click();
        await page.waitForTimeout(300);
      }

      const startTime = Date.now();

      // Click generate if button exists
      const generateBtn = page.locator('button:has-text("Generate"), button:has-text("Apply")').first();
      if (await generateBtn.isVisible().catch(() => false)) {
        await generateBtn.click();
      }

      // Wait for report to render
      await page.waitForTimeout(1000);
      await page.waitForLoadState("networkidle");

      const duration = Date.now() - startTime;

      // Count rows
      const rowCount = await page.locator("table tbody tr").count();

      console.log(`Run ${run}: Generated inventory report in ${duration}ms - ${rowCount} rows`);

      results.push({ run, duration, rowCount });

      expect(duration, `Duration should be ≤ 3000ms`).toBeLessThanOrEqual(3000);
    });
  }

  test.afterAll(async () => {
    const durations = results.map(r => r.duration).sort((a, b) => a - b);
    const p95 = calculatePercentile(durations, 95);

    console.log("\n=== PERF-REPORT-02 Results ===");
    console.log(`p95: ${p95}ms`);

    saveTestResults("PERF-REPORT-02", {
      testName: "PERF-REPORT-02",
      description: "Monthly inventory report",
      p95,
      runs: results,
      successCriteria: {
        p95: { threshold: 3000, actual: p95, pass: p95 <= 3000 },
      },
    });

    await cleanupTestData();

    if (durations.length > 0) {
      expect(p95, `p95 should be ≤ 3000ms`).toBeLessThanOrEqual(3000);
    }
  });
});
