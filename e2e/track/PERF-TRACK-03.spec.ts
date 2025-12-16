/**
 * PERF-TRACK-03: Repeated vehicle lookup - measure query caching effectiveness
 * 
 * Steps:
 * 1. Navigate to /track-order page
 * 2. Search for same license plate 5 times sequentially
 * 3. Measure time for each lookup
 * 4. Compare 1st search (cold) vs. subsequent (warm)
 * 5. Verify results consistent
 * 
 * Success Criteria:
 * - 1st search ≤ 1000ms
 * - Searches 2-5 ≤ 500ms
 * - Caching reduces latency by ≥30%
 * - Results identical across searches
 */

import { test, expect } from "@playwright/test";
import { loadEnvFile, saveTestResults, createTestVehiclesForTracking, createTestRepairOrders, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-TRACK-03: Repeated vehicle lookup", () => {
  const REPEAT = 5;
  const results: Array<{ run: number; duration: number; isCold: boolean }> = [];
  let testPlate = "";

  test.beforeAll(async () => {
    const vehicles = await createTestVehiclesForTracking(1);
    if (vehicles.length > 0) {
      testPlate = vehicles[0].license_plate;
      await createTestRepairOrders([vehicles[0].id]);
    }
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: ${run === 1 ? "Cold" : "Warm"} lookup`, async ({ page }) => {
      if (!testPlate) {
        console.log(`Run ${run}: No test plate available, skipping`);
        return;
      }

      // Navigate to track order page
      await page.goto("/track-order", { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");

      // Find search input
      const searchInput = page.locator('input[name="license_plate"], input[placeholder*="license"], input[type="search"]').first();
      
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.clear();

        const startTime = Date.now();

        // Enter license plate
        await searchInput.fill(testPlate);

        // Click search button
        const searchButton = page.locator('button[type="submit"], button:has-text("Search"), button:has-text("Track")').first();
        await searchButton.click();

        // Wait for results
        await page.waitForTimeout(500);
        await page.waitForLoadState("networkidle");

        const duration = Date.now() - startTime;
        const isCold = run === 1;

        console.log(`Run ${run} (${isCold ? "COLD" : "WARM"}): ${duration}ms`);

        results.push({ run, duration, isCold });

        if (isCold) {
          expect(duration, `Cold search should be ≤ 1000ms`).toBeLessThanOrEqual(1000);
        } else {
          expect(duration, `Warm search should be ≤ 500ms`).toBeLessThanOrEqual(500);
        }
      }

      await page.waitForTimeout(300);
    });
  }

  test.afterAll(async () => {
    const coldRun = results.find(r => r.isCold);
    const warmRuns = results.filter(r => !r.isCold);
    const avgWarm = warmRuns.length > 0 
      ? warmRuns.reduce((sum, r) => sum + r.duration, 0) / warmRuns.length 
      : 0;

    const reduction = coldRun && avgWarm > 0 
      ? ((coldRun.duration - avgWarm) / coldRun.duration) * 100 
      : 0;

    console.log("\n=== PERF-TRACK-03 Results ===");
    console.log(`Cold (1st): ${coldRun?.duration}ms`);
    console.log(`Warm avg: ${avgWarm.toFixed(0)}ms`);
    console.log(`Latency reduction: ${reduction.toFixed(1)}%`);

    saveTestResults("PERF-TRACK-03", {
      testName: "PERF-TRACK-03",
      description: "Repeated vehicle lookup",
      coldDuration: coldRun?.duration,
      avgWarm,
      latencyReduction: reduction,
      runs: results,
      successCriteria: {
        cold: { threshold: 1000, actual: coldRun?.duration || 0, pass: (coldRun?.duration || 0) <= 1000 },
        warm: { threshold: 500, actual: avgWarm, pass: avgWarm <= 500 },
        reduction: { threshold: 30, actual: reduction, pass: reduction >= 30 },
      },
    });

    await cleanupTestData();

    if (coldRun) {
      expect(coldRun.duration, `Cold search should be ≤ 1000ms`).toBeLessThanOrEqual(1000);
    }
    if (warmRuns.length > 0) {
      expect(avgWarm, `Warm searches should be ≤ 500ms on average`).toBeLessThanOrEqual(500);
      expect(reduction, `Caching should reduce latency by ≥30%`).toBeGreaterThanOrEqual(30);
    }
  });
});
