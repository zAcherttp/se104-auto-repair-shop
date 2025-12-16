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

  // TEST-AUTH-001: User Login (happy path)
  // POST /api/auth/login với thông tin đăng nhập hợp lệ
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

  // TEST-AUTH-003: Access Protected Page Without Auth
  // GET một trang được bảo vệ mà không có cookie
  if (!loginSuccess) {
    response = http.get(`${baseUrl}/home`, { redirects: 0 });
    check(response, {
      "redirected to login or 401/403": (r) =>
        r.status === 302 ||
        r.status === 303 ||
        r.status === 401 ||
        r.status === 403,
    });
    sleep(1);
  }

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

    // TEST-AUTH-004: Logout
    // Kích hoạt đăng xuất và xác minh trang được bảo vệ không thể truy cập sau đó
    response = http.post(
      `${baseUrl}/api/auth/signout`,
      {},
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const logoutSuccess = check(response, {
      "logout successful": (r) =>
        r.status === 200 || r.status === 302 || r.status === 303,
    });

    logoutSuccessRate.add(logoutSuccess);

    if (logoutSuccess) {
      sleep(1);
      // Verify protected page is now inaccessible
      response = http.get(`${baseUrl}/home`, { redirects: 0 });
      check(response, {
        "protected page inaccessible after logout": (r) =>
          r.status === 302 ||
          r.status === 303 ||
          r.status === 401 ||
          r.status === 403,
      });
    }

    sleep(1);
  }

  // TEST-AUTH-002: Login Failure (bad creds)
  // POST /api/auth/login với thông tin đăng nhập không hợp lệ
  response = http.post(
    `${baseUrl}/login`,
    {
      email: "invalid@example.com",
      password: "wrongpassword",
    },
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  check(response, {
    "login failed with bad credentials": (r) =>
      r.status === 401 ||
      r.status === 400 ||
      (r.body && r.body.includes("error")),
  });

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
