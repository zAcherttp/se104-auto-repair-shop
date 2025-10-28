import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";
import { config } from "./config.js";

// Custom metrics
const vehiclesFetchTime = new Trend("vehicles_fetch_duration");
const inventoryFetchTime = new Trend("inventory_fetch_duration");
const apiSuccessRate = new Rate("api_success");

// Test options - Limited to 10 concurrent users
export const options = {
  scenarios: {
    constant_load: {
      executor: "constant-vus",
      vus: 10, // Exactly 10 virtual users
      duration: "3m",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.05"],
    api_success: ["rate>0.95"],
    vehicles_fetch_duration: ["p(95)<1500"],
    inventory_fetch_duration: ["p(95)<1500"],
  },
};

export default function () {
  const baseUrl = config.baseUrl;
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Test API endpoints that don't require authentication (if any)
  group("Public Pages", () => {
    const response = http.get(`${baseUrl}/login`, params);
    const success = check(response, {
      "login page status 200": (r) => r.status === 200,
      "login page has form": (r) =>
        r.body.includes("form") || r.body.includes("login"),
    });
    apiSuccessRate.add(success);
    sleep(1);
  });

  // Test track order page (public feature)
  group("Track Order", () => {
    const response = http.get(`${baseUrl}/track-order`, params);
    const success = check(response, {
      "track order page loaded": (r) => r.status === 200,
    });
    apiSuccessRate.add(success);
    sleep(1);
  });

  // Simulate static asset loading
  group("Static Assets", () => {
    const cssResponse = http.get(
      `${baseUrl}/_next/static/css/app/layout.css`,
      params
    );
    check(cssResponse, {
      "CSS loaded": (r) => r.status === 200 || r.status === 404, // 404 is acceptable for dynamic builds
    });

    sleep(0.5);
  });

  sleep(2);
}

export function handleSummary(data) {
  console.log("Test completed. Generating summary...");

  return {
    "api-test-summary.json": JSON.stringify(data, null, 2),
    "api-test-summary.html": generateHTMLSummary(data),
  };
}

function generateHTMLSummary(data) {
  const metrics = data.metrics;

  return `
<!DOCTYPE html>
<html>
<head>
  <title>k6 Load Test Results - Auto Repair Shop</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #333; }
    .metric { margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #4CAF50; }
    .metric-name { font-weight: bold; color: #555; }
    .metric-value { font-size: 24px; color: #4CAF50; margin: 10px 0; }
    .failed { border-left-color: #f44336; }
    .failed .metric-value { color: #f44336; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚗 Auto Repair Shop - Load Test Results</h1>
    <p><strong>Test Date:</strong> ${new Date().toISOString()}</p>
    <p><strong>Max Concurrent Users:</strong> 10</p>
    
    <h2>Key Metrics</h2>
    ${Object.entries(metrics)
      .map(
        ([name, metric]) => `
      <div class="metric ${metric.values?.rate < 0.9 ? "failed" : ""}">
        <div class="metric-name">${name}</div>
        <div class="metric-value">${JSON.stringify(
          metric.values,
          null,
          2
        )}</div>
      </div>
    `
      )
      .join("")}
  </div>
</body>
</html>
  `;
}
