import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";
import { config } from "./config.js";

// Custom metrics
const peakSuccessRate = new Rate("peak_success");

// Spike test - Sudden traffic spike to 10 users
export const options = {
  stages: [
    { duration: "30s", target: 2 }, // Normal load
    { duration: "30s", target: 10 }, // Sudden spike to 10 users (MAX)
    { duration: "1m", target: 10 }, // Stay at peak
    { duration: "30s", target: 2 }, // Drop back to normal
    { duration: "30s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<4000"], // Relaxed for spike
    http_req_failed: ["rate<0.15"], // Allow more failures during spike
    peak_success: ["rate>0.75"], // 75% success during peak
  },
};

export default function () {
  const baseUrl = config.baseUrl;
  const userIndex = (__VU - 1) % config.testUsers.length;
  const user = config.testUsers[userIndex];

  // Login
  let response = http.post(`${baseUrl}/login`, {
    email: user.email,
    password: user.password,
  });

  const loginSuccess = check(response, {
    "spike login successful": (r) =>
      r.status === 200 || r.status === 302 || r.status === 303,
  });

  if (loginSuccess) {
    sleep(1);

    // Hit main pages during spike
    response = http.get(`${baseUrl}/home`);
    const homeSuccess = check(response, {
      "home loaded during spike": (r) => r.status === 200,
    });
    peakSuccessRate.add(homeSuccess);

    sleep(1);

    response = http.get(`${baseUrl}/vehicles`);
    const vehiclesSuccess = check(response, {
      "vehicles loaded during spike": (r) => r.status === 200,
    });
    peakSuccessRate.add(vehiclesSuccess);

    sleep(1);
  } else {
    peakSuccessRate.add(false);
  }

  sleep(2);
}

export function handleSummary(data) {
  return {
    "spike-test-summary.json": JSON.stringify(data, null, 2),
    stdout: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ SPIKE TEST RESULTS (Sudden Peak: 10 Users)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Peak Success Rate: ${(
      (data.metrics.peak_success?.values?.rate || 0) * 100
    ).toFixed(2)}%
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
Note: Spike tests simulate sudden traffic bursts.
Higher error rates are acceptable during peak load.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`,
  };
}
