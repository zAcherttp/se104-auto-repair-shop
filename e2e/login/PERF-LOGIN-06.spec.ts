import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

/**
 * PERF-LOGIN-06: Logout flow latency
 * 
 * Test Case: Measure session cleanup and redirect speed
 * 
 * Success Criteria:
 * - p95 ≤ 1000ms
 * - Redirect to /login completes
 * - Auth cookies cleared
 * - Cannot access /reception without re-login
 * 
 * Dependency: PERF-LOGIN-01
 */

interface LogoutMetrics {
  attempt: number;
  duration: number;
  redirectSuccess: boolean;
  cookiesCleared: boolean;
  accessBlocked: boolean;
  success: boolean;
  error?: string;
}

test.describe("PERF-LOGIN-06: Logout Flow Latency", () => {
  const TEST_ITERATIONS = 5;
  const TEST_EMAIL = "saladegg24@gmail.com";
  const TEST_PASSWORD = "123456";
  
  // Store performance metrics
  const metrics: LogoutMetrics[] = [];

  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    test(`Attempt ${i}/${TEST_ITERATIONS}: Logout latency measurement`, async ({ page, context }) => {
      console.log(`\n⏱️ Attempt ${i}: Starting logout flow test...`);
      
      // Step 1: Login first (prerequisite)
      await context.clearCookies();
      
      await page.goto("/login", { waitUntil: "networkidle" });
      
      // Clear storage after navigation to avoid SecurityError
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Fill login form
      await page.locator('input[name="email"]').fill(TEST_EMAIL);
      await page.locator('input[name="password"]').fill(TEST_PASSWORD);
      
      // Submit and wait for redirect
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL((url) => url.toString().includes("/reception") || url.toString().includes("/home"), { timeout: 30000 });
      
      console.log(`   ✓ Logged in successfully`);
      
      // Step 2: Wait for page to fully load
      await page.waitForLoadState("networkidle");
      
      // Step 3: Find logout control. Robust approach:
      // 1. Wait for header/nav to load (logout typically lives there)
      // 2. Try to open user menu triggers (avatar/menu button)
      // 3. Use a broad text regex locator for localized variants
      await Promise.any([
        page.waitForSelector('header', { timeout: 5000 }).catch(() => null),
        page.waitForSelector('nav', { timeout: 5000 }).catch(() => null),
        page.waitForSelector('[data-testid="sidebar"]', { timeout: 5000 }).catch(() => null),
      ]).catch(() => null);

      const logoutQueries = [
        'button:has-text("Đăng xuất")',
        'a:has-text("Đăng xuất")',
        '[role="menuitem"]:has-text("Đăng xuất")',
        '[role="link"]:has-text("Đăng xuất")',
        'button:has-text("Sign out")',
        'a:has-text("Sign out")',
        'button:has-text("Log out")',
        'a:has-text("Log out")',
      ];

      let logoutButton = page.locator(logoutQueries.join(', ')).first();

      // Try opening common user menu triggers first
      const userMenuTrigger = page.locator('[data-testid="user-menu"], [aria-label*="user"], .user-menu, button[aria-haspopup], [data-cy="user-menu"], .avatar-button');
      if ((await userMenuTrigger.count()) > 0) {
        try {
          await userMenuTrigger.first().click();
          await page.waitForTimeout(300);
        } catch {}
        logoutButton = page.locator(logoutQueries.join(', ')).first();
      }

      // Broad text fallback (regex) to catch any element that contains the logout text
      // including cases like <div>Đăng xuất</div>
      const textFallback = page.locator('text=/Đăng xuất|Sign out|Log out/i').first();

      let isVisible = await logoutButton.isVisible().catch(() => false);
      if (!isVisible && (await textFallback.count()) > 0) {
        try {
          await textFallback.waitFor({ state: 'visible', timeout: 2000 });
          logoutButton = textFallback;
          isVisible = true;
        } catch {}
      }

      // Final diagnostic: if still not found, capture DOM snapshot to help debugging
      if (!isVisible) {
        const pageHtml = await page.content();
        await page.screenshot({ path: `test-results/PERF-LOGIN-06-no-logout-button-${i}.png`, fullPage: true });
        // write a small debug file with nearest header HTML to results for faster inspection
        try {
          fs.writeFileSync(`test-results/PERF-LOGIN-06-no-logout-button-${i}.html`, pageHtml);
        } catch (e) {}
        throw new Error(`Logout button not found. Saved screenshot and page HTML to test-results/PERF-LOGIN-06-no-logout-button-${i}.*`);
      }
      if (!isVisible) {
        await page.screenshot({ path: `test-results/PERF-LOGIN-06-no-logout-button-${i}.png`, fullPage: true });
        throw new Error("Logout button not found");
      }
      
      console.log(`   ✓ Found logout button`);
      
      // Step 4: Start timing and click logout
      const startTime = Date.now();
      
      try {
        // Start a navigation waiter before clicking (catch to avoid unhandled rejection)
        const navigationPromise = page.waitForNavigation({ waitUntil: "networkidle", timeout: 20000 }).catch(() => null);

        // Click logout
        await logoutButton.click();

        // Wait for first positive indicator: navigation, URL includes /login, or login form visible.
        // Use Promise.any so a single slow waiter doesn't reject the whole wait.
        await Promise.any([
          navigationPromise,
          page.waitForURL((url) => url.toString().includes("/login"), { timeout: 20000 }).catch(() => null),
          page.waitForSelector('input[name="email"], form#login, [data-testid="login-form"]', { state: "visible", timeout: 20000 }).catch(() => null),
        ]).catch(() => null);

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Step 5: Verify redirect to /login OR presence of login form (SPA may not change URL)
        const currentUrl = page.url();
        const loginFormPresent = (await page.locator('input[name="email"], form#login, [data-testid="login-form"]').count()) > 0;
        const redirectSuccess = currentUrl.includes("/login") || loginFormPresent;
        
        console.log(`   ✓ Redirected to ${currentUrl} in ${duration}ms`);
        
        // Step 6: Check if auth cookies are cleared
        const cookies = await context.cookies();
        const authCookies = cookies.filter((c) => 
          c.name.includes("auth") || 
          c.name.includes("session") || 
          c.name.includes("token") ||
          c.name.includes("supabase")
        );
        const cookiesCleared = authCookies.length === 0;
        
        console.log(`   ${cookiesCleared ? "✓" : "✗"} Auth cookies cleared (${authCookies.length} remaining)`);
        
        // Step 7: Try to access /reception without login
        await page.goto("/reception", { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle");
        
        const afterAccessUrl = page.url();
        const accessBlocked = !afterAccessUrl.includes("/reception");
        
        console.log(`   ${accessBlocked ? "✓" : "✗"} Access to /reception blocked: ${afterAccessUrl}`);
        
        // Record metrics
        metrics.push({
          attempt: i,
          duration,
          redirectSuccess,
          cookiesCleared,
          accessBlocked,
          success: true,
        });
        
        console.log(`✓ Attempt ${i}: ${duration}ms - Success`);
        
        // Screenshot for first attempt
        if (i === 1) {
          await page.screenshot({ path: `test-results/PERF-LOGIN-06-logout-complete-${i}.png` });
        }
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Try to take screenshot only if page is still open
        try {
          if (!page.isClosed()) {
            await page.screenshot({ path: `test-results/PERF-LOGIN-06-failure-${i}.png`, fullPage: true });
          }
        } catch (screenshotError) {
          console.log(`⚠️ Could not take failure screenshot: ${screenshotError}`);
        }
        
        metrics.push({
          attempt: i,
          duration,
          redirectSuccess: false,
          cookiesCleared: false,
          accessBlocked: false,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
        
        console.log(`✗ Attempt ${i}: ${duration}ms - Failed`);
        console.log(`   Error: ${error}`);
        
        throw error;
      }
    });
  }

  test.afterAll(async () => {
    // Calculate statistics
    const successfulAttempts = metrics.filter((m) => m.success);
    const durations = successfulAttempts.map((m) => m.duration).sort((a, b) => a - b);
    
    if (durations.length === 0) {
      console.log("\n❌ No successful attempts to analyze!");
      return;
    }

    const successRate = (successfulAttempts.length / metrics.length) * 100;
    const p95Index = Math.floor(durations.length * 0.95);
    const p95 = durations[p95Index];
    const min = durations[0];
    const max = durations[durations.length - 1];
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;

    const allRedirected = successfulAttempts.every((m) => m.redirectSuccess);
    const allCookiesCleared = successfulAttempts.every((m) => m.cookiesCleared);
    const allAccessBlocked = successfulAttempts.every((m) => m.accessBlocked);

    // Print detailed results
    console.log("\n" + "=".repeat(80));
    console.log("PERF-LOGIN-06: Logout Flow Latency Results");
    console.log("=".repeat(80));
    console.log("\n📊 Individual Attempts:");
    metrics.forEach((m) => {
      const status = m.success ? "✓" : "✗";
      const errorMsg = m.error ? ` (${m.error})` : "";
      console.log(`  ${status} Attempt ${m.attempt}: ${m.duration}ms - Redirect: ${m.redirectSuccess}, Cookies: ${m.cookiesCleared}, Blocked: ${m.accessBlocked}${errorMsg}`);
    });

    console.log("\n📈 Statistical Analysis:");
    console.log(`  Total Attempts: ${metrics.length}`);
    console.log(`  Successful: ${successfulAttempts.length} (${successRate.toFixed(1)}%)`);
    console.log(`  Failed: ${metrics.length - successfulAttempts.length}`);
    console.log(`  Min: ${min}ms`);
    console.log(`  Max: ${max}ms`);
    console.log(`  Average: ${avg.toFixed(2)}ms`);
    console.log(`  p95: ${p95}ms`);

    console.log("\n✅ Success Criteria:");
    const p95Pass = p95 <= 1000;
    const redirectPass = allRedirected;
    const cookiesPass = allCookiesCleared;
    const accessPass = allAccessBlocked;
    
    console.log(`  ${p95Pass ? "✓" : "✗"} p95 ≤ 1000ms: ${p95}ms ${p95Pass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${redirectPass ? "✓" : "✗"} Redirect to /login completes ${redirectPass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${cookiesPass ? "✓" : "✗"} Auth cookies cleared ${cookiesPass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${accessPass ? "✓" : "✗"} Cannot access /reception without re-login ${accessPass ? "(PASS)" : "(FAIL)"}`);

    const allPassed = p95Pass && redirectPass && cookiesPass && accessPass;
    console.log(`\n${allPassed ? "🎉 ALL CRITERIA PASSED" : "❌ SOME CRITERIA FAILED"}`);
    console.log("=".repeat(80) + "\n");

    // Export results to JSON file
    const results = {
      testCase: "PERF-LOGIN-06",
      description: "Logout flow latency measurement",
      timestamp: new Date().toISOString(),
      metrics: {
        totalAttempts: metrics.length,
        successfulAttempts: successfulAttempts.length,
        successRate: successRate,
        durations: {
          min,
          max,
          avg,
          p95,
        },
        allRedirected,
        allCookiesCleared,
        allAccessBlocked,
      },
      successCriteria: {
        p95Threshold: 1000,
        p95Actual: p95,
        p95Pass,
        redirectPass,
        cookiesPass,
        accessPass,
        overallPass: allPassed,
      },
      individualAttempts: metrics,
    };

    const resultsDir = path.join(process.cwd(), "test-results");
    
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(resultsDir, "PERF-LOGIN-06-results.json"),
      JSON.stringify(results, null, 2)
    );

    // Assert final results
    expect(p95, `p95 should be ≤ 1000ms, got ${p95}ms`).toBeLessThanOrEqual(1000);
    expect(allRedirected, "All attempts should redirect to /login").toBe(true);
    expect(allCookiesCleared, "All attempts should clear auth cookies").toBe(true);
    expect(allAccessBlocked, "All attempts should block access to /reception").toBe(true);
  });
});
