// k6 Load Test Configuration
export const config = {
  // Base URL for your Next.js application
  baseUrl: __ENV.BASE_URL || "http://localhost:3000",

  // Test user credentials
  testUsers: [
    {
      email: __ENV.TEST_USER_EMAIL_1 || "test1@example.com",
      password: __ENV.TEST_USER_PASSWORD_1 || "password123",
    },
    {
      email: __ENV.TEST_USER_EMAIL_2 || "test2@example.com",
      password: __ENV.TEST_USER_PASSWORD_2 || "password123",
    },
    {
      email: __ENV.TEST_USER_EMAIL_3 || "test3@example.com",
      password: __ENV.TEST_USER_PASSWORD_3 || "password123",
    },
    {
      email: __ENV.TEST_USER_EMAIL_4 || "test4@example.com",
      password: __ENV.TEST_USER_PASSWORD_4 || "password123",
    },
    {
      email: __ENV.TEST_USER_EMAIL_5 || "test5@example.com",
      password: __ENV.TEST_USER_PASSWORD_5 || "password123",
    },
    {
      email: __ENV.TEST_USER_EMAIL_6 || "test6@example.com",
      password: __ENV.TEST_USER_PASSWORD_6 || "password123",
    },
    {
      email: __ENV.TEST_USER_EMAIL_7 || "test7@example.com",
      password: __ENV.TEST_USER_PASSWORD_7 || "password123",
    },
    {
      email: __ENV.TEST_USER_EMAIL_8 || "test8@example.com",
      password: __ENV.TEST_USER_PASSWORD_8 || "password123",
    },
    {
      email: __ENV.TEST_USER_EMAIL_9 || "test9@example.com",
      password: __ENV.TEST_USER_PASSWORD_9 || "password123",
    },
    {
      email: __ENV.TEST_USER_EMAIL_10 || "test10@example.com",
      password: __ENV.TEST_USER_PASSWORD_10 || "password123",
    },
  ],

  // Load test scenarios
  scenarios: {
    smoke: {
      vus: 50,
      duration: "1m",
    },
    load: {
      vus: 100,
      duration: "3m",
    },
    stress: {
      vus: 20,
      duration: "5m",
    },
    spike: {
      stages: [
        { duration: "30s", target: 2 },
        { duration: "1m", target: 10 },
        { duration: "30s", target: 2 },
        { duration: "30s", target: 0 },
      ],
    },
  },

  // Thresholds
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<3000"], // 95% of requests should be below 2s, 99% below 3s
    http_req_failed: ["rate<0.05"], // Error rate should be less than 5%
    http_reqs: ["rate>10"], // At least 10 requests per second
  },
};
