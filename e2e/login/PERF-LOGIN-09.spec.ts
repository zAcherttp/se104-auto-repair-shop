import { test, expect } from "@playwright/test";

/**
 * PERF-LOGIN-09: Concurrent login sessions
 * 
 * Test Case: Simulate multiple users logging in simultaneously
 * 
 * Success Criteria:
 * - Success rate ≥ 95% (≥4 out of 5 succeed)
 * - p95 ≤ 4000ms
 * - No race conditions or auth conflicts
 * - Each session isolated correctly
 * 
 * Dependency: PERF-LOGIN-01
 */

interface ConcurrentLoginMetrics {
  contextId: number;
  duration: number;
  success: boolean;
  redirectUrl: string;
  error?: string;
}

test.describe("PERF-LOGIN-09: Concurrent Login Sessions", () => {
  const CONCURRENT_SESSIONS = 5;
  const TEST_CREDENTIALS = [
    { email: "saladegg24@gmail.com", password: "123456" },
    { email: "saladegg24@gmail.com", password: "123456" },
    { email: "saladegg24@gmail.com", password: "123456" },
    { email: "saladegg24@gmail.com", password: "123456" },
    { email: "saladegg24@gmail.com", password: "123456" }, // Use existing valid credentials
  ];
  
  const metrics: ConcurrentLoginMetrics[] = [];

  test("Concurrent login load test", async ({ browser }) => {
    console.log(`\n⏱️ Starting concurrent login test with ${CONCURRENT_SESSIONS} sessions...`);
    
    try {
      // Create multiple browser contexts in parallel
      const contexts = await Promise.all(
        Array.from({ length: CONCURRENT_SESSIONS }, async (_, i) => {
          const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
          });
          return { contextId: i + 1, context };
        })
      );
      
      console.log(`✓ Created ${contexts.length} browser contexts`);
      
      // Navigate all contexts to login page in parallel
      const pages = await Promise.all(
        contexts.map(async ({ contextId, context }) => {
          const page = await context.newPage();
          await page.goto("/login", { waitUntil: "networkidle" });
          return { contextId, page, context };
        })
      );
      
      console.log(`✓ All contexts navigated to /login`);
      
      // Fill forms in parallel
      await Promise.all(
        pages.map(async ({ contextId, page }) => {
          const credentials = TEST_CREDENTIALS[contextId - 1];
          await page.locator('input[name="email"]').fill(credentials.email);
          await page.locator('input[name="password"]').fill(credentials.password);
          console.log(`   ✓ Context ${contextId}: Form filled`);
        })
      );
      
      console.log(`✓ All forms filled, submitting simultaneously...`);
      
      // Submit all forms simultaneously and measure
      const startTime = Date.now();
      
      const loginResults = await Promise.allSettled(
        pages.map(async ({ contextId, page }) => {
          const submitStartTime = Date.now();
          
          try {
            const submitButton = page.locator('button[type="submit"]').first();
            
            // Set up navigation promise
            const navigationPromise = page.waitForURL(
              (url) => url.toString().includes("/reception") || url.toString().includes("/home"),
              { timeout: 30000 }
            );
            
            // Click submit
            await submitButton.click();
            await navigationPromise;
            
            const submitEndTime = Date.now();
            const duration = submitEndTime - submitStartTime;
            const redirectUrl = page.url();
            
            console.log(`   ✓ Context ${contextId}: Success in ${duration}ms → ${redirectUrl}`);
            
            return {
              contextId,
              duration,
              success: true,
              redirectUrl,
            };
          } catch (error) {
            const submitEndTime = Date.now();
            const duration = submitEndTime - submitStartTime;
            const redirectUrl = page.url();
            
            console.log(`   ✗ Context ${contextId}: Failed in ${duration}ms`);
            console.log(`      Error: ${error instanceof Error ? error.message : String(error)}`);
            
            return {
              contextId,
              duration,
              success: false,
              redirectUrl,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        })
      );
      
      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      
      console.log(`\n✓ All submissions completed in ${totalDuration}ms`);
      
      // Process results
      loginResults.forEach((result) => {
        if (result.status === "fulfilled") {
          metrics.push(result.value);
        } else {
          console.log(`   ✗ Unexpected failure: ${result.reason}`);
        }
      });
      
      // Verify session isolation
      console.log("\n🔒 Verifying session isolation...");
      const isolationChecks = await Promise.all(
        pages.map(async ({ contextId, page, context }) => {
          const cookies = await context.cookies();
          const authCookies = cookies.filter((c) => 
            c.name.includes("auth") || 
            c.name.includes("session") || 
            c.name.includes("token") ||
            c.name.includes("supabase")
          );
          
          console.log(`   Context ${contextId}: ${authCookies.length} auth cookies`);
          return authCookies.length > 0;
        })
      );
      
      const allIsolated = isolationChecks.every((hasAuth) => hasAuth);
      
      // Take screenshots
      await Promise.all(
        pages.map(async ({ contextId, page }) => {
          await page.screenshot({ path: `test-results/PERF-LOGIN-09-context-${contextId}.png` });
        })
      );
      
      // Clean up
      await Promise.all(contexts.map(({ context }) => context.close()));
      
      // Calculate statistics
      const successfulLogins = metrics.filter((m) => m.success);
      const successRate = (successfulLogins.length / metrics.length) * 100;
      const durations = successfulLogins.map((m) => m.duration).sort((a, b) => a - b);
      
      const p95Index = Math.floor(durations.length * 0.95);
      const p95 = durations.length > 0 ? durations[p95Index] : 0;
      const avgDuration = durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
      const minDuration = durations.length > 0 ? durations[0] : 0;
      const maxDuration = durations.length > 0 ? durations[durations.length - 1] : 0;
      
      // Print detailed results
      console.log("\n" + "=".repeat(80));
      console.log("PERF-LOGIN-09: Concurrent Login Sessions Results");
      console.log("=".repeat(80));
      console.log("\n📊 Individual Sessions:");
      metrics.forEach((m) => {
        const status = m.success ? "✓" : "✗";
        const errorMsg = m.error ? ` (${m.error})` : "";
        console.log(`  ${status} Context ${m.contextId}: ${m.duration}ms → ${m.redirectUrl}${errorMsg}`);
      });
      
      console.log("\n📈 Statistical Analysis:");
      console.log(`  Total Sessions: ${metrics.length}`);
      console.log(`  Successful: ${successfulLogins.length} (${successRate.toFixed(1)}%)`);
      console.log(`  Failed: ${metrics.length - successfulLogins.length}`);
      if (durations.length > 0) {
        console.log(`  Min Duration: ${minDuration}ms`);
        console.log(`  Max Duration: ${maxDuration}ms`);
        console.log(`  Average Duration: ${avgDuration.toFixed(2)}ms`);
        console.log(`  p95: ${p95}ms`);
      }
      console.log(`  Total Test Duration: ${totalDuration}ms`);
      console.log(`  All Sessions Isolated: ${allIsolated ? "✓" : "✗"}`);
      
      console.log("\n✅ Success Criteria:");
      const successRatePass = successRate >= 95;
      const p95Pass = p95 <= 4000;
      const noConflictsPass = allIsolated;
      
      console.log(`  ${successRatePass ? "✓" : "✗"} Success rate ≥ 95%: ${successRate.toFixed(1)}% ${successRatePass ? "(PASS)" : "(FAIL)"}`);
      console.log(`  ${p95Pass ? "✓" : "✗"} p95 ≤ 4000ms: ${p95}ms ${p95Pass ? "(PASS)" : "(FAIL)"}`);
      console.log(`  ${noConflictsPass ? "✓" : "✗"} No race conditions or auth conflicts ${noConflictsPass ? "(PASS)" : "(FAIL)"}`);
      console.log(`  ${allIsolated ? "✓" : "✗"} Each session isolated correctly ${allIsolated ? "(PASS)" : "(FAIL)"}`);
      
      const allPassed = successRatePass && p95Pass && noConflictsPass && allIsolated;
      console.log(`\n${allPassed ? "🎉 ALL CRITERIA PASSED" : "❌ SOME CRITERIA FAILED"}`);
      console.log("=".repeat(80) + "\n");
      
      // Export results to JSON file
      const results = {
        testCase: "PERF-LOGIN-09",
        description: "Concurrent login sessions simulation",
        timestamp: new Date().toISOString(),
        metrics: {
          totalSessions: metrics.length,
          successfulSessions: successfulLogins.length,
          successRate: successRate,
          durations: {
            min: minDuration,
            max: maxDuration,
            avg: avgDuration,
            p95: p95,
          },
          totalTestDuration: totalDuration,
          allIsolated,
        },
        successCriteria: {
          successRateThreshold: 95,
          successRateActual: successRate,
          successRatePass,
          p95Threshold: 4000,
          p95Actual: p95,
          p95Pass,
          noConflictsPass,
          isolationPass: allIsolated,
          overallPass: allPassed,
        },
        individualSessions: metrics,
      };
      
      const fs = require("fs");
      const path = require("path");
      const resultsDir = path.join(process.cwd(), "test-results");
      
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(resultsDir, "PERF-LOGIN-09-results.json"),
        JSON.stringify(results, null, 2)
      );
      
      // Assert final results
      expect(successRate, `Success rate should be ≥ 95%, got ${successRate.toFixed(1)}%`).toBeGreaterThanOrEqual(95);
      expect(p95, `p95 should be ≤ 4000ms, got ${p95}ms`).toBeLessThanOrEqual(4000);
      expect(allIsolated, "All sessions should be isolated correctly").toBe(true);
      
    } catch (error) {
      console.log(`✗ Concurrent login test failed: ${error}`);
      throw error;
    }
  });
});
