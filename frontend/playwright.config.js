/**
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const { devices } = require("@playwright/test");

const config = {
  testDir: "./src/tests",
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }]
  ],
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },

  projects: [
    // Desktop browsers
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] }
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] }
    },

    // Mobile browsers
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] }
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] }
    },

    // Tablets
    {
      name: "Tablet Chrome",
      use: { ...devices["iPad Pro"] }
    },
    {
      name: "Tablet Safari",
      use: { ...devices["iPad Pro"] }
    },

    // Accessibility specific project
    {
      name: "accessibility",
      use: {
        ...devices["Desktop Chrome"],
        // Extra options for accessibility testing
        hasTouch: false,
        colorScheme: "light"
      }
    }
  ],

  // Global setup and teardown
  // Note: Setup/teardown files are not implemented yet
  // globalSetup: require.resolve("./src/tests/setup/global-setup.js"),
  // globalTeardown: require.resolve("./src/tests/setup/global-teardown.js"),

  // Test results directory
  outputDir: "test-results/",

  // Maximum number of test failures
  maxFailures: process.env.CI ? 5 : undefined,

  // Web server for tests
  webServer: {
    command: "npm run dev",
    port: 5173,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI
  }
};

module.exports = config;
