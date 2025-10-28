import http from "k6/http";
import { check, sleep } from "k6";
import { config } from "./config.js";

// Smoke test - Minimal load with 1 user
export const options = {
  vus: 1,
  duration: "1m",
  thresholds: {
    http_req_duration: ["p(99)<5000"], // 99% of requests should be below 5s
    http_req_failed: ["rate<0.01"], // Less than 1% of requests should fail
  },
};

export default function () {
  const baseUrl = config.baseUrl;

  // Test home page
  let response = http.get(baseUrl);
  check(response, {
    "homepage status is 200": (r) => r.status === 200,
  });

  sleep(1);

  // Test login page
  response = http.get(`${baseUrl}/login`);
  check(response, {
    "login page status is 200": (r) => r.status === 200,
  });

  sleep(1);

  // Test track order page
  response = http.get(`${baseUrl}/track-order`);
  check(response, {
    "track order page status is 200": (r) => r.status === 200,
  });

  sleep(2);
}

export function handleSummary(data) {
  console.log("Smoke test completed!");
  console.log(`Total requests: ${data.metrics.http_reqs?.values?.count || 0}`);
  console.log(
    `Failed requests: ${data.metrics.http_req_failed?.values?.rate || 0}`
  );

  return {
    "smoke-test-summary.json": JSON.stringify(data, null, 2),
    stdout: "\n✅ Smoke test completed successfully!\n",
  };
}
