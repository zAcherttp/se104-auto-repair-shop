/**
 * PERF-ORDER-06: Repair order list with 100+ records - measure rendering and scroll performance
 * 
 * Steps:
 * 1. Seed database with 100 test vehicles and repair orders
 * 2. Navigate to /vehicles
 * 3. Measure initial table render time
 * 4. Scroll through entire list while measuring FPS
 * 5. Measure longest frame duration
 * 6. Repeat 3 times
 * 
 * Success Criteria:
 * - Initial render ≤ 3000ms
 * - Scroll FPS ≥ 50
 * - Longest frame ≤ 200ms
 * - All 100 orders render
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, createTestVehicles, createTestRepairOrders, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-ORDER-06: Repair order list performance (100 records)", () => {
  const SEED_COUNT = 100;
  const REPEAT = 3;
  const results: Array<any> = [];

  test.beforeAll(async () => {
    const vehicles = await createTestVehicles(SEED_COUNT);
    if (vehicles.length > 0) {
      const vehicleIds = vehicles.map((v: any) => v.id);
      await createTestRepairOrders(vehicleIds, SEED_COUNT);
    }
  });

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  for (let pass = 1; pass <= REPEAT; pass++) {
    test(`Run ${pass}/${REPEAT}: Measure rendering and scroll`, async ({ page }) => {
      await page.goto("/vehicles", { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");

      // Helper: find a robust row selector
      const rowSelectorCandidates = [
        "table tbody tr",
        "[data-test=vehicle-row]",
        ".vehicle-row",
        "[role=row]",
      ];

      let rowSelector: string | null = null;
      for (const sel of rowSelectorCandidates) {
        try {
          await page.waitForSelector(sel, { state: "attached", timeout: 3000 });
          rowSelector = sel;
          break;
        } catch {
          // try next
        }
      }

      if (!rowSelector) {
        // helpful debug output — guard against closed page
        try {
          if (!page.isClosed()) {
            const bodyHtml = await page.content();
            try {
              const resultsDir = require("path").join(process.cwd(), "test-results");
              const fs = require("fs");
              if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
              fs.writeFileSync(require("path").join(resultsDir, `PERF-ORDER-06-no-rows-pass-${pass}.html`), bodyHtml);
            } catch (e) {
              // ignore write errors
            }
            await page.screenshot({ path: `test-results/PERF-ORDER-06-no-rows-pass-${pass}.png`, fullPage: true }).catch(() => {});
          } else {
            // page closed — record that fact
            try {
              const fs = require("fs");
              const path = require("path");
              const resultsDir = path.join(process.cwd(), "test-results");
              if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
              fs.writeFileSync(path.join(resultsDir, `PERF-ORDER-06-no-rows-pass-${pass}-page-closed.txt`), `Page was closed before rows could be found. Current URL unknown.`);
            } catch {}
          }
        } catch (e) {
          // ignore errors while collecting debug output
        }

        throw new Error(
          `Vehicle list rows not found on /vehicles - tried selectors ${rowSelectorCandidates.join(", ")}.` +
            ` Check test-results/PERF-ORDER-06-no-rows-pass-${pass} for artifacts.`
        );
      }

      // Measure initial render time
      const start = Date.now();
      const maxWait = 10000;
      const pollInterval = 250;
      let elapsed = 0;
      let rowCount = 0;
      
      while (elapsed < maxWait) {
        rowCount = await page.locator(rowSelector).count();
        if (rowCount >= SEED_COUNT) break;
        await page.waitForTimeout(pollInterval);
        elapsed += pollInterval;
      }

      const renderTime = Date.now() - start;

      // Prepare in-page FPS measurement utilities
      await page.addInitScript(() => {
        (window as any).__perf = {
          frames: 0,
          start: 0,
          lastFrameTs: 0,
          longestFrame: 0,
          running: false,
          startRecording() {
            this.frames = 0;
            this.start = performance.now();
            this.lastFrameTs = this.start;
            this.longestFrame = 0;
            this.running = true;
            const loop = (ts: number) => {
              if (!this.running) return;
              const delta = ts - this.lastFrameTs;
              // Track longest frame (ms)
              if (delta > this.longestFrame) this.longestFrame = delta;
              this.lastFrameTs = ts;
              this.frames++;
              requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
          },
          stopRecording() {
            this.running = false;
            const duration = performance.now() - this.start;
            const fps = this.frames / (duration / 1000);
            return {
              frames: this.frames,
              duration,
              fps,
              longestFrame: this.longestFrame,
            };
          },
        };
      });

      // Start recording and perform scroll by steps
      const metrics = await page.evaluate(async ({ rowSel, seedCount }: any) => {
        const results: any = {};

        // Start FPS recorder
        (window as any).__perf.startRecording();

        // small helper to scroll to bottom in steps
        function scrollToBottomStepwise() {
          return new Promise<void>((resolve) => {
            const step = () => {
              const prev = window.scrollY;
              window.scrollBy({ top: window.innerHeight * 0.9, left: 0, behavior: 'auto' });
              if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 2) {
                // reached bottom
                resolve();
              } else if (window.scrollY === prev) {
                // no change (maybe short page) - resolve
                resolve();
              } else {
                // continue next tick
                setTimeout(step, 50);
              }
            };
            step();
          });
        }

        const beforeMemory = (performance as any).memory ? (performance as any).memory.usedJSHeapSize : null;
        await scrollToBottomStepwise();
        // small pause to let frames settle
        await new Promise((r) => setTimeout(r, 200));

        const perf = (window as any).__perf.stopRecording();
        const afterMemory = (performance as any).memory ? (performance as any).memory.usedJSHeapSize : null;

        // Count rows in DOM
        const rows = document.querySelectorAll(rowSel).length;

        return {
          rows,
          fps: perf.fps,
          longestFrame: perf.longestFrame,
          duration: perf.duration,
          frames: perf.frames,
          memoryBefore: beforeMemory,
          memoryAfter: afterMemory,
        };
      }, { rowSel: rowSelector });

      // Save result for this pass
      results.push({ pass, renderTime, domRowCount: rowCount, ...metrics });

      // Sanity checks / assertions for pass
      console.log(`PERF-ORDER-06 pass ${pass}: renderTime=${renderTime}ms, rows=${metrics.rows}, fps=${metrics.fps.toFixed(1)}, longestFrame=${metrics.longestFrame.toFixed(1)}ms`);

      // Assertions
      expect(renderTime, `Initial render time should be ≤ 3000ms`).toBeLessThanOrEqual(3000);
      expect(metrics.fps, `Scroll FPS should be ≥ 50`).toBeGreaterThanOrEqual(50);
      expect(metrics.longestFrame, `Longest frame should be ≤ 200ms`).toBeLessThanOrEqual(200);
      expect(metrics.rows, `All ${SEED_COUNT} orders should be present`).toBeGreaterThanOrEqual(SEED_COUNT);

      if (metrics.memoryBefore != null && metrics.memoryAfter != null) {
        const delta = metrics.memoryAfter - metrics.memoryBefore;
        console.log(`Memory delta: ${delta} bytes`);
        expect(delta).toBeLessThanOrEqual(100 * 1024 * 1024);
      }
    });
  }

  test.afterAll(async () => {
    console.log("\n=== PERF-ORDER-06 Results ===");
    results.forEach((r, i) => {
      console.log(`Run ${i + 1}: render=${r.renderTime}ms, fps=${r.fps.toFixed(1)}, longestFrame=${r.longestFrame.toFixed(1)}ms`);
    });

    saveTestResults("PERF-ORDER-06", {
      testName: "PERF-ORDER-06",
      description: "Repair order list with 100+ records",
      runs: results,
    });

    await cleanupTestData();
  });
});
