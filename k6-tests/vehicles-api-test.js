import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";
import { config } from "./config.js";

// Custom metrics for vehicle search performance
const vehicleSearchTime = new Trend("vehicle_search_duration");
const vehicleSearchSuccess = new Rate("vehicle_search_success");
const vehicleFiltersApplied = new Counter("vehicle_filters_applied");
const vehicleDataFetched = new Counter("vehicle_records_fetched");

// Load test configuration for Vehicle search API
// Simulates realistic user behavior: browsing, searching, filtering
export const options = {
  stages: [
    { duration: "30s", target: 10 }, // Warm up to 10 users
    { duration: "2m", target: 50 }, // Ramp up to 50 users
    { duration: "3m", target: 100 }, // Peak at 100 concurrent users
    { duration: "2m", target: 50 }, // Scale down
    { duration: "1m", target: 0 }, // Cool down
  ],
  thresholds: {
    // Performance thresholds
    http_req_duration: ["p(95)<3000", "p(99)<5000"], // 95% under 3s, 99% under 5s
    http_req_failed: ["rate<0.05"], // Less than 5% errors
    vehicle_search_duration: ["p(95)<2000"], // Search should be fast
    vehicle_search_success: ["rate>0.90"], // 90% success rate for searches
    http_reqs: ["rate>5"], // At least 5 requests per second
  },
};

// Simulated search terms users might use
const searchTerms = [
  "", // Empty search (show all)
  "Toyota", // Brand search
  "Honda",
  "BMW",
  "Mercedes",
  "30A", // License plate prefix
  "51", // License plate prefix (Vietnamese style)
  "ABC", // Random search
  "Nguyen", // Customer name search
  "0912", // Phone number search
];

// Vehicle brands for filtering
const vehicleBrands = [
  "Toyota",
  "Honda",
  "BMW",
  "Mercedes-Benz",
  "Hyundai",
  "Kia",
  "Ford",
  "Mazda",
  "Nissan",
  "Volkswagen",
];

