import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";
import { config } from "./config.js";

// Custom metrics
const errorRate = new Rate("errors");

// Stress test - Ramp up to 10 users (max allowed)
export const options = {
  stages: [
    { duration: "2m", target: 5 }, // Ramp up to 5 users
    { duration: "3m", target: 10 }, // Ramp up to 10 users (MAX)
    { duration: "2m", target: 10 }, // Stay at 10 users
    { duration: "2m", target: 5 }, // Ramp down to 5 users
    { duration: "1m", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"], // 95% requests under 3s
    http_req_failed: ["rate<0.1"], // Less than 10% errors
    errors: ["rate<0.15"], // Less than 15% errors
  },
};

export default function () {
  const baseUrl = config.baseUrl;

  // Test multiple pages under stress
  group("Page Navigation Under Stress", () => {
    // Home page
    let response = http.get(baseUrl);
    let success = check(response, {
      "home page loaded": (r) => r.status === 200,
      "home page response time OK": (r) => r.timings.duration < 5000,
    });
    errorRate.add(!success);

    sleep(1);

    // Login page
    response = http.get(`${baseUrl}/login`);
    success = check(response, {
      "login page loaded": (r) => r.status === 200,
    });
    errorRate.add(!success);

    sleep(1);

    // Track order page
    response = http.get(`${baseUrl}/track-order`);
    success = check(response, {
      "track order loaded": (r) => r.status === 200,
    });
    errorRate.add(!success);

    sleep(1);
  });

  // Simulate user think time
  sleep(2);
}

export function handleSummary(data) {
  const passed = data.metrics.http_req_failed?.values?.rate < 0.1;

  return {
    "stress-test-summary.json": JSON.stringify(data, null, 2),
    stdout: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 STRESS TEST RESULTS (Max 10 Users)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ${passed ? "✅ PASSED" : "❌ FAILED"}
Total Requests: ${data.metrics.http_reqs?.values?.count || 0}
Failed Requests: ${(
      (data.metrics.http_req_failed?.values?.rate || 0) * 100
    ).toFixed(2)}%
Avg Response Time: ${(data.metrics.http_req_duration?.values?.avg || 0).toFixed(
      2
    )}ms
95th Percentile: ${(
      data.metrics.http_req_duration?.values?.["p(95)"] || 0
    ).toFixed(2)}ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`,
  };
}
