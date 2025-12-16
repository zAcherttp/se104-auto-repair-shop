import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";
import { config } from "./config.js";

// Custom metrics
const errorRate = new Rate("errors");

// Stress test - Ramp up TEST-STR-001
export const options = {
  stages: [
    { duration: "1m", target: 50 }, // Ramp up to 10 users
    { duration: "1m", target: 100 }, // Ramp up to 20 users
    { duration: "1m", target: 150 }, // Stay at 30 users
    { duration: "1m", target: 100 }, // Ramp down to 10 users
    { duration: "1m", target: 50 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"], // 95% requests under 3s
    http_req_failed: ["rate<0.1"], // Less than 10% errors
    errors: ["rate<0.15"], // Less than 15% errors
  },
};

export default function () {
  const baseUrl = config.baseUrl;
  const stage = __ITER < 30 ? "ramp-up" : __ITER < 80 ? "peak" : "recovery";

  // TEST-STR-001: Sustained Ramp Up
  // Tăng VUs từ từ lên mức cao nhất và quan sát hành vi máy chủ
  if (stage === "ramp-up") {
    group("TEST-STR-001: Sustained Ramp Up", () => {
      let response = http.get(baseUrl);
      let success = check(response, {
        "ramp-up: home page loaded": (r) => r.status === 200,
        "ramp-up: p95 under threshold": (r) => r.timings.duration < 3000,
      });
      errorRate.add(!success);
      sleep(1);

      response = http.get(`${baseUrl}/login`);
      success = check(response, {
        "ramp-up: login page loaded": (r) => r.status === 200,
      });
      errorRate.add(!success);
      sleep(1);
    });
  }

  // TEST-STR-002: Sustained Peak
  // Duy trì tải cao nhất trong thời gian đã cấu hình
  if (stage === "peak") {
    group("TEST-STR-002: Sustained Peak", () => {
      let response = http.get(baseUrl);
      let success = check(response, {
        "peak: server continues serving": (r) => r.status === 200,
        "peak: no resource exhaustion": (r) => r.timings.duration < 5000,
      });
      errorRate.add(!success);
      sleep(1);

      response = http.get(`${baseUrl}/track-order`);
      success = check(response, {
        "peak: track order loaded": (r) => r.status === 200,
      });
      errorRate.add(!success);
      sleep(1);
    });
  }

  // TEST-STR-003: Recovery
  // Giảm tải lưu lượng và đảm bảo máy chủ phục hồi
  if (stage === "recovery") {
    group("TEST-STR-003: Recovery", () => {
      let response = http.get(baseUrl);
      let success = check(response, {
        "recovery: server responsive": (r) => r.status === 200,
        "recovery: response time normalized": (r) => r.timings.duration < 2000,
      });
      errorRate.add(!success);
      sleep(1);

      response = http.get(`${baseUrl}/login`);
      success = check(response, {
        "recovery: no stuck processes": (r) => r.status === 200,
      });
      errorRate.add(!success);
      sleep(1);
    });
  }

  // Simulate user think time
  sleep(2);
}

export function handleSummary(data) {
  const passed = data.metrics.http_req_failed?.values?.rate < 0.1;

  return {
    "stress-test-summary.json": JSON.stringify(data, null, 2),
    stdout: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 STRESS TEST RESULTS 
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
