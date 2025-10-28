import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";
import { config } from "./config.js";

// Custom metrics
const userFlowSuccess = new Rate("user_flow_success");
const flowDuration = new Trend("complete_flow_duration");

// End-to-end user journey test - 5 concurrent users
export const options = {
  stages: [
    { duration: "1m", target: 3 }, // Ramp up to 3 users
    { duration: "2m", target: 5 }, // Ramp up to 5 users
    { duration: "2m", target: 5 }, // Hold at 5 users
    { duration: "1m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2500"],
    http_req_failed: ["rate<0.08"],
    user_flow_success: ["rate>0.85"],
  },
};

export default function () {
  const baseUrl = config.baseUrl;
  const userIndex = (__VU - 1) % config.testUsers.length;
  const user = config.testUsers[userIndex];
  const flowStart = Date.now();

  // Step 1: Login
  group("User Login", () => {
    let response = http.post(`${baseUrl}/login`, {
      email: user.email,
      password: user.password,
    });

    const loginSuccess = check(response, {
      "login successful": (r) =>
        r.status === 200 || r.status === 302 || r.status === 303,
    });

    if (!loginSuccess) {
      userFlowSuccess.add(false);
      return;
    }

    sleep(1);
  });

  // Step 2: Navigate to main features
  group("Feature Navigation", () => {
    // Check vehicles
    let response = http.get(`${baseUrl}/vehicles`);
    check(response, {
      "vehicles page loaded": (r) => r.status === 200,
    });

    sleep(2);

    // Check inventory
    response = http.get(`${baseUrl}/inventory`);
    check(response, {
      "inventory page loaded": (r) => r.status === 200,
    });

    sleep(2);

    // Check payments
    response = http.get(`${baseUrl}/payments`);
    check(response, {
      "payments page loaded": (r) => r.status === 200,
    });

    sleep(2);
  });

  // Step 3: Perform search/filter operations
  group("Search Operations", () => {
    // Search vehicles
    let response = http.get(`${baseUrl}/vehicles?search=test`);
    check(response, {
      "vehicle search works": (r) => r.status === 200,
    });

    sleep(1);

    // Filter inventory
    response = http.get(`${baseUrl}/inventory?filter=active`);
    check(response, {
      "inventory filter works": (r) => r.status === 200,
    });

    sleep(1);
  });

  const flowEnd = Date.now();
  flowDuration.add(flowEnd - flowStart);
  userFlowSuccess.add(true);

  sleep(2);
}

export function handleSummary(data) {
  return {
    "user-journey-summary.json": JSON.stringify(data, null, 2),
    stdout: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 USER JOURNEY TEST RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Flow Success Rate: ${(
      (data.metrics.user_flow_success?.values?.rate || 0) * 100
    ).toFixed(2)}%
Avg Complete Flow: ${(
      data.metrics.complete_flow_duration?.values?.avg || 0
    ).toFixed(2)}ms
Total Requests: ${data.metrics.http_reqs?.values?.count || 0}
Failed Requests: ${(
      (data.metrics.http_req_failed?.values?.rate || 0) * 100
    ).toFixed(2)}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`,
  };
}
