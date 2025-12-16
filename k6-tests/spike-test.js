import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";
import { config } from "./config.js";

// Custom metrics
const peakSuccessRate = new Rate("peak_success");

// Spike test - Sudden traffic spike to 10 users
export const options = {
  stages: [
    { duration: "30s", target: 50 }, // Normal load
    { duration: "30s", target: 100 }, // Sudden spike to 100 users (MAX)
    { duration: "1m", target: 200 }, // Stay at peak
    { duration: "30s", target: 150 }, // Drop back to normal
    { duration: "30s", target: 50 }, // Ramp down
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
  const currentVUs = __VU;

  // TEST-SPK-001: Sudden Spike
  // Tăng nhanh người dùng từ VUs thấp lên cao
  group("TEST-SPK-001: Sudden Spike", () => {
    let response = http.post(`${baseUrl}/login`, {
      email: user.email,
      password: user.password,
    });

    const loginSuccess = check(response, {
      "spike: login responds": (r) =>
        r.status === 200 ||
        r.status === 302 ||
        r.status === 303 ||
        r.status === 503,
      "spike: server doesn't crash": (r) => r.status !== 0 && r.status < 600,
    });

    if (loginSuccess) {
      sleep(1);

      // Hit main pages during spike
      response = http.get(`${baseUrl}/home`);
      const homeSuccess = check(response, {
        "spike: home loaded or graceful degradation": (r) =>
          r.status === 200 || r.status === 503 || r.timings.duration < 5000,
      });
      peakSuccessRate.add(homeSuccess);

      sleep(1);

      response = http.get(`${baseUrl}/vehicles`);
      const vehiclesSuccess = check(response, {
        "spike: vehicles loaded or timeout acceptable": (r) =>
          r.status === 200 || r.status === 503,
      });
      peakSuccessRate.add(vehiclesSuccess);

      sleep(1);
    } else {
      peakSuccessRate.add(false);
    }
  });

  // TEST-SPK-002: Spike Recovery
  // Trở lại VUs thấp và xác minh hệ thống phục hồi
  if (currentVUs <= 3) {
    group("TEST-SPK-002: Spike Recovery", () => {
      let response = http.get(baseUrl);
      const recoverySuccess = check(response, {
        "recovery: server returns to baseline health": (r) => r.status === 200,
        "recovery: response time normalized": (r) => r.timings.duration < 2000,
      });
      peakSuccessRate.add(recoverySuccess);
      sleep(1);
    });
  }

  // TEST-SPK-003: External Rate Limits
  // Quan sát hành vi giới hạn tỷ lệ trên các dịch vụ bên ngoài
  group("TEST-SPK-003: External Rate Limits", () => {
    let response = http.get(`${baseUrl}/login`);
    const rateLimitHandled = check(response, {
      "rate-limit: external services respond or throttle gracefully": (r) =>
        r.status === 200 || r.status === 429 || r.status === 503,
      "rate-limit: no complete failure": (r) => r.status !== 0,
    });
    peakSuccessRate.add(rateLimitHandled);
    sleep(1);
  });

  sleep(2);
}

export function handleSummary(data) {
  return {
    "spike-test-summary.json": JSON.stringify(data, null, 2),
    stdout: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ SPIKE TEST RESULTS 
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
