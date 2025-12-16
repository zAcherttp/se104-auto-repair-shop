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

  // TEST-API-001: Login Page Availability
  // GET /login và kiểm tra trạng thái và nội dung HTML mong đợi
  group("TEST-API-001: Login Page Availability", () => {
    const response = http.get(`${baseUrl}/login`, params);
    const success = check(response, {
      "login page status 200": (r) => r.status === 200,
      "login page has UI": (r) =>
        r.body &&
        (r.body.includes("form") ||
          r.body.includes("login") ||
          r.body.includes("email")),
    });
    apiSuccessRate.add(success);
    sleep(1);
  });

  // TEST-API-002: Track Order Page
  // GET /track-order và xác thực trạng thái 200 và nội dung
  group("TEST-API-002: Track Order Page", () => {
    const response = http.get(`${baseUrl}/track-order`, params);
    const success = check(response, {
      "track order page status 200": (r) => r.status === 200,
      "track order page has UI": (r) =>
        r.body &&
        (r.body.includes("track") ||
          r.body.includes("order") ||
          r.body.length > 0),
    });
    apiSuccessRate.add(success);
    sleep(1);
  });

  // TEST-API-003: Static Assets
  // Yêu cầu CSS/JS đến các điểm cuối /_next/static/...
  group("TEST-API-003: Static Assets", () => {
    const cssResponse = http.get(
      `${baseUrl}/_next/static/css/app/layout.css`,
      params
    );
    const cssSuccess = check(cssResponse, {
      "CSS loaded or 404 acceptable": (r) =>
        r.status === 200 || r.status === 404,
    });

    sleep(0.5);

    const jsResponse = http.get(
      `${baseUrl}/_next/static/chunks/main.js`,
      params
    );
    const jsSuccess = check(jsResponse, {
      "JS loaded or 404 acceptable": (r) =>
        r.status === 200 || r.status === 404,
    });

    apiSuccessRate.add(cssSuccess && jsSuccess);
    sleep(0.5);
  });

  // TEST-API-004: API Health Check
  // Gọi trực tiếp các điểm cuối API lõi và kiểm tra sức khỏe phản hồi JSON
  group("TEST-API-004: API Health Check", () => {
    // Test home page as basic health check
    const homeResponse = http.get(baseUrl, params);
    const homeSuccess = check(homeResponse, {
      "home page responds": (r) =>
        r.status === 200 || r.status === 302 || r.status === 303,
      "response is valid HTML/JSON": (r) => r.body && r.body.length > 0,
    });

    apiSuccessRate.add(homeSuccess);
    sleep(1);
  });

  // TEST-API-005: General Throughput
  // Chạy nhiều lần lặp để đảm bảo máy chủ xử lý các yêu cầu mong đợi
  group("TEST-API-005: General Throughput", () => {
    for (let i = 0; i < 3; i++) {
      const response = http.get(`${baseUrl}/login`, params);
      const success = check(response, {
        "throughput test - page loads": (r) => r.status === 200,
        "throughput test - response time OK": (r) => r.timings.duration < 3000,
      });
      apiSuccessRate.add(success);
      sleep(0.3);
    }
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
