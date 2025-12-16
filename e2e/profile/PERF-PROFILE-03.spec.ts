import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

// Load .env.local into process.env if present (same approach as other perf tests)
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

// Import admin client after envs loaded
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createAdminClient } = require("../../supabase/admin");

test.describe("PERF-PROFILE-03: Add New Employee Performance", () => {
  test.setTimeout(120000);

  const ITERATIONS = 5; // repeat 5 times as requested
  const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "saladegg24@gmail.com";
  const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || "123456";

  type Metrics = { attempt: number; durationMs: number; success: boolean; dbCount: number };
  const metrics: Metrics[] = [];

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
    const candidates = [
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
    for (const sel of candidates) {
      const loc = page.locator(sel);
      try { if ((await loc.count()) > 0) return loc.first(); } catch {}
    }
    const regex = page.locator('text=/nhan\\s*vien|nhân\\s*viên|employees/i').first();
    if ((await regex.count()) > 0) return regex;
    throw new Error("Employees tab not found");
  }

  test.beforeEach(async ({}, testInfo) => {
    // ensure test-results exists
    const resultsDir = path.join(process.cwd(), "test-results");
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
  });

  for (let i = 1; i <= ITERATIONS; i++) {
    test(`Attempt ${i}/${ITERATIONS}: Add employee`, async ({ page, context }) => {
      await context.clearCookies();
      await loginAsAdmin(page);

      await page.goto("/settings", { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");

      const employeesTab = await findEmployeesTab(page);
      await employeesTab.waitFor({ state: "visible", timeout: 10000 });
      await employeesTab.click();

      // Click Add Employee button (Vietnamese and English)
      const addBtn = page.locator('button:has-text("Thêm nhân viên"), button:has-text("Add Employee"), button:has-text("Thêm")').first();
      await addBtn.waitFor({ state: "visible", timeout: 5000 });
      await addBtn.click();

      // Wait for dialog and inputs
      await page.waitForSelector('#fullName', { state: 'visible', timeout: 5000 });

      const fullName = `Test Employee ${Date.now()}`;

      // Fill form
      await page.locator('#fullName').fill(fullName);

      // Open role select and pick Employee.
      // The app uses a Select/SelectItemProvider pattern and renders options in a floating overlay/modal.
      // We'll open the trigger then search inside the opened overlay for role="option" or elements whose class includes 'selectitem' / 'select-item' / 'SelectItem'.
      let selectTrigger = page.locator('[role="combobox"], button:has-text("Select role"), button:has-text("Chọn vai trò"), button:has-text("Vai trò")').first();
      if ((await selectTrigger.count()) === 0) {
        // fallback: look for a nearby label or placeholder
        selectTrigger = page.locator('label:has-text("Role"), label:has-text("Vai trò"), text=Role').first();
      }
      if ((await selectTrigger.count()) === 0) {
        throw new Error('Role select trigger not found');
      }
      await selectTrigger.click();

      // Wait briefly for the overlay/modal to open
      await page.waitForTimeout(150);

      // Prefer the overlay with data-state="open" (common with radix/shadcn components)
      const overlay = page.locator('[data-state="open"], div[class*="bg-background"]');

      const candidates = [
        // role option within overlay
        () => overlay.locator('[role="option"]:has-text("Employee")'),
        () => overlay.locator('[role="option"]:has-text("Nhân viên")'),
        () => overlay.locator('[role="option"]:has-text("Nhan vien")'),
        // common data-value or data attributes
        () => overlay.locator('[data-value="Employee"]'),
        () => overlay.locator('[data-value="employee"]'),
        () => overlay.locator('[data-value*="nhan"]'),
        // class-based heuristics (case-insensitive substring)
        () => overlay.locator('[class*="selectitem" i]'),
        () => overlay.locator('[class*="select-item" i]'),
        () => overlay.locator('[class*="SelectItem" i]'),
        // text fallbacks
        () => overlay.locator('text=Employee'),
        () => overlay.locator('text=Nhân viên'),
        () => overlay.locator('text=Nhan vien'),
        // global fallbacks (if overlay selector didn't match)
        () => page.locator('[role="option"]:has-text("Employee")'),
        () => page.locator('text=Employee'),
      ];

      let clicked = false;
      const tried: string[] = [];
      for (const getLoc of candidates) {
        const opt = getLoc();
        try {
          const count = await opt.count();
          tried.push(opt.toString());
          if (count > 0) {
            await opt.first().click();
            clicked = true;
            break;
          }
        } catch (e) {
          // ignore and continue
        }
      }

      if (!clicked) {
        // final targeted search inside any modal-like element containing the provided class fragment
        const modal = page.locator('div[class*="bg-background"][data-state="open"]');
        if ((await modal.count()) > 0) {
          const opt = modal.locator('text=Employee, text=Nhân viên, text=Nhan vien').first();
          if ((await opt.count()) > 0) {
            await opt.click();
            clicked = true;
          }
        }
      }

      if (!clicked) {
        throw new Error('Employee role option not found in overlay; tried: ' + tried.join(', '));
      }

      // Click Create Employee and measure until success toast
      const start = Date.now();
      await Promise.all([
        page.waitForSelector('text=Employee created successfully', { timeout: 10000 }),
        page.locator('button:has-text("Create Employee"), button:has-text("Tạo nhân viên"), button:has-text("Create")').first().click(),
      ]);
      const duration = Date.now() - start;

      // Verify employee appears in UI (poll a few times)
      let visible = false;
      for (let j = 0; j < 6; j++) {
        const cnt = await page.locator(`text=${fullName}`).count();
        if (cnt > 0) { visible = true; break; }
        await page.waitForTimeout(300);
      }

      // Verify DB record
      const admin = createAdminClient();
      const { data: found, error } = await admin.from('profiles').select('id').eq('full_name', fullName);
      const dbCount = Array.isArray(found) ? found.length : 0;

      metrics.push({ attempt: i, durationMs: duration, success: visible && dbCount > 0, dbCount });

      // Basic assertions per attempt
      expect(duration, `submission latency for attempt ${i} should be ≤ 2000ms`).toBeLessThanOrEqual(2000);
      expect(dbCount, 'profile record created in DB').toBeGreaterThan(0);
      expect(dbCount, 'no duplicate entries').toBe(1);

      // Screenshot first attempt
      if (i === 1) await page.screenshot({ path: `test-results/PERF-PROFILE-04-${i}.png`, fullPage: true });
    });
  }

  test.afterAll(async () => {
    const succ = metrics.filter(m => m.success).map(m => m.durationMs).sort((a,b)=>a-b);
    if (succ.length === 0) {
      console.log('No successful attempts');
      return;
    }
    const idx = Math.max(0, Math.floor(succ.length * 0.95) - 1);
    const p95 = succ[Math.min(idx, succ.length-1)];

    const results = { testCase: 'PERF-PROFILE-03', metrics, p95 };
    fs.writeFileSync(path.join(process.cwd(), 'test-results', 'PERF-PROFILE-04-results.json'), JSON.stringify(results, null, 2));

    console.log('PERF-PROFILE-03 results:', results);

    expect(p95).toBeLessThanOrEqual(2000);
  });
});
