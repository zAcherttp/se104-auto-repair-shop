import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";
import { config } from "./config.js";

// Custom metrics
const loginSuccessRate = new Rate("login_success");
const logoutSuccessRate = new Rate("logout_success");

// Test options - Limited to 10 users
export const options = {
  stages: [
    { duration: "30s", target: 5 }, // Ramp up to 2 users
    { duration: "1m", target: 10 }, // Ramp up to 5 users
    { duration: "1m", target: 20 }, // Ramp up to 10 users (max)
    { duration: "1m", target: 20 }, // Stay at 10 users
    { duration: "30s", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"], // 95% of requests should be below 3s
    http_req_failed: ["rate<0.1"], // Error rate should be less than 10%
    login_success: ["rate>0.9"], // 90% of logins should succeed
  },
};

export default function () {
  const baseUrl = config.baseUrl;

  // Select a user based on VU ID (Virtual User ID)
  const userIndex = (__VU - 1) % config.testUsers.length;
  const user = config.testUsers[userIndex];

  // Test login page load
  let response = http.get(`${baseUrl}/login`);
  check(response, {
    "login page loaded": (r) => r.status === 200,
  });

  sleep(1);

  // Test login action
  response = http.post(
    `${baseUrl}/login`,
    {
      email: user.email,
      password: user.password,
    },
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const loginSuccess = check(response, {
    "login successful": (r) =>
      r.status === 200 || r.status === 302 || r.status === 303,
  });

  loginSuccessRate.add(loginSuccess);

  sleep(2);

  // If login successful, test authenticated pages
  if (loginSuccess) {
    // Test home page
    response = http.get(`${baseUrl}/home`);
    check(response, {
      "home page loaded": (r) => r.status === 200,
    });

    sleep(1);

    // Test vehicles page
    response = http.get(`${baseUrl}/vehicles`);
    check(response, {
      "vehicles page loaded": (r) => r.status === 200,
    });

    sleep(1);

    // Test inventory page
    response = http.get(`${baseUrl}/inventory`);
    check(response, {
      "inventory page loaded": (r) => r.status === 200,
    });

    sleep(1);
  }

  sleep(2);
}

export function handleSummary(data) {
  return {
    "auth-test-summary.json": JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || "";
  const enableColors = options.enableColors || false;

  let summary = `\n${indent}Test Summary:\n`;
  summary += `${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  summary += `${indent}Scenarios: ${
    Object.keys(data.metrics).length
  } metrics collected\n`;
  summary += `${indent}VUs: Max ${options.vus || 10}\n`;

  return summary;
}
