import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

/**
 * PERF-LOGIN-08: Form input responsiveness
 * 
 * Test Case: Measure keystroke and interaction lag
 * 
 * Success Criteria:
 * - Average keystroke delay ≤ 50ms
 * - No visible lag during typing
 * - Password masking renders immediately
 */

interface InputMetrics {
  field: string;
  character: string;
  delay: number;
}

test.describe("PERF-LOGIN-08: Form Input Responsiveness", () => {
  test("Measure input responsiveness", async ({ page, context }) => {
    // Clear everything
    await context.clearCookies();
    
    console.log("\n⏱️ Starting input responsiveness test...");
    
    // Navigate to login page
    await page.goto("/login", { waitUntil: "networkidle" });
    
    // Clear storage after navigation to avoid SecurityError
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    const emailMetrics: InputMetrics[] = [];
    const passwordMetrics: InputMetrics[] = [];
    
    // Test string: 20 characters
    const testString = "test@example.com1234";
    
    try {
      // Test email input
      console.log("\n📝 Testing email input field...");
      const emailInput = page.locator('input[name="email"]');
      await emailInput.focus();
      
      for (let i = 0; i < testString.length; i++) {
        const char = testString[i];
        const startTime = performance.now();
        
        // Type one character
        await emailInput.type(char, { delay: 0 });
        
        // Wait for the value to update
        await page.waitForFunction(
          ({ selector, expectedLength }) => {
            const input = document.querySelector(selector) as HTMLInputElement;
            return input && input.value.length === expectedLength;
          },
          { selector: 'input[name="email"]', expectedLength: i + 1 },
          { timeout: 1000 }
        );
        
        const endTime = performance.now();
        const delay = endTime - startTime;
        
        emailMetrics.push({
          field: "email",
          character: char,
          delay,
        });
        
        if (delay > 50) {
          console.log(`   ⚠️ Slow response for '${char}': ${delay.toFixed(2)}ms`);
        }
      }
      
      const avgEmailDelay = emailMetrics.reduce((sum, m) => sum + m.delay, 0) / emailMetrics.length;
      console.log(`   ✓ Email field: Average delay ${avgEmailDelay.toFixed(2)}ms`);
      
      // Clear email field
      await emailInput.clear();
      
      // Test password input
      console.log("\n📝 Testing password input field...");
      const passwordInput = page.locator('input[name="password"]');
      await passwordInput.focus();
      
      for (let i = 0; i < testString.length; i++) {
        const char = testString[i];
        const startTime = performance.now();
        
        // Type one character
        await passwordInput.type(char, { delay: 0 });
        
        // Wait for the value to update
        await page.waitForFunction(
          ({ selector, expectedLength }) => {
            const input = document.querySelector(selector) as HTMLInputElement;
            return input && input.value.length === expectedLength;
          },
          { selector: 'input[name="password"]', expectedLength: i + 1 },
          { timeout: 1000 }
        );
        
        const endTime = performance.now();
        const delay = endTime - startTime;
        
        passwordMetrics.push({
          field: "password",
          character: char,
          delay,
        });
        
        if (delay > 50) {
          console.log(`   ⚠️ Slow response for '${char}': ${delay.toFixed(2)}ms`);
        }
      }
      
      const avgPasswordDelay = passwordMetrics.reduce((sum, m) => sum + m.delay, 0) / passwordMetrics.length;
      console.log(`   ✓ Password field: Average delay ${avgPasswordDelay.toFixed(2)}ms`);
      
      // Verify password masking
      const passwordType = await passwordInput.getAttribute("type");
      const passwordMasked = passwordType === "password";
      console.log(`   ${passwordMasked ? "✓" : "✗"} Password masking: ${passwordMasked ? "Enabled" : "Disabled"}`);
      
      // Calculate overall statistics
      const allMetrics = [...emailMetrics, ...passwordMetrics];
      const avgDelay = allMetrics.reduce((sum, m) => sum + m.delay, 0) / allMetrics.length;
      const maxDelay = Math.max(...allMetrics.map((m) => m.delay));
      const minDelay = Math.min(...allMetrics.map((m) => m.delay));
      
      // Check for visible lag (any keystroke > 100ms is considered laggy)
      const laggyKeystrokes = allMetrics.filter((m) => m.delay > 100);
      const noVisibleLag = laggyKeystrokes.length === 0;
      
      // Print detailed results
      console.log("\n" + "=".repeat(80));
      console.log("PERF-LOGIN-08: Form Input Responsiveness Results");
      console.log("=".repeat(80));
      
      console.log("\n📈 Statistical Analysis:");
      console.log(`  Total Keystrokes: ${allMetrics.length}`);
      console.log(`  Average Delay: ${avgDelay.toFixed(2)}ms`);
      console.log(`  Min Delay: ${minDelay.toFixed(2)}ms`);
      console.log(`  Max Delay: ${maxDelay.toFixed(2)}ms`);
      console.log(`  Email Field Average: ${avgEmailDelay.toFixed(2)}ms`);
      console.log(`  Password Field Average: ${avgPasswordDelay.toFixed(2)}ms`);
      console.log(`  Laggy Keystrokes (>100ms): ${laggyKeystrokes.length}`);
      
      console.log("\n✅ Success Criteria:");
      const avgDelayPass = avgDelay <= 50;
      const noLagPass = noVisibleLag;
      const maskingPass = passwordMasked;
      
      console.log(`  ${avgDelayPass ? "✓" : "✗"} Average keystroke delay ≤ 50ms: ${avgDelay.toFixed(2)}ms ${avgDelayPass ? "(PASS)" : "(FAIL)"}`);
      console.log(`  ${noLagPass ? "✓" : "✗"} No visible lag during typing ${noLagPass ? "(PASS)" : "(FAIL)"}`);
      console.log(`  ${maskingPass ? "✓" : "✗"} Password masking renders immediately ${maskingPass ? "(PASS)" : "(FAIL)"}`);
      
      const allPassed = avgDelayPass && noLagPass && maskingPass;
      console.log(`\n${allPassed ? "🎉 ALL CRITERIA PASSED" : "❌ SOME CRITERIA FAILED"}`);
      console.log("=".repeat(80) + "\n");
      
      // Export results to JSON file
      const results = {
        testCase: "PERF-LOGIN-08",
        description: "Form input responsiveness measurement",
        timestamp: new Date().toISOString(),
        metrics: {
          totalKeystrokes: allMetrics.length,
          avgDelay,
          minDelay,
          maxDelay,
          avgEmailDelay,
          avgPasswordDelay,
          laggyKeystrokes: laggyKeystrokes.length,
          passwordMasked,
        },
        successCriteria: {
          avgDelayThreshold: 50,
          avgDelayActual: avgDelay,
          avgDelayPass,
          noLagPass,
          maskingPass,
          overallPass: allPassed,
        },
        keystrokeDetails: allMetrics,
      };
      
      const resultsDir = path.join(process.cwd(), "test-results");
      
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(resultsDir, "PERF-LOGIN-08-results.json"),
        JSON.stringify(results, null, 2)
      );
      
      // Take screenshot
      await page.screenshot({ path: `test-results/PERF-LOGIN-08-inputs-filled.png` });
      
      // Assert final results
      expect(avgDelay, `Average keystroke delay should be ≤ 50ms, got ${avgDelay.toFixed(2)}ms`).toBeLessThanOrEqual(50);
      expect(noVisibleLag, "No visible lag should occur during typing").toBe(true);
      expect(passwordMasked, "Password masking should render immediately").toBe(true);
      
    } catch (error) {
      console.log(`✗ Test failed: ${error}`);
      
      // Try to take screenshot only if page is still open
      try {
        if (!page.isClosed()) {
          await page.screenshot({ path: `test-results/PERF-LOGIN-08-failure.png`, fullPage: true });
        }
      } catch (screenshotError) {
        console.log(`⚠️ Could not take failure screenshot: ${screenshotError}`);
      }
      
      throw error;
    }
  });
});
