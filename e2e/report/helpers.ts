/**
 * Helper utilities for report performance tests
 */
import { Page } from "@playwright/test";
import { createAdminClient } from "../../supabase/admin";

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
  const fs = require("fs");
  const path = require("path");
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
 * Navigate to reports page
 */
export async function navigateToReports(page: Page) {
  await page.goto("/reports", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
}

/**
 * Create test repair orders for report data
 */
export async function createTestRepairOrdersForReports(count: number) {
  const supabase = createAdminClient();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Create vehicles first
  const vehicles: Array<any> = [];
  for (let i = 0; i < count; i++) {
    const plateNumber = String(20000 + i).substring(1);
    vehicles.push({
      license_plate: `RPT-${plateNumber}`,
      brand: `Report Test Brand ${i % 5}`,
    });
  }

  const { data: vehicleData } = await supabase
    .from("vehicles")
    .insert(vehicles)
    .select("id");

  if (!vehicleData) return [];

  // Create repair orders
  const orders: Array<any> = [];
  for (let i = 0; i < vehicleData.length; i++) {
    const dayOfMonth = (i % 28) + 1;
    const orderDate = new Date(currentYear, currentMonth, dayOfMonth).toISOString().split('T')[0];
    
    orders.push({
      vehicle_id: vehicleData[i].id,
      status: "completed",
      reception_date: orderDate,
      completion_date: orderDate,
      total_amount: 500 + (i * 50),
      notes: `Report test order #${i + 1}`,
    });
  }

  const { data: orderData } = await supabase
    .from("repair_orders")
    .insert(orders)
    .select("id");

  return orderData || [];
}

/**
 * Create test spare parts for inventory reports
 */
export async function createTestSpareParts(count: number) {
  const supabase = createAdminClient();
  const parts: Array<any> = [];
  
  for (let i = 0; i < count; i++) {
    parts.push({
      name: `Report Test Part ${i + 1}`,
      unit: "piece",
      unit_price: 100 + (i * 10),
      quantity: 100 + i,
    });
  }

  const { data } = await supabase
    .from("spare_parts")
    .insert(parts)
    .select("id");

  return data || [];
}

/**
 * Cleanup test data
 */
export async function cleanupTestData() {
  const supabase = createAdminClient();

  await supabase
    .from("repair_orders")
    .delete()
    .like("notes", "Report test order%");

  await supabase
    .from("vehicles")
    .delete()
    .like("license_plate", "RPT-%");

  await supabase
    .from("spare_parts")
    .delete()
    .like("name", "Report Test Part%");
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
  const fs = require("fs");
  const path = require("path");
  const resultsDir = path.join(process.cwd(), "test-results");
  
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(resultsDir, `${testName}-results.json`),
    JSON.stringify(results, null, 2)
  );
}
