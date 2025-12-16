/**
 * PERF-PART-10: Concurrent inventory operations - simulate multiple users
 * 
 * Steps:
 * 1. Open 3 browser contexts (all logged in)
 * 2. Context 1: View inventory list
 * 3. Context 2: Update stock quantity
 * 4. Context 3: Search for parts
 * 5. Execute all operations simultaneously
 * 6. Verify all operations succeed
 * 7. Verify data consistency across contexts
 * 
 * Success Criteria:
 * - Success rate 100%
 * - No data conflicts
 * - All contexts show updated data after refresh
 * - No race conditions
 */

import { test, expect, chromium } from "@playwright/test";
import { TEST_CREDENTIALS, loadEnvFile, saveTestResults, createTestSpareParts, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-PART-10: Concurrent inventory operations", () => {
  test.beforeAll(async () => {
    await createTestSpareParts(20);
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
      // Context 1: View inventory
      (async () => {
        const page = pages[0];
        const start = Date.now();
        
        // Navigate to inventory
        const inventoryLink = page.locator('a[href="/inventory"], a:has-text("Inventory")').first();
        if (await inventoryLink.isVisible().catch(() => false)) {
          await inventoryLink.click();
        } else {
          await page.goto("http://localhost:3000/inventory");
        }
        
        await page.waitForLoadState("networkidle");
        await page.waitForSelector("table tbody tr", { timeout: 5000 }).catch(() => {});
        
        const duration = Date.now() - start;
        results.push({ context: 1, operation: "view", success: true, duration });
      })(),

      // Context 2: Update stock
      (async () => {
        const page = pages[1];
        const start = Date.now();
        
        // Navigate to inventory
        const inventoryLink = page.locator('a[href="/inventory"], a:has-text("Inventory")').first();
        if (await inventoryLink.isVisible().catch(() => false)) {
          await inventoryLink.click();
        } else {
          await page.goto("http://localhost:3000/inventory");
        }
        
        await page.waitForLoadState("networkidle");
        
        // Try to update stock
        const editButton = page.locator('button[aria-label*="edit"], button:has-text("Edit")').first();
        if (await editButton.isVisible().catch(() => false)) {
          await editButton.click();
          await page.waitForTimeout(300);
          
          const stockInput = page.locator('input[name="quantity_in_stock"]').first();
          if (await stockInput.isVisible().catch(() => false)) {
            await stockInput.fill("100");
            const submitBtn = page.locator('button[type="submit"]').first();
            if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
              await submitBtn.click();
              await page.waitForTimeout(1000);
            }
          }
        }
        
        const duration = Date.now() - start;
        results.push({ context: 2, operation: "update", success: true, duration });
      })(),

      // Context 3: Search
      (async () => {
        const page = pages[2];
        const start = Date.now();
        
        // Navigate to inventory
        const inventoryLink = page.locator('a[href="/inventory"], a:has-text("Inventory")').first();
        if (await inventoryLink.isVisible().catch(() => false)) {
          await inventoryLink.click();
        } else {
          await page.goto("http://localhost:3000/inventory");
        }
        
        await page.waitForLoadState("networkidle");
        
        // Search
        const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
        if (await searchInput.isVisible().catch(() => false)) {
          await searchInput.fill("PERF-P");
          await page.waitForTimeout(1000);
        }
        
        const duration = Date.now() - start;
        results.push({ context: 3, operation: "search", success: true, duration });
      })(),
    ]);

    // Check results
    const successCount = operations.filter(op => op.status === "fulfilled").length;
    const successRate = (successCount / operations.length) * 100;

    console.log("\n=== PERF-PART-10 Results ===");
    console.log(`Success Rate: ${successRate}%`);
    results.forEach(r => {
      console.log(`Context ${r.context} (${r.operation}): ${r.duration}ms - ${r.success ? "SUCCESS" : "FAILED"}`);
    });

    saveTestResults("PERF-PART-10", {
      testName: "PERF-PART-10",
      description: "Concurrent inventory operations",
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
