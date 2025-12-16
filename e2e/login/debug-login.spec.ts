import { test, expect } from "@playwright/test";

/**
 * Debug test to see what's happening on the login page
 */

test.describe("Debug Login Page", () => {
  test("Check login page structure", async ({ page, context }) => {
    // Clear everything
    await context.clearCookies();
    
    console.log("1. Navigating to login page...");
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    
    console.log("2. Current URL:", page.url());
    
    // Wait a bit for any redirects
    await page.waitForTimeout(2000);
    
    console.log("3. URL after wait:", page.url());
    
    // Take screenshot
    await page.screenshot({ path: "test-results/debug-login-page.png", fullPage: true });
    console.log("4. Screenshot saved");
    
    // Get page title
    const title = await page.title();
    console.log("5. Page title:", title);
    
    // Check for email input
    const emailInputs = await page.locator('input[type="email"]').count();
    console.log("6. Email inputs found:", emailInputs);
    
    // Check for password input
    const passwordInputs = await page.locator('input[type="password"]').count();
    console.log("7. Password inputs found:", passwordInputs);
    
    // Check for any inputs
    const allInputs = await page.locator('input').count();
    console.log("8. Total inputs found:", allInputs);
    
    // Check for buttons
    const buttons = await page.locator('button').count();
    console.log("9. Buttons found:", buttons);
    
    // Get all button texts
    const buttonTexts = await page.locator('button').allTextContents();
    console.log("10. Button texts:", buttonTexts);
    
    // Get page HTML (first 2000 chars)
    const html = await page.content();
    console.log("11. Page HTML (first 500 chars):", html.substring(0, 500));
    
    // Check if we're on a different page
    if (page.url().includes("/reception") || page.url().includes("/home")) {
      console.log("⚠️ WARNING: Already logged in! Page redirected to:", page.url());
    }
  });

  test("Try to find form elements with various selectors", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    
    console.log("\n=== Testing various selectors ===");
    
    // Try different selectors
    const selectors = [
      'input[type="email"]',
      'input[type="text"]',
      'input[name="email"]',
      'input[placeholder*="email"]',
      'input[placeholder*="Email"]',
      'form input',
      '[role="textbox"]',
    ];
    
    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      console.log(`Selector: ${selector} -> Count: ${count}`);
      
      if (count > 0) {
        const visible = await page.locator(selector).first().isVisible();
        console.log(`  First element visible: ${visible}`);
      }
    }
  });
});
