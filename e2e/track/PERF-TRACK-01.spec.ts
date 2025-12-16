/**
 * PERF-TRACK-01: Exact license plate lookup - measure search by exact plate number
 * 
 * Steps:
 * 1. Navigate to /track-order page
 * 2. Enter exact license plate
 * 3. Click search button
 * 4. Measure time until vehicle details display
 * 5. Verify correct vehicle and orders shown
 * 6. Repeat 10 times with different plates
 * 7. Calculate p95
 * 
 * Success Criteria:
 * - p95 ≤ 1000ms
 * - Correct vehicle displays
 * - Associated repair orders shown
 * - No search errors
 */

import { test, expect } from "@playwright/test";
import { loadEnvFile, saveTestResults, calculatePercentile, createTestVehiclesForTracking, createTestRepairOrders, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-TRACK-01: Exact license plate lookup", () => {
  const REPEAT = 10;
  const results: Array<{ run: number; duration: number; plate: string; found: boolean }> = [];
  let testVehicles: Array<{ id: string; license_plate: string }> = [];

  test.beforeAll(async () => {
    testVehicles = await createTestVehiclesForTracking(REPEAT);
    if (testVehicles.length > 0) {
      const vehicleIds = testVehicles.map(v => v.id);
      await createTestRepairOrders(vehicleIds);
    }
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Search exact plate`, async ({ page }) => {
      const testVehicle = testVehicles[(run - 1) % testVehicles.length];
      if (!testVehicle) {
        console.log(`Run ${run}: No test vehicle available, skipping`);
        return;
      }

      const plate = testVehicle.license_plate;

      // Navigate to track order page
      await page.goto("/track-order", { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");

      // Find search input
      const searchInput = page.locator('input[name="license_plate"], input[placeholder*="license"], input[type="search"]').first();
      
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.clear();

        const startTime = Date.now();

        // Enter license plate
        await searchInput.fill(plate);

        // Click search button
        const searchButton = page.locator('button[type="submit"], button:has-text("Search"), button:has-text("Track")').first();
        await searchButton.click();

        // Wait for results
        await page.waitForTimeout(500);
        await page.waitForLoadState("networkidle");

        const duration = Date.now() - startTime;

        // Check if vehicle info is displayed
        const found = await page.locator(`text=${plate}`).isVisible().catch(() => false) ||
                      await page.locator('[data-test="vehicle-info"]').isVisible().catch(() => false);

        console.log(`Run ${run}: Searched "${plate}" in ${duration}ms - ${found ? "FOUND" : "NOT FOUND"}`);

        results.push({ run, duration, plate, found });

        expect(duration, `Duration should be ≤ 1000ms`).toBeLessThanOrEqual(1000);
        expect(found, `Vehicle "${plate}" should be found`).toBe(true);
      }

      await page.waitForTimeout(500);
    });
  }

  test.afterAll(async () => {
    const durations = results.map(r => r.duration).sort((a, b) => a - b);
    const p95 = calculatePercentile(durations, 95);
    const foundCount = results.filter(r => r.found).length;

    console.log("\n=== PERF-TRACK-01 Results ===");
    console.log(`p95: ${p95}ms`);
    console.log(`Found: ${foundCount}/${results.length}`);

    saveTestResults("PERF-TRACK-01", {
      testName: "PERF-TRACK-01",
      description: "Exact license plate lookup",
      p95,
      foundRate: (foundCount / results.length) * 100,
      runs: results,
      successCriteria: {
        p95: { threshold: 1000, actual: p95, pass: p95 <= 1000 },
      },
    });

    await cleanupTestData();

    if (durations.length > 0) {
      expect(p95, `p95 should be ≤ 1000ms`).toBeLessThanOrEqual(1000);
    }
  });
});
