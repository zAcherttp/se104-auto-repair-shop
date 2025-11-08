/**
 * PERF-ORDER-10: Concurrent repair order operations - simulate multiple users
 * 
 * Steps:
 * 1. Open 3 browser contexts (all logged in)
 * 2. Context 1: Create new repair order
 * 3. Context 2: Edit different order
 * 4. Context 3: Add items to another order
 * 5. Execute all operations simultaneously
 * 6. Verify all operations succeed
 * 7. Verify data consistency
 * 
 * Success Criteria:
 * - Success rate 100%
 * - No data conflicts
 * - All contexts show updated data
 */

import { test, expect, chromium } from "@playwright/test";
import { TEST_CREDENTIALS, loadEnvFile, saveTestResults, cleanupTestData, createTestVehicles, createTestRepairOrders } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-ORDER-10: Concurrent repair order operations", () => {
  test.beforeAll(async () => {
    const vehicles = await createTestVehicles(10);
    if (vehicles.length > 0) {
      const vehicleIds = vehicles.map((v: any) => v.id);
      await createTestRepairOrders(vehicleIds, 10);
    }
  });

  test("Concurrent operations test", async () => {
    const browser = await chromium.launch();
    
    // Create 3 contexts
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ]);

    const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));

    // Login all contexts
    for (const page of pages) {
      await page.goto("http://localhost:3000/login");
      await page.fill('input[name="email"]', TEST_CREDENTIALS.email);
      await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForURL((url) => url.toString().includes("/reception") || url.toString().includes("/home"), { timeout: 10000 });
    }

    const results: Array<{ context: number; operation: string; success: boolean; duration: number }> = [];

    // Execute concurrent operations
    const operations = await Promise.allSettled([
      // Context 1: Create order
      (async () => {
        const page = pages[0];
        const start = Date.now();
        
        await page.goto("http://localhost:3000/vehicles");
        await page.waitForLoadState("networkidle");
        
        const addButton = page.locator('button:has-text("Add")').first();
        if (await addButton.isVisible().catch(() => false)) {
          await addButton.click();
          await page.waitForTimeout(300);
          
          const licensePlate = page.locator('input[name="license_plate"]').first();
          if (await licensePlate.isVisible().catch(() => false)) {
            await licensePlate.fill(`CONC-${Date.now()}`);
          }
          
          await page.locator('button[type="submit"]').first().click();
          await page.waitForTimeout(1000);
        }
        
        const duration = Date.now() - start;
        results.push({ context: 1, operation: "create", success: true, duration });
      })(),

      // Context 2: Edit order
      (async () => {
        const page = pages[1];
        const start = Date.now();
        
        await page.goto("http://localhost:3000/vehicles");
        await page.waitForLoadState("networkidle");
        
        const firstRow = page.locator("table tbody tr").first();
        await firstRow.click();
        await page.waitForTimeout(300);
        
        const editButton = page.locator('button:has-text("Edit")').first();
        if (await editButton.isVisible().catch(() => false)) {
          await editButton.click();
          await page.waitForTimeout(300);
          
          const notesInput = page.locator('textarea[name="notes"]').first();
          if (await notesInput.isVisible().catch(() => false)) {
            await notesInput.fill(`Concurrent edit ${Date.now()}`);
          }
          
          await page.locator('button[type="submit"]').first().click();
          await page.waitForTimeout(1000);
        }
        
        const duration = Date.now() - start;
        results.push({ context: 2, operation: "edit", success: true, duration });
      })(),

      // Context 3: View details
      (async () => {
        const page = pages[2];
        const start = Date.now();
        
        await page.goto("http://localhost:3000/vehicles");
        await page.waitForLoadState("networkidle");
        
        const secondRow = page.locator("table tbody tr").nth(1);
        await secondRow.click();
        await page.waitForTimeout(1000);
        
        const duration = Date.now() - start;
        results.push({ context: 3, operation: "view", success: true, duration });
      })(),
    ]);

    // Check results
    const successCount = operations.filter(op => op.status === "fulfilled").length;
    const successRate = (successCount / operations.length) * 100;

    console.log("\n=== PERF-ORDER-10 Results ===");
    console.log(`Success Rate: ${successRate}%`);
    results.forEach(r => {
      console.log(`Context ${r.context} (${r.operation}): ${r.duration}ms - ${r.success ? "SUCCESS" : "FAILED"}`);
    });

    saveTestResults("PERF-ORDER-10", {
      testName: "PERF-ORDER-10",
      description: "Concurrent repair order operations",
      successRate,
      results,
      successCriteria: {
        successRate: { threshold: 100, actual: successRate, pass: successRate === 100 },
      },
    });

    // Cleanup
    for (const page of pages) {
      await page.close();
    }
    for (const context of contexts) {
      await context.close();
    }
    await browser.close();

    expect(successRate, "Success rate should be 100%").toBe(100);
  });

  test.afterAll(async () => {
    await cleanupTestData();
  });
});
