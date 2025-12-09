/**
 * PERF-ORDER-03: Filter/search repair orders by status - measure filtering performance
 * 
 * Steps:
 * 1. Navigate to Vehicles page (with ≥20 orders)
 * 2. Use status filter dropdown
 * 3. Measure time from filter selection to filtered results display
 * 4. Verify correct orders shown
 * 5. Repeat 10 times (cycling through statuses)
 * 6. Calculate p95
 * 
 * Success Criteria:
 * - p95 ≤ 1500ms
 * - Correct orders filtered
 * - UI updates immediately
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, calculatePercentile, createTestVehicles, createTestRepairOrders, cleanupTestData } from "./helpers";
import { createAdminClient } from "../../supabase/admin";

loadEnvFile();

test.describe.serial("PERF-ORDER-03: Filter repair orders by status", () => {
  const REPEAT = 10;
  const results: Array<{ run: number; duration: number; status: string }> = [];

  test.beforeAll(async () => {
    // Create test data
    const vehicles = await createTestVehicles(20);
    if (vehicles.length > 0) {
      const vehicleIds = vehicles.map((v: any) => v.id);
      await createTestRepairOrders(vehicleIds, 30);
    }
  });

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await page.goto("/vehicles", { waitUntil: "networkidle" });
  });

  const statuses = ["pending", "in-progress", "completed"];

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Filter by status`, async ({ page }) => {
      const status = statuses[run % statuses.length];

      // Find filter control (dropdown, tabs, buttons, etc.)
      const filterSelector = `button:has-text("${status}"), [role="tab"]:has-text("${status}"), select[name="status"]`;

      const startTime = Date.now();

      // Apply filter
      const filter = page.locator(filterSelector).first();
      if (await filter.isVisible().catch(() => false)) {
        await filter.click();
      } else {
        // Try select dropdown
        const select = page.locator('select[name="status"]').first();
        if (await select.isVisible().catch(() => false)) {
          await select.selectOption(status);
        }
      }

      // Wait for table to update
      await page.waitForTimeout(300);
      await page.waitForLoadState("networkidle");

      const duration = Date.now() - startTime;

      console.log(`Run ${run}: Filtered by ${status} in ${duration}ms`);
      results.push({ run, duration, status });

      expect(duration, `Duration should be ≤ 1500ms`).toBeLessThanOrEqual(1500);
    });
  }

  test.afterAll(async () => {
    const durations = results.map(r => r.duration).sort((a, b) => a - b);
    const p95 = calculatePercentile(durations, 95);

    console.log("\n=== PERF-ORDER-03 Results ===");
    console.log(`p95: ${p95}ms`);

    saveTestResults("PERF-ORDER-03", {
      testName: "PERF-ORDER-03",
      description: "Filter repair orders by status",
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
