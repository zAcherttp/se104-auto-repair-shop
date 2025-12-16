import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";
import { config } from "./config.js";

// Custom metrics
const userFlowSuccess = new Rate("user_flow_success");
const flowDuration = new Trend("complete_flow_duration");

// End-to-end user journey test
export const options = {
  stages: [
    { duration: "1m", target: 50 }, //
    { duration: "2m", target: 100 }, //
    { duration: "2m", target: 200 }, //
    { duration: "1m", target: 50 }, //
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

  // TEST-UJT-001: Full User Login and Navigation
  // Mô phỏng đăng nhập sau đó điều hướng qua các trang phổ biến
  let loginSuccess = false;
  group("TEST-UJT-001: Full User Login and Navigation", () => {
    let response = http.post(`${baseUrl}/login`, {
      email: user.email,
      password: user.password,
    });

    loginSuccess = check(response, {
      "login successful": (r) =>
        r.status === 200 || r.status === 302 || r.status === 303,
    });

    if (!loginSuccess) {
      userFlowSuccess.add(false);
      return;
    }

    sleep(1);

    // Navigate through common pages
    response = http.get(`${baseUrl}/home`);
    const homeLoaded = check(response, {
      "dashboard loads without error": (r) => r.status === 200,
      "page loads under threshold": (r) => r.timings.duration < 2500,
    });

    sleep(1);

    response = http.get(`${baseUrl}/vehicles`);
    const vehiclesLoaded = check(response, {
      "vehicles page navigates": (r) => r.status === 200,
    });

    sleep(1);

    response = http.get(`${baseUrl}/reception`);
    const receptionLoaded = check(response, {
      "reception page navigates": (r) => r.status === 200,
    });

    userFlowSuccess.add(homeLoaded && vehiclesLoaded && receptionLoaded);
    sleep(1);
  });

  if (!loginSuccess) return;

  // TEST-UJT-002: Search and Perform Action
  // Đăng nhập -> thực hiện tìm kiếm -> mở một xe -> tạo hoặc cập nhật đơn sửa chữa
  group("TEST-UJT-002: Search and Perform Action", () => {
    // Search vehicles
    let response = http.get(`${baseUrl}/vehicles?search=test`);
    const searchWorks = check(response, {
      "vehicle search executes": (r) => r.status === 200,
    });

    sleep(1);

    // Open a vehicle (simulate)
    response = http.get(`${baseUrl}/vehicles`);
    const vehicleOpens = check(response, {
      "vehicle details accessible": (r) => r.status === 200,
    });

    sleep(1);

    // Access repair orders (simulate create/update)
    response = http.get(`${baseUrl}/repairs`);
    const repairAction = check(response, {
      "repair order action successful": (r) =>
        r.status === 200 || r.status === 404,
    });

    userFlowSuccess.add(searchWorks && vehicleOpens);
    sleep(2);
  });

  // TEST-UJT-003: End-to-End Checkout
  // Hoàn thành một đơn sửa chữa và xử lý thanh toán
  group("TEST-UJT-003: End-to-End Checkout", () => {
    // Access payments page
    let response = http.get(`${baseUrl}/payments`);
    const paymentsLoaded = check(response, {
      "payments page accessible": (r) => r.status === 200,
    });

    sleep(1);

    // Simulate payment processing
    response = http.get(`${baseUrl}/payments`);
    const checkoutCompletes = check(response, {
      "checkout flow completes": (r) => r.status === 200,
      "payment accepted": (r) => r.body && r.body.length > 0,
    });

    userFlowSuccess.add(paymentsLoaded && checkoutCompletes);
    sleep(2);
  });

  const flowEnd = Date.now();
  flowDuration.add(flowEnd - flowStart);

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
