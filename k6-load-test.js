/**
 * K6 Load Testing Script for Auto Repair Shop API
 * 
 * Install: https://k6.io/docs/getting-started/installation/
 * Run: k6 run load-test.js
 * 
 * Test scenarios:
 * - Normal load: 10 users for 1 minute
 * - Stress test: Ramp up to 100 users
 * - Spike test: Sudden load increase
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');
const dbQueryDuration = new Trend('db_query_duration');
const successfulRequests = new Counter('successful_requests');

// Test configuration
export const options = {
  scenarios: {
    // Normal load test
    normal_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1m',
      tags: { test_type: 'normal' },
    },
    // Stress test
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 },
      ],
      tags: { test_type: 'stress' },
      startTime: '1m',
    },
    // Spike test
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '10s', target: 0 },
      ],
      tags: { test_type: 'spike' },
      startTime: '17m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    http_req_failed: ['rate<0.01'], // Error rate < 1%
    errors: ['rate<0.05'], // Custom error rate < 5%
    api_duration: ['p(95)<600'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://gniaismrsstgpfxdbgxd.supabase.co';
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'your-anon-key';

// Test data
const testUsers = [
  { email: 'admin@garage.com', password: 'admin123' },
  { email: 'employee@garage.com', password: 'employee123' },
];

const testLicensePlates = ['51A-12345', '51B-67890', '51C-11111'];

// Helper: Login and get session
function login(email, password) {
  const res = http.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email, password }),
    {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
    }
  );

  check(res, {
    'login successful': (r) => r.status === 200,
    'has access token': (r) => JSON.parse(r.body).access_token !== undefined,
  });

  return res.status === 200 ? JSON.parse(res.body).access_token : null;
}

// Test: Fetch vehicles list
function testGetVehicles(token) {
  const res = http.get(`${SUPABASE_URL}/rest/v1/vehicles?select=*,customer:customers(*)&limit=100`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
    },
  });

  const passed = check(res, {
    'vehicles list status 200': (r) => r.status === 200,
    'vehicles list response time < 500ms': (r) => r.timings.duration < 500,
    'vehicles list has data': (r) => JSON.parse(r.body).length > 0,
  });

  apiDuration.add(res.timings.duration);
  errorRate.add(!passed);
  if (passed) successfulRequests.add(1);

  return res;
}

// Test: Fetch repair orders
function testGetRepairOrders(token) {
  const res = http.get(
    `${SUPABASE_URL}/rest/v1/repair_orders?select=*,vehicle:vehicles(*),repair_order_items(*)&limit=50`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  const passed = check(res, {
    'repair orders status 200': (r) => r.status === 200,
    'repair orders response time < 800ms': (r) => r.timings.duration < 800,
  });

  dbQueryDuration.add(res.timings.duration);
  errorRate.add(!passed);
  if (passed) successfulRequests.add(1);

  return res;
}

// Test: Create repair order
function testCreateRepairOrder(token) {
  const vehicleId = 'test-vehicle-id'; // Replace with actual ID from test data

  const payload = {
    vehicle_id: vehicleId,
    reception_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: 'Load test order',
  };

  const res = http.post(`${SUPABASE_URL}/rest/v1/repair_orders`, JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Prefer': 'return=representation',
    },
  });

  const passed = check(res, {
    'create order status 201': (r) => r.status === 201,
    'create order response time < 300ms': (r) => r.timings.duration < 300,
  });

  errorRate.add(!passed);
  if (passed) successfulRequests.add(1);

  return res;
}

// Test: Fetch inventory
function testGetInventory(token) {
  const res = http.get(`${SUPABASE_URL}/rest/v1/spare_parts?select=*&order=name.asc`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
    },
  });

  check(res, {
    'inventory status 200': (r) => r.status === 200,
    'inventory response time < 400ms': (r) => r.timings.duration < 400,
  });

  return res;
}

// Test: Reports aggregation
function testGetReports(token) {
  const startDate = '2024-01-01';
  const endDate = '2024-12-31';

  const res = http.get(
    `${SUPABASE_URL}/rest/v1/rpc/get_sales_report?start_date=${startDate}&end_date=${endDate}`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  check(res, {
    'reports status 200': (r) => r.status === 200,
    'reports response time < 1s': (r) => r.timings.duration < 1000,
  });

  return res;
}

// Main test function
export default function () {
  // Login
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  const token = login(user.email, user.password);

  if (!token) {
    console.error('Failed to login');
    return;
  }

  // Run tests with realistic user behavior
  testGetVehicles(token);
  sleep(1);

  testGetRepairOrders(token);
  sleep(1);

  testGetInventory(token);
  sleep(2);

  // Occasionally create orders (10% of users)
  if (Math.random() < 0.1) {
    testCreateRepairOrder(token);
    sleep(1);
  }

  // Occasionally check reports (5% of users)
  if (Math.random() < 0.05) {
    testGetReports(token);
    sleep(3);
  }

  sleep(Math.random() * 3 + 2); // Random think time 2-5 seconds
}

// Setup function (runs once before tests)
export function setup() {
  console.log('🚀 Starting load tests...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  return { timestamp: new Date().toISOString() };
}

// Teardown function (runs once after tests)
export function teardown(data) {
  console.log('✅ Load tests completed');
  console.log(`Started at: ${data.timestamp}`);
  console.log(`Finished at: ${new Date().toISOString()}`);
}

// Custom summary
export function handleSummary(data) {
  return {
    'load-test-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const colors = options.enableColors;

  let summary = `\n${indent}📊 Load Test Results\n`;
  summary += `${indent}${'='.repeat(50)}\n\n`;

  // Metrics
  const metrics = data.metrics;
  summary += `${indent}🎯 Key Metrics:\n`;
  summary += `${indent}  - HTTP Requests: ${metrics.http_reqs.values.count}\n`;
  summary += `${indent}  - Failed Requests: ${metrics.http_req_failed.values.rate * 100}%\n`;
  summary += `${indent}  - Avg Duration: ${metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}  - P95 Duration: ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}  - P99 Duration: ${metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  summary += `${indent}  - Successful Requests: ${metrics.successful_requests?.values.count || 0}\n\n`;

  // Thresholds
  summary += `${indent}✓ Thresholds:\n`;
  Object.entries(data.thresholds || {}).forEach(([name, result]) => {
    const status = result.ok ? '✅' : '❌';
    summary += `${indent}  ${status} ${name}\n`;
  });

  return summary;
}
