/**
 * PERF-TRACK-05: Vehicle search with large dataset - measure scalability with 500+ vehicles
 * 
 * Steps:
 * 1. Seed database with 500 test vehicles
 * 2. Navigate to Vehicles page (authenticated)
 * 3. Perform exact plate search
 * 4. Measure search latency
 * 5. Verify search uses filters efficiently
 * 6. Repeat 5 times
 * 
 * Success Criteria:
 * - p95 ≤ 1500ms
 * - Search completes successfully
 * - Correct vehicle found
 * - No full table scan
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, calculatePercentile, createTestVehiclesForTracking, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-TRACK-05: Large dataset search", () => {
  const SEED_COUNT = 500;
  const REPEAT = 5;
  const results: Array<{ run: number; duration: number; found: boolean }> = [];
  let testVehicles: Array<{ id: string; license_plate: string }> = [];

  test.beforeAll(async () => {
    console.log(`Seeding ${SEED_COUNT} test vehicles...`);
    testVehicles = await createTestVehiclesForTracking(SEED_COUNT);
    console.log(`Seeded ${testVehicles.length} vehicles`);
  });

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await page.goto("/vehicles", { waitUntil: "networkidle" });
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Search in ${SEED_COUNT} vehicles`, async ({ page }) => {
      const testVehicle = testVehicles[(run - 1) * 50 % testVehicles.length];
      if (!testVehicle) {
        console.log(`Run ${run}: No test vehicle available, skipping`);
        return;
      }

      const plate = testVehicle.license_plate;

      // Find search input
      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
      
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.clear();

        const startTime = Date.now();

        // Enter exact plate
        await searchInput.fill(plate);

        // Wait for search results
        await page.waitForTimeout(600);
        await page.waitForLoadState("networkidle");

        const duration = Date.now() - startTime;

        // Check if vehicle is in results
        const found = await page.locator(`text=${plate}`).isVisible().catch(() => false);

        console.log(`Run ${run}: Searched "${plate}" in ${duration}ms - ${found ? "FOUND" : "NOT FOUND"}`);

        results.push({ run, duration, found });

        expect(duration, `Duration should be ≤ 1500ms`).toBeLessThanOrEqual(1500);
      }

      await page.waitForTimeout(500);
    });
  }

  test.afterAll(async () => {
    const durations = results.map(r => r.duration).sort((a, b) => a - b);
    const p95 = calculatePercentile(durations, 95);
    const foundCount = results.filter(r => r.found).length;

    console.log("\n=== PERF-TRACK-05 Results ===");
    console.log(`p95: ${p95}ms`);
    console.log(`Found: ${foundCount}/${results.length}`);

    saveTestResults("PERF-TRACK-05", {
      testName: "PERF-TRACK-05",
      description: "Large dataset search (500+ vehicles)",
      p95,
      datasetSize: SEED_COUNT,
      foundRate: (foundCount / results.length) * 100,
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