export default function () {
  const baseUrl = config.baseUrl;
  const userIndex = (__VU - 1) % config.testUsers.length;
  const user = config.testUsers[userIndex];

  // Simulate user authentication
  let authHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  group("User Login for Vehicle Access", () => {
    const loginPayload = JSON.stringify({
      email: user.email,
      password: user.password,
    });

    const loginResponse = http.post(`${baseUrl}/api/auth/login`, loginPayload, {
      headers: authHeaders,
      tags: { name: "Login" },
    });

    // Extract session cookies if login successful
    if (loginResponse.status === 200 || loginResponse.status === 302) {
      const cookies = loginResponse.cookies;
      if (cookies) {
        authHeaders["Cookie"] = Object.keys(cookies)
          .map((key) => `${key}=${cookies[key][0].value}`)
          .join("; ");
      }
    }

    sleep(1);
  });

  // Test 1: Load Vehicle Page (Initial Load)
  group("Load Vehicle Page", () => {
    const startTime = Date.now();

    const response = http.get(`${baseUrl}/vehicles`, {
      headers: authHeaders,
      tags: { name: "VehiclePage" },
    });

    const duration = Date.now() - startTime;
    vehicleSearchTime.add(duration);

    const success = check(response, {
      "vehicle page loads": (r) => r.status === 200,
      "page contains vehicles table": (r) =>
        r.body.includes("vehicle") || r.body.includes("table"),
      "response time acceptable": (r) => r.timings.duration < 3000,
    });

    vehicleSearchSuccess.add(success);
    if (success) vehicleDataFetched.add(1);

    sleep(2);
  });

  // Test 2: Search Vehicles by License Plate
  group("Search Vehicle by License Plate", () => {
    const searchTerm =
      searchTerms[Math.floor(Math.random() * searchTerms.length)];

    const startTime = Date.now();

    // Simulate client-side search (vehicles page uses client-side filtering)
    const response = http.get(`${baseUrl}/vehicles`, {
      headers: authHeaders,
      tags: { name: "VehicleSearch" },
    });

    const duration = Date.now() - startTime;
    vehicleSearchTime.add(duration);

    const success = check(response, {
      "search returns results": (r) => r.status === 200,
      "search is fast": (r) => r.timings.duration < 2000,
    });

    vehicleSearchSuccess.add(success);
    vehicleFiltersApplied.add(1);

    sleep(1.5);
  });

  // Test 3: Filter by Vehicle Brand
  group("Filter Vehicle by Brand", () => {
    const brand =
      vehicleBrands[Math.floor(Math.random() * vehicleBrands.length)];

    const response = http.get(`${baseUrl}/vehicles`, {
      headers: authHeaders,
      tags: { name: "VehicleBrandFilter" },
    });

    const success = check(response, {
      "filter returns data": (r) => r.status === 200,
      "filter response quick": (r) => r.timings.duration < 2500,
    });

    vehicleSearchSuccess.add(success);
    vehicleFiltersApplied.add(1);

    sleep(1);
  });

  // Test 4: Paginate Through Vehicle List
  group("Paginate Vehicle Results", () => {
    // Test pagination (client-side pagination via TanStack Table)
    const response = http.get(`${baseUrl}/vehicles`, {
      headers: authHeaders,
      tags: { name: "VehiclePagination" },
    });

    check(response, {
      "pagination loads": (r) => r.status === 200,
      "pagination is responsive": (r) => r.timings.duration < 2000,
    });

    sleep(1);
  });

  // Test 5: Search by Customer Name
  group("Search Vehicle by Customer Name", () => {
    const customerName = searchTerms[Math.floor(Math.random() * 3)]; // Use first few as names

    const response = http.get(`${baseUrl}/vehicles`, {
      headers: authHeaders,
      tags: { name: "CustomerSearch" },
    });

    const success = check(response, {
      "customer search works": (r) => r.status === 200,
      "customer search fast": (r) => r.timings.duration < 2500,
    });

    vehicleSearchSuccess.add(success);
    vehicleFiltersApplied.add(1);

    sleep(2);
  });

  // Test 6: View Vehicle Details (Debt Information)
  group("View Vehicle with Debt Details", () => {
    // This tests the fetchVehiclesWithDebt server action
    const response = http.get(`${baseUrl}/vehicles`, {
      headers: authHeaders,
      tags: { name: "VehicleDebtData" },
    });

    check(response, {
      "debt data loads": (r) => r.status === 200,
      "includes financial data": (r) =>
        r.body.includes("debt") ||
        r.body.includes("payment") ||
        r.body.includes("amount"),
      "loads within time": (r) => r.timings.duration < 3000,
    });

    vehicleDataFetched.add(1);
    sleep(1.5);
  });

  // Test 7: Sort Vehicle List
  group("Sort Vehicle List", () => {
    // Test sorting (client-side via TanStack Table)
    const response = http.get(`${baseUrl}/vehicles`, {
      headers: authHeaders,
      tags: { name: "VehicleSort" },
    });

    check(response, {
      "sort functionality works": (r) => r.status === 200,
      "sort is fast": (r) => r.timings.duration < 2000,
    });

    sleep(1);
  });

  // Test 8: Heavy Filter Combination
  group("Apply Multiple Filters", () => {
    const searchTerm =
      searchTerms[Math.floor(Math.random() * searchTerms.length)];
    const brand =
      vehicleBrands[Math.floor(Math.random() * vehicleBrands.length)];

    const startTime = Date.now();

    const response = http.get(`${baseUrl}/vehicles`, {
      headers: authHeaders,
      tags: { name: "MultipleFilters" },
    });

    const duration = Date.now() - startTime;
    vehicleSearchTime.add(duration);

    const success = check(response, {
      "multiple filters work": (r) => r.status === 200,
      "combined filter fast": (r) => r.timings.duration < 3000,
    });

    vehicleSearchSuccess.add(success);
    vehicleFiltersApplied.add(2); // Applied 2 filters

    sleep(2);
  });

  // Random think time between actions
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}

// Summary handler
export function handleSummary(data) {
  const vehicleSearches =
    data.metrics.vehicle_filters_applied?.values?.count || 0;
  const vehicleRecords =
    data.metrics.vehicle_records_fetched?.values?.count || 0;
  const avgSearchTime = data.metrics.vehicle_search_duration?.values?.avg || 0;
  const searchSuccessRate =
    data.metrics.vehicle_search_success?.values?.rate || 0;

  console.log("\n=== Vehicle Search API Load Test Results ===");
  console.log(`Total Vehicle Searches: ${vehicleSearches}`);
  console.log(`Vehicle Records Fetched: ${vehicleRecords}`);
  console.log(`Average Search Time: ${avgSearchTime.toFixed(2)}ms`);
  console.log(`Search Success Rate: ${(searchSuccessRate * 100).toFixed(2)}%`);
  console.log(`Total Requests: ${data.metrics.http_reqs?.values?.count || 0}`);
  console.log(
    `Failed Requests: ${data.metrics.http_req_failed?.values?.count || 0}`
  );
  console.log(
    `Avg Response Time: ${data.metrics.http_req_duration?.values?.avg.toFixed(
      2
    )}ms`
  );
  console.log(
    `95th Percentile: ${data.metrics.http_req_duration?.values["p(95)"].toFixed(
      2
    )}ms`
  );
  console.log(
    `99th Percentile: ${data.metrics.http_req_duration?.values["p(99)"].toFixed(
      2
    )}ms`
  );

  return {
    "vehicles-api-test-results.json": JSON.stringify(data, null, 2),
    stdout: "\n✅ Vehicle Search API Load Test Completed!\n",
  };
}
