import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

// Load .env.local into process.env if present
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const key = trimmed.substring(0, eq).trim();
    let value = trimmed.substring(eq + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    if (!(key in process.env)) process.env[key] = value;
  });
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createAdminClient } = require("../../supabase/admin");

test.describe("PERF-PROFILE-05: Delete employee - measure deletion speed and UI update", () => {
  test.setTimeout(120000);

  const ITERATIONS = 3;
  const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "saladegg24@gmail.com";
  const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || "123456";

  type EmployeeRef = { id: string; full_name: string };
  let candidates: EmployeeRef[] = [];
  const metrics: Array<{ attempt: number; durationMs: number; success: boolean; dbGone: boolean }> = [];

  async function loginAsAdmin(page: any) {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.waitForSelector('input[name="email"]', { state: "visible", timeout: 10000 });
    await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle", timeout: 60000 }).catch(() => null),
      page.locator('button[type="submit"]').first().click(),
    ]);
  }

  async function findEmployeesTab(page: any) {
    const candidatesSel = [
      'button:has-text("Nhân viên")',
      'button:has-text("Nhan vien")',
      'a:has-text("Nhân viên")',
      'a:has-text("Nhan vien")',
      '[role="tab"]:has-text("Nhân viên")',
      '[role="tab"]:has-text("Nhan vien")',
      'button:has-text("Employees")',
      'a:has-text("Employees")',
      '[role="tab"]:has-text("Employees")',
    ];
    for (const sel of candidatesSel) {
      const loc = page.locator(sel);
      try { if ((await loc.count()) > 0) return loc.first(); } catch {}
    }
    const regex = page.locator('text=/nhan\\s*vien|nhân\\s*viên|employees/i').first();
    if ((await regex.count()) > 0) return regex;
    throw new Error("Employees tab not found");
  }

  test.beforeAll(async () => {
    const admin = createAdminClient();
    // Prefer test employees created by test runs, fallback to most recent profiles
    const { data } = await admin.from('profiles').select('id,full_name').ilike('full_name', 'Test Employee%').order('created_at', { ascending: false }).limit(ITERATIONS);
    if (Array.isArray(data) && data.length >= ITERATIONS) {
      candidates = (data as EmployeeRef[]).slice(0, ITERATIONS);
    } else {
      // fallback: grab most recently created profiles
      const { data: recent } = await admin.from('profiles').select('id,full_name').order('created_at', { ascending: false }).limit(ITERATIONS);
      if (!recent || (Array.isArray(recent) && recent.length < ITERATIONS)) {
        throw new Error('Not enough profiles to run PERF-PROFILE-05; need at least ' + ITERATIONS);
      }
      candidates = (recent as EmployeeRef[]).slice(0, ITERATIONS);
    }
  });

  test.beforeEach(async () => {
    const resultsDir = path.join(process.cwd(), "test-results");
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
  });

  for (let i = 0; i < ITERATIONS; i++) {
    const attempt = i + 1;
    test(`Attempt ${attempt}/${ITERATIONS}: delete employee`, async ({ page, context }) => {
      await context.clearCookies();
      await loginAsAdmin(page);

      await page.goto('/settings', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');

      const employeesTab = await findEmployeesTab(page);
      await employeesTab.waitFor({ state: 'visible', timeout: 10000 });
      await employeesTab.click();

      const target = candidates[i];

      // Find row (reuse robust search/scroll approach)
      let row = page.locator(`tr:has-text("${target.full_name}")`).first();
      if ((await row.count()) === 0) {
        // try UI search inputs
        const searchSelectors = ['input[placeholder*="Search"]', 'input[placeholder*="Tìm"]', 'input[aria-label*="search" i]', 'input[type="search"]', 'input[name="search"]'];
        for (const sel of searchSelectors) {
          const input = page.locator(sel).first();
          try { if ((await input.count()) > 0) { await input.fill(target.full_name); await input.press('Enter').catch(()=>null); await page.waitForTimeout(300); break; } } catch {}
        }
        row = page.locator(`tr:has-text("${target.full_name}")`).first();
      }

      if ((await row.count()) === 0) {
        // try scrolling containers
        const containerCandidates = ['div[role="table"]', 'div[class*="overflow-auto"]', 'tbody', 'div[class*="max-h" i]', 'div[class*="h-"]'];
        let found = false;
        for (const sel of containerCandidates) {
          const container = page.locator(sel).first();
          if ((await container.count()) === 0) continue;
          const ok = await container.evaluate(async (el: HTMLElement, name: string) => {
            const start = Date.now();
            const max = 4000;
            const step = el.clientHeight || 200;
            while (Date.now() - start < max) {
              if (el.innerText && el.innerText.indexOf(name) !== -1) return true;
              el.scrollBy(0, step);
              // eslint-disable-next-line no-await-in-loop
              await new Promise((r) => setTimeout(r, 120));
            }
            return false;
          }, target.full_name).catch(() => false);
          if (ok) {
            row = page.locator(`tr:has-text("${target.full_name}")`).first();
            if ((await row.count()) > 0) { found = true; break; }
          }
        }
        if (!found && (await row.count()) === 0) {
          const dump = await page.content();
          const dumpPath = path.join(process.cwd(), `test-results/debug-delete-${target.id}.html`);
          fs.writeFileSync(dumpPath, dump);
          throw new Error('Employee row for "' + target.full_name + '" not found; debug HTML: ' + dumpPath);
        }
      }

      // Locate delete button (support text or icon-only)
      const deleteBtn = row.locator('button:has-text("Delete"), button:has-text("Xóa"), button[aria-label*="delete" i], button[title*="delete" i], button:has(svg[class*="trash" i]), button[class*="inline-flex"]:has(svg)').first();
      if ((await deleteBtn.count()) === 0) {
        const loose = row.locator('button[class*="inline-flex"][class*="h-8"][class*="rounded-md"]').first();
        if ((await loose.count()) === 0) throw new Error('Delete button not found for ' + target.full_name);
        await loose.click();
      } else {
        await deleteBtn.click();
      }

      // Wait for confirm dialog and click confirm
      const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes, delete"), button:has-text("Xóa"), button:has-text("Confirm deletion"), button:has-text("Đồng ý")').first();
      // Some dialogs require clicking a secondary confirm inside modal; wait for it
      if ((await confirmBtn.count()) === 0) {
        // try modal actions
        const modal = page.locator('[role="dialog"], [data-state="open"], div[class*="bg-background"]');
        const modalConfirm = modal.locator('button:has-text("Xóa"), button:has-text("Confirm"), button:has-text("Yes")').first();
        if ((await modalConfirm.count()) === 0) {
          // if no explicit confirm found, assume deletion triggered directly
        }
      }

      const start = Date.now();
      // click confirm if visible
      try {
        if ((await confirmBtn.count()) > 0) {
          await Promise.all([
            page.waitForSelector('text=/deleted|xóa|thành công|successfully/i', { timeout: 10000 }),
            confirmBtn.click(),
          ]);
        } else {
          // wait for toast after initial delete click
          await page.waitForSelector('text=/deleted|xóa|thành công|successfully/i', { timeout: 10000 });
        }
      } catch (e) {
        // swallow; we will still check DB/UI
      }
      const duration = Date.now() - start;

      // Verify UI removed (poll)
      let removed = false;
      for (let t = 0; t < 10; t++) {
        const cnt = await page.locator(`text=${target.full_name}`).count();
        if (cnt === 0) { removed = true; break; }
        await page.waitForTimeout(200);
      }

      // Verify DB deletion
      const admin = createAdminClient();
      const { data } = await admin.from('profiles').select('id').eq('id', target.id);
      const dbGone = !Array.isArray(data) || data.length === 0;

      metrics.push({ attempt, durationMs: duration, success: removed, dbGone });

      expect(duration, `deletion latency attempt ${attempt} ≤ 1200ms`).toBeLessThanOrEqual(1200);
      expect(removed, 'employee removed from UI').toBeTruthy();
      expect(dbGone, 'profile record deleted from DB').toBeTruthy();
    });
  }

  test.afterAll(async () => {
    const succ = metrics.filter(m => m.success && m.dbGone).map(m => m.durationMs).sort((a,b)=>a-b);
    if (succ.length === 0) {
      console.log('No successful deletions');
      return;
    }
    const idx = Math.max(0, Math.floor(succ.length * 0.95) - 1);
    const p95 = succ[Math.min(idx, succ.length-1)];

    const results = { testCase: 'PERF-PROFILE-05', metrics, p95 };
    fs.writeFileSync(path.join(process.cwd(), 'test-results', 'PERF-PROFILE-05-results.json'), JSON.stringify(results, null, 2));
    console.log('PERF-PROFILE-05 results:', results);

    expect(p95).toBeLessThanOrEqual(1200);
  });
});
