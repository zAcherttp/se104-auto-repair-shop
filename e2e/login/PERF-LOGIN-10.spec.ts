import { test, expect } from "@playwright/test";

/**
 * PERF-LOGIN-10: Login form validation speed
 * 
 * Test Case: Measure client-side validation response time
 * 
 * Success Criteria:
 * - All validation errors display ≤ 200ms
 * - Correct error messages shown
 * - Form submission blocked
 * - No server request made
 */

interface ValidationMetrics {
  testCase: string;
  responseTime: number;
  errorShown: boolean;
  correctMessage: boolean;
  submissionBlocked: boolean;
  noServerRequest: boolean;
}

test.describe("PERF-LOGIN-10: Login Form Validation Speed", () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear everything
    await context.clearCookies();
    
    // Navigate to login page
    await page.goto("/login", { waitUntil: "networkidle" });
    
    // Clear storage after navigation to avoid SecurityError
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("Empty email field validation", async ({ page }) => {
    console.log("\n⏱️ Testing empty email validation...");
    
    // Track network requests
    let serverRequestMade = false;
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/auth/") || url.includes("login")) {
        serverRequestMade = true;
        console.log(`   ⚠️ Server request detected: ${url}`);
      }
    });
    
    // Leave email empty, fill password
    await page.locator('input[name="password"]').fill("somepassword");
    
    // Start timing
    const startTime = Date.now();
    
    // Click submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for validation error (could be inline or toast)
    try {
      const errorElement = page.locator('[role="alert"], .error, [data-error], .text-destructive, .text-red-500').first();
      await errorElement.waitFor({ state: "visible", timeout: 1000 });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Check error message content
      const errorText = await errorElement.textContent();
      const hasExpectedError = !!(errorText?.toLowerCase().includes("email") || 
                                 errorText?.toLowerCase().includes("required") ||
                                 errorText?.toLowerCase().includes("field"));
      
      console.log(`   ✓ Validation error shown in ${responseTime}ms`);
      console.log(`   Message: "${errorText}"`);
      console.log(`   Expected error: ${hasExpectedError ? "✓" : "✗"}`);
      console.log(`   Server request made: ${serverRequestMade ? "✗" : "✓"}`);
      
      // Verify criteria
      expect(responseTime, "Validation should respond within 200ms").toBeLessThanOrEqual(200);
      expect(hasExpectedError, "Should show correct error message").toBe(true);
      expect(serverRequestMade, "Should not make server request").toBe(false);
    } catch (error) {
      console.log(`   ✗ Validation error not shown`);
      throw error;
    }
  });

  test("Invalid email format validation", async ({ page }) => {
    console.log("\n⏱️ Testing invalid email format validation...");
    
    // Track network requests
    let serverRequestMade = false;
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/auth/") || url.includes("login")) {
        serverRequestMade = true;
        console.log(`   ⚠️ Server request detected: ${url}`);
      }
    });
    
    // Fill invalid email format
    await page.locator('input[name="email"]').fill("notanemail");
    await page.locator('input[name="password"]').fill("somepassword");
    
    // Start timing
    const startTime = Date.now();
    
    // Click submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for validation error
    try {
      const errorElement = page.locator('[role="alert"], .error, [data-error], .text-destructive, .text-red-500').first();
      await errorElement.waitFor({ state: "visible", timeout: 1000 });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Check error message content
      const errorText = await errorElement.textContent();
      const hasExpectedError = !!(errorText?.toLowerCase().includes("email") || 
                                 errorText?.toLowerCase().includes("valid") ||
                                 errorText?.toLowerCase().includes("format") ||
                                 errorText?.toLowerCase().includes("invalid"));
      
      console.log(`   ✓ Validation error shown in ${responseTime}ms`);
      console.log(`   Message: "${errorText}"`);
      console.log(`   Expected error: ${hasExpectedError ? "✓" : "✗"}`);
      console.log(`   Server request made: ${serverRequestMade ? "✗" : "✓"}`);
      
      // Verify criteria
      expect(responseTime, "Validation should respond within 200ms").toBeLessThanOrEqual(200);
      expect(hasExpectedError, "Should show correct error message").toBe(true);
      expect(serverRequestMade, "Should not make server request").toBe(false);
    } catch (error) {
      console.log(`   ✗ Validation error not shown`);
      throw error;
    }
  });

  test("Short password validation", async ({ page }) => {
    console.log("\n⏱️ Testing short password validation...");
    
    // Track network requests
    let serverRequestMade = false;
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/auth/") || url.includes("login")) {
        serverRequestMade = true;
        console.log(`   ⚠️ Server request detected: ${url}`);
      }
    });
    
    // Fill valid email, short password
    await page.locator('input[name="email"]').fill("test@example.com");
    await page.locator('input[name="password"]').fill("123"); // Too short
    
    // Start timing
    const startTime = Date.now();
    
    // Click submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for validation error
    try {
      const errorElement = page.locator('[role="alert"], .error, [data-error], .text-destructive, .text-red-500').first();
      await errorElement.waitFor({ state: "visible", timeout: 1000 });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Check error message content
      const errorText = await errorElement.textContent();
      const hasExpectedError = !!(errorText?.toLowerCase().includes("password") || 
                                 errorText?.toLowerCase().includes("characters") ||
                                 errorText?.toLowerCase().includes("length") ||
                                 errorText?.toLowerCase().includes("short"));
      
      console.log(`   ✓ Validation error shown in ${responseTime}ms`);
      console.log(`   Message: "${errorText}"`);
      console.log(`   Expected error: ${hasExpectedError ? "✓" : "✗"}`);
      console.log(`   Server request made: ${serverRequestMade ? "✗" : "✓"}`);
      
      // Verify criteria
      expect(responseTime, "Validation should respond within 200ms").toBeLessThanOrEqual(200);
      expect(hasExpectedError, "Should show correct error message").toBe(true);
      expect(serverRequestMade, "Should not make server request").toBe(false);
    } catch (error) {
      console.log(`   ✗ Validation error not shown`);
      throw error;
    }
  });

  test("Empty form validation", async ({ page }) => {
    console.log("\n⏱️ Testing empty form validation...");
    
    // Track network requests
    let serverRequestMade = false;
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/auth/") || url.includes("login")) {
        serverRequestMade = true;
        console.log(`   ⚠️ Server request detected: ${url}`);
      }
    });
    
    // Leave both fields empty
    
    // Start timing
    const startTime = Date.now();
    
    // Click submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for validation error
    try {
      const errorElement = page.locator('[role="alert"], .error, [data-error], .text-destructive, .text-red-500').first();
      await errorElement.waitFor({ state: "visible", timeout: 1000 });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Check error message content
      const errorText = await errorElement.textContent();
      const hasExpectedError = !!(errorText?.toLowerCase().includes("required") || 
                                 errorText?.toLowerCase().includes("field") ||
                                 errorText?.toLowerCase().includes("empty"));
      
      console.log(`   ✓ Validation error shown in ${responseTime}ms`);
      console.log(`   Message: "${errorText}"`);
      console.log(`   Expected error: ${hasExpectedError ? "✓" : "✗"}`);
      console.log(`   Server request made: ${serverRequestMade ? "✗" : "✓"}`);
      
      // Verify criteria
      expect(responseTime, "Validation should respond within 200ms").toBeLessThanOrEqual(200);
      expect(hasExpectedError, "Should show correct error message").toBe(true);
      expect(serverRequestMade, "Should not make server request").toBe(false);
      
      // Take screenshot
      await page.screenshot({ path: `test-results/PERF-LOGIN-10-validation.png` });
    } catch (error) {
      console.log(`   ✗ Validation error not shown`);
      
      // Try to take screenshot only if page is still open
      try {
        if (!page.isClosed()) {
          await page.screenshot({ path: `test-results/PERF-LOGIN-10-failure.png`, fullPage: true });
        }
      } catch (screenshotError) {
        console.log(`⚠️ Could not take failure screenshot: ${screenshotError}`);
      }
      
      throw error;
    }
  });
});
