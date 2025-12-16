// @ts-check

import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Integration test specific configuration
const integrationConfig = {
  displayName: "integration",
  testEnvironment: "node", // Use node environment for integration tests
  setupFilesAfterEnv: ["<rootDir>/test/integration/setup/jest.setup.ts"],

  // Only run integration tests
  testMatch: ["<rootDir>/test/integration/**/*.test.ts"],

  // Longer timeout for database operations
  testTimeout: 30000,

  // Run tests sequentially to avoid database conflicts
  maxWorkers: 1,

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/test/components/", // Exclude unit tests
    "<rootDir>/test/mocks/",
    "<rootDir>/test/utils/",
  ],

  // Coverage configuration (optional)
  collectCoverageFrom: [
    "app/actions/**/*.ts",
    "lib/inventory-calculations.ts",
    "!**/*.d.ts",
  ],
};

// createJestConfig is exported this way to ensure next/jest can load the Next.js config
export default createJestConfig(integrationConfig);
