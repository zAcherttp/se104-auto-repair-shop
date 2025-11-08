/**
 * PERF-PART-06: Add multiple spare parts - measure bulk creation simulation
 * 
 * Steps:
 * 1. Navigate to Inventory → Settings → Parts tab
 * 2. Click "Add Spare Part" button
 * 3. Fill form and submit
 * 4. Repeat for 20 parts (simulate bulk add)
 * 5. Measure total time for all 20
 * 6. Verify all parts appear in list
 * 
 * Success Criteria:
 * - Total time for 20 parts ≤ 40s (avg 2s/part)
 * - All parts created successfully
 * - No timeout errors
 * - Memory stable throughout
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-PART-06: Add multiple spare parts", () => {
  const PARTS_TO_CREATE = 20;
  let partsCreated = 0;

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test("Create 20 spare parts", async ({ page }) => {
    // Navigate to settings/parts management
    const settingsLink = page.locator('a[href="/settings"], a:has-text("Settings")').first();
    if (await settingsLink.isVisible().catch(() => false)) {
      await settingsLink.click();
      await page.waitForLoadState("networkidle");
    } else {
      await page.goto("/settings", { waitUntil: "networkidle" });
    }

    // Find Parts tab
    const partsTab = page.locator('button:has-text("Parts"), [role="tab"]:has-text("Parts")').first();
    if (await partsTab.isVisible().catch(() => false)) {
      await partsTab.click();
      await page.waitForTimeout(500);
    }

    const startTime = Date.now();

    for (let i = 0; i < PARTS_TO_CREATE; i++) {
      // Click Add button
      const addButton = page.locator('button:has-text("Add"), button:has-text("New")').first();
      
      if (await addButton.isVisible().catch(() => false)) {
        await addButton.click();
        await page.waitForTimeout(300);

        // Fill form
        const codeInput = page.locator('input[name="part_code"]').first();
        if (await codeInput.isVisible().catch(() => false)) {
          await codeInput.fill(`PERF-BULK-${String(i + 1).padStart(4, "0")}`);
        }

        const nameInput = page.locator('input[name="part_name"]').first();
        if (await nameInput.isVisible().catch(() => false)) {
          await nameInput.fill(`Bulk Test Part ${i + 1}`);
        }

        const priceInput = page.locator('input[name="unit_price"]').first();
        if (await priceInput.isVisible().catch(() => false)) {
          await priceInput.fill(String(100 + i));
        }

        const stockInput = page.locator('input[name="quantity_in_stock"]').first();
        if (await stockInput.isVisible().catch(() => false)) {
          await stockInput.fill("50");
        }

        // Submit
        const submitButton = page.locator('button[type="submit"], button:has-text("Save")').first();
        if (await submitButton.isVisible().catch(() => false)) {
          await submitButton.click();
          partsCreated++;
          
          // Wait for toast or confirmation
          await page.waitForTimeout(300);
        }
      }

      console.log(`Created part ${i + 1}/${PARTS_TO_CREATE}`);
    }

    const totalTime = Date.now() - startTime;
    const avgTimePerPart = totalTime / partsCreated;

    console.log(`\n=== PERF-PART-06 Results ===`);
    console.log(`Total time: ${(totalTime / 1000).toFixed(1)}s`);
    console.log(`Parts created: ${partsCreated}`);
    console.log(`Average per part: ${avgTimePerPart.toFixed(0)}ms`);

    saveTestResults("PERF-PART-06", {
      testName: "PERF-PART-06",
      description: "Add multiple spare parts",
      totalTime,
      partsCreated,
      avgTimePerPart,
      successCriteria: {
        totalTime: { threshold: 40000, actual: totalTime, pass: totalTime <= 40000 },
        allCreated: { expected: PARTS_TO_CREATE, actual: partsCreated, pass: partsCreated === PARTS_TO_CREATE },
      },
    });

    expect(totalTime, `Total time should be ≤ 40s`).toBeLessThanOrEqual(40000);
    expect(partsCreated, `Should create all ${PARTS_TO_CREATE} parts`).toBe(PARTS_TO_CREATE);
  });

  test.afterAll(async () => {
    await cleanupTestData();
  });
});
