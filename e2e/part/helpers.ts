/**
 * Helper utilities for spare parts/inventory performance tests
 */
import { Page } from "@playwright/test";
import { createAdminClient } from "../../supabase/admin";
import fs from "fs";
import path from "path";

export const TEST_CREDENTIALS = {
  email: "saladegg24@gmail.com",
  password: "123456",
};

/**
 * Login helper for tests
 */
export async function loginUser(page: Page) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  await page.fill('input[name="email"]', TEST_CREDENTIALS.email);
  await page.fill('input[name="password"]', TEST_CREDENTIALS.password);

  const navigationPromise = page.waitForURL((url) => {
    const urlStr = url.toString();
    return urlStr.includes("/reception") || urlStr.includes("/home");
  }, { timeout: 30000 });

  await page.click('button[type="submit"]');
  await navigationPromise;
}

/**
 * Load environment variables from .env.local
 */
export function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    envFile.split(/\r?\n/).forEach((line: string) => {
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
}

/**
 * Create test spare parts
 */
export async function createTestSpareParts(count: number) {
  const supabase = createAdminClient();
  const parts: Array<any> = [];
  
  const categories = ["Engine", "Brake", "Suspension", "Electrical", "Body"];
  const units = ["piece", "set", "liter", "meter"];
  
  for (let i = 0; i < count; i++) {
    parts.push({
      part_code: `PERF-P-${String(i + 1).padStart(4, "0")}`,
      part_name: `Performance Test Part ${i + 1}`,
      category: categories[i % categories.length],
      unit: units[i % units.length],
      unit_price: 100 + (i * 10),
      quantity_in_stock: 50 + (i % 100),
    });
  }

  const { data, error } = await supabase
    .from("spare_parts")
    .insert(parts)
    .select("id");

  if (error && !error.message.includes("duplicate")) {
    console.warn("Warning: failed to insert spare parts:", error.message);
  }

  return data || [];
}

/**
 * Cleanup test data
 */
export async function cleanupTestData() {
  const supabase = createAdminClient();

  // Delete spare parts
  await supabase
    .from("spare_parts")
    .delete()
    .like("part_code", "PERF-P-%");
}

/**
 * Calculate percentile from sorted array
 */
export function calculatePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, index)];
}

/**
 * Save test results to JSON file
 */
export function saveTestResults(testName: string, results: any) {
  const resultsDir = path.join(process.cwd(), "test-results");
  
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(resultsDir, `${testName}-results.json`),
    JSON.stringify(results, null, 2)
  );
}

/**
 * Navigate to inventory page
 */
export async function navigateToInventory(page: Page) {
  // Try multiple navigation strategies
  const inventoryLinkSelectors = [
    'a[href="/inventory"]',
    'a:has-text("Inventory")',
    'nav a:has-text("Inventory")',
    '[data-test="inventory-link"]',
  ];

  for (const selector of inventoryLinkSelectors) {
    const link = page.locator(selector).first();
    if (await link.isVisible().catch(() => false)) {
      await link.click();
      await page.waitForLoadState("domcontentloaded", { timeout: 15000 });
      await page.waitForTimeout(500);
      return;
    }
  }

  // Fallback: direct navigation
  await page.goto("/inventory", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(500);
}

/**
 * Count network requests
 */
export async function captureNetworkMetrics(page: Page, action: () => Promise<void>) {
  const requests: any[] = [];
  let totalSize = 0;

  page.on("request", (request) => {
    requests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
    });
  });

  page.on("response", async (response) => {
    try {
      const buffer = await response.body();
      totalSize += buffer.length;
    } catch {
      // Ignore errors getting response body
    }
  });

  await action();

  return {
    requestCount: requests.length,
    totalSize,
    requests,
  };
}
