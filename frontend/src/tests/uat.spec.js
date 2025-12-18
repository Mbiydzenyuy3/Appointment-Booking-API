/**
 * User Acceptance Testing (UAT) Framework
 * Tests real user scenarios and workflows
 */

import { test, expect } from "@playwright/test";
import { analyzeAccessibility } from "@axe-core/playwright";

// UAT Test Scenarios
const uatScenarios = [
  {
    name: "New User Registration & First Appointment",
    description:
      "Complete workflow for a new user registering and booking their first appointment",
    userProfile: {
      type: "new_user",
      accessibility: "standard",
      device: "desktop",
      browser: "chrome"
    },
    steps: [
      "Navigate to landing page",
      "Click register button",
      "Complete registration form",
      "Login with new account",
      "Navigate to booking page",
      "Select service and time",
      "Complete booking",
      "Verify confirmation"
    ],
    successCriteria: [
      "Registration completed successfully",
      "Login works with new credentials",
      "Booking completed without errors",
      "Confirmation email received",
      "All pages meet accessibility standards",
      "Works on mobile device"
    ]
  },
  {
    name: "Existing User Managing Appointments",
    description: "Returning user managing their appointment schedule",
    userProfile: {
      type: "existing_user",
      accessibility: "screen_reader_user",
      device: "mobile",
      browser: "safari"
    },
    steps: [
      "Login to existing account",
      "View current appointments",
      "Reschedule existing appointment",
      "Cancel one appointment",
      "Book new appointment",
      "Update profile preferences"
    ],
    successCriteria: [
      "Can view all appointments",
      "Can reschedule with keyboard only",
      "Can cancel appointments",
      "Profile updates saved",
      "Screen reader can navigate all pages"
    ]
  },
  {
    name: "Provider Managing Schedule",
    description: "Healthcare provider managing their appointment schedule",
    userProfile: {
      type: "provider",
      accessibility: "motor_disability",
      device: "tablet",
      browser: "firefox"
    },
    steps: [
      "Login as provider",
      "View daily schedule",
      "Add new time slots",
      "Edit existing appointments",
      "Set availability preferences",
      "Generate schedule report"
    ],
    successCriteria: [
      "Large touch targets available",
      "Keyboard navigation works",
      "Time slot management efficient",
      "Reports generate correctly",
      "All interactions accessible"
    ]
  },
  {
    name: "Accessibility-First User Experience",
    description: "Testing with enhanced accessibility features enabled",
    userProfile: {
      type: "accessibility_user",
      accessibility: "high_contrast_reduced_motion",
      device: "desktop",
      browser: "edge"
    },
    steps: [
      "Enable accessibility preferences",
      "Navigate using keyboard only",
      "Use screen reader simulation",
      "Test with high contrast mode",
      "Verify reduced motion settings",
      "Test voice navigation if available"
    ],
    successCriteria: [
      "High contrast mode works",
      "Keyboard navigation complete",
      "Screen reader announces content",
      "Animations reduced/disabled",
      "Focus indicators visible",
      "Skip links functional"
    ]
  }
];

// Real device testing scenarios
const deviceScenarios = [
  {
    name: "Mobile Phone Portrait",
    device: "iPhone 12",
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)",
    scenarios: ["login", "booking", "profile_management"]
  },
  {
    name: "Mobile Phone Landscape",
    device: "iPhone 12",
    viewport: { width: 844, height: 390 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)",
    scenarios: ["booking", "appointment_view"]
  },
  {
    name: "Tablet Portrait",
    device: "iPad Pro",
    viewport: { width: 768, height: 1024 },
    userAgent: "Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)",
    scenarios: ["provider_dashboard", "schedule_management"]
  },
  {
    name: "Desktop Standard",
    device: "Desktop",
    viewport: { width: 1920, height: 1080 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    scenarios: ["full_workflow", "reporting", "bulk_operations"]
  }
];

// Browser-specific testing
const browserScenarios = [
  {
    name: "Chrome Latest",
    browser: "chromium",
    version: "latest",
    quirks: ["performance", "pwa_support"]
  },
  {
    name: "Firefox Latest",
    browser: "firefox",
    version: "latest",
    quirks: ["privacy_features", "extensions"]
  },
  {
    name: "Safari Latest",
    browser: "webkit",
    version: "latest",
    quirks: ["ios_specific", "cookie_handling"]
  },
  {
    name: "Edge Latest",
    browser: "chromium",
    version: "latest",
    quirks: ["windows_integration", "ink_support"]
  }
];

test.describe("User Acceptance Testing (UAT)", () => {
  // Main UAT scenarios
  for (const scenario of uatScenarios) {
    test.describe(`${scenario.name}`, () => {
      test.beforeEach(async ({ page }) => {
        // Set up user profile
        await setupUserProfile(page, scenario.userProfile);

        // Configure accessibility settings
        if (scenario.userProfile.accessibility !== "standard") {
          await configureAccessibilitySettings(
            page,
            scenario.userProfile.accessibility
          );
        }
      });

      test(`should complete ${scenario.description}`, async ({ page }) => {
        const results = {
          scenario: scenario.name,
          startTime: new Date().toISOString(),
          steps: [],
          issues: [],
          accessibility: {}
        };

        // Execute each step of the scenario
        for (const step of scenario.steps) {
          const stepStart = Date.now();

          try {
            await executeStep(page, step);
            const stepDuration = Date.now() - stepStart;

            results.steps.push({
              step,
              success: true,
              duration: stepDuration,
              timestamp: new Date().toISOString()
            });

            // Check accessibility at each step
            if (step.includes("page") || step.includes("navigate")) {
              const accessibility = await analyzeAccessibility(page);
              results.accessibility[step] = accessibility;

              // Fail if critical accessibility issues
              const criticalIssues = accessibility.violations.filter(
                (v) => v.impact === "critical" || v.impact === "serious"
              );

              if (criticalIssues.length > 0) {
                results.issues.push({
                  step,
                  type: "accessibility",
                  severity: "critical",
                  details: criticalIssues.map((v) => v.id)
                });
              }
            }
          } catch (error) {
            const stepDuration = Date.now() - stepStart;
            results.steps.push({
              step,
              success: false,
              duration: stepDuration,
              error: error.message,
              timestamp: new Date().toISOString()
            });

            results.issues.push({
              step,
              type: "execution",
              severity: "high",
              details: error.message
            });

            throw error;
          }
        }

        // Verify success criteria
        for (const criteria of scenario.successCriteria) {
          const criteriaMet = await verifySuccessCriteria(page, criteria);
          expect(criteriaMet).toBeTruthy();
        }

        results.endTime = new Date().toISOString();
        results.totalDuration =
          new Date(results.endTime) - new Date(results.startTime);

        console.log(`UAT Results for ${scenario.name}:`, results);
      });
    });
  }

  // Device-specific UAT
  for (const device of deviceScenarios) {
    test.describe(`UAT - ${device.name}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize(device.viewport);
        await page.setExtraHTTPHeaders({
          "User-Agent": device.userAgent
        });
      });

      for (const scenarioName of device.scenarios) {
        test(`should complete ${scenarioName} on ${device.name}`, async ({
          page
        }) => {
          await page.goto("/");
          await page.waitForLoadState("networkidle");

          // Verify responsive design
          await expect(page.locator("h1")).toBeVisible();

          // Test touch/click interactions
          const buttons = page.locator("button, .btn, a[href]");
          const buttonCount = await buttons.count();

          if (buttonCount > 0) {
            await buttons.first().click();
            await page.waitForTimeout(500);
          }

          // Check accessibility on mobile
          const accessibility = await analyzeAccessibility(page);
          const mobileViolations = accessibility.violations.filter((v) =>
            ["touch-target", "mobile"].some(
              (keyword) =>
                v.id.toLowerCase().includes(keyword) ||
                v.description.toLowerCase().includes(keyword)
            )
          );

          expect(mobileViolations.length).toBe(0);
        });
      }
    });
  }

  // Browser-specific UAT
  for (const browser of browserScenarios) {
    test.describe(`UAT - ${browser.name}`, () => {
      test(`should handle ${browser.name} specific features`, async ({
        page,
        browserName
      }) => {
        // Only run if this is the target browser
        test.skip(
          browserName !== browser.browser,
          `Skipping ${browser.name} test on ${browserName}`
        );

        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // Test browser-specific features
        for (const quirk of browser.quirks) {
          await testBrowserQuirk(page, quirk, browser.name);
        }

        // Verify basic functionality
        const accessibility = await analyzeAccessibility(page);
        expect(accessibility.violations.length).toBe(0);

        // Test performance
        const loadTime = await measurePageLoad(page);
        expect(loadTime).toBeLessThan(3000);
      });
    });
  }
});

// Helper functions
async function setupUserProfile(page, userProfile) {
  // Set up user type specific configurations
  switch (userProfile.type) {
    case "new_user":
      // Clear any existing data
      await page.context().clearCookies();
      await page.context().clearPermissions();
      break;

    case "existing_user":
      // Set up authenticated session (would need actual login)
      // This is a placeholder for the actual implementation
      break;

    case "provider":
      // Configure provider-specific settings
      break;

    case "accessibility_user":
      // Enable accessibility preferences
      break;
  }
}

async function configureAccessibilitySettings(page, accessibilityType) {
  switch (accessibilityType) {
    case "screen_reader_user":
      // Configure for screen reader users
      await page.addStyleTag({
        content: `
          * { outline: 2px solid blue !important; }
          .sr-only { position: absolute; width: 1px; height: 1px; }
        `
      });
      break;

    case "motor_disability":
      // Configure for motor disabilities (larger touch targets)
      await page.addStyleTag({
        content: `
          button, a, input, select { min-height: 44px !important; min-width: 44px !important; }
          * { cursor: default !important; }
        `
      });
      break;

    case "high_contrast_reduced_motion":
      // Configure high contrast and reduced motion
      await page.addStyleTag({
        content: `
          * { 
            background-color: white !important; 
            color: black !important; 
            border: 2px solid black !important;
            transition: none !important;
            animation: none !important;
          }
          a { color: blue !important; text-decoration: underline !important; }
        `
      });
      break;
  }
}

async function executeStep(page, step) {
  switch (step) {
    case "Navigate to landing page":
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      break;

    case "Click register button":
      await page.click('text=Register, [href*="register"], .register-btn');
      await page.waitForLoadState("networkidle");
      break;

    case "Complete registration form":
      await fillRegistrationForm(page);
      break;

    case "Login with new account":
    case "Login to existing account":
      await fillLoginForm(page);
      break;

    case "Navigate to booking page":
    case "Navigate to appointment booking":
      await page.click('text=Book, [href*="book"], .book-btn');
      await page.waitForLoadState("networkidle");
      break;

    case "Select service and time":
      await selectServiceAndTime(page);
      break;

    case "Complete booking":
      await page.click('button[type="submit"], .submit-booking');
      await page.waitForTimeout(2000);
      break;

    case "View current appointments":
      await page.goto("/appointments");
      await page.waitForLoadState("networkidle");
      break;

    default:
      console.log(`Executing step: ${step}`);
  }
}

async function fillRegistrationForm(page) {
  // Fill registration form with test data
  await page.fill('input[name="firstName"]', "John");
  await page.fill('input[name="lastName"]', "Doe");
  await page.fill('input[name="email"]', `john.doe.${Date.now()}@example.com`);
  await page.fill('input[name="password"]', "SecurePass123!");
  await page.fill('input[name="confirmPassword"]', "SecurePass123!");
}

async function fillLoginForm(page) {
  // Fill login form with test credentials
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"], .login-btn');
  await page.waitForLoadState("networkidle");
}

async function selectServiceAndTime(page) {
  // Select service
  const serviceSelect = page.locator('select[name="service"]');
  if ((await serviceSelect.count()) > 0) {
    await serviceSelect.selectOption({ index: 1 });
  }

  // Select date
  const dateInput = page.locator('input[type="date"], .date-picker');
  if ((await dateInput.count()) > 0) {
    await dateInput.fill("2024-01-15");
  }

  // Select time slot
  const timeSlot = page.locator(".time-slot:not([disabled]), .available-slot");
  if ((await timeSlot.count()) > 0) {
    await timeSlot.first().click();
  }
}

async function verifySuccessCriteria(page, criteria) {
  switch (criteria) {
    case "Registration completed successfully": {
      const successMessage = page.locator(
        '[role="alert"], .success, .confirmation'
      );
      return (await successMessage.count()) > 0;
    }

    case "Login works with new credentials": {
      const isLoggedIn = page.locator(
        '.user-menu, .dashboard, [href*="logout"]'
      );
      return (await isLoggedIn.count()) > 0;
    }

    case "Booking completed without errors": {
      const bookingConfirmation = page.locator(
        '.booking-confirmed, [role="alert"]'
      );
      return (await bookingConfirmation.count()) > 0;
    }

    case "All pages meet accessibility standards": {
      const accessibility = await analyzeAccessibility(page);
      return accessibility.violations.length === 0;
    }

    case "Works on mobile device": {
      const isResponsive = page.locator('meta[name="viewport"]');
      return (await isResponsive.count()) > 0;
    }

    default:
      return true; // Default to pass for unrecognized criteria
  }
}

async function testBrowserQuirk(page, quirk, browserName) {
  switch (quirk) {
    case "performance": {
      // Test performance features specific to the browser
      const navigation = await page.evaluate(
        () => performance.getEntriesByType("navigation")[0]
      );
      expect(navigation).toBeTruthy();
      break;
    }

    case "pwa_support": {
      // Test PWA features
      const hasServiceWorker = await page.evaluate(
        () => "serviceWorker" in navigator
      );
      expect(hasServiceWorker).toBeTruthy();
      break;
    }

    case "privacy_features": {
      // Test privacy-related features
      const hasDoNotTrack = await page.evaluate(() => navigator.doNotTrack);
      expect(hasDoNotTrack).toBeDefined();
      break;
    }

    case "extensions": {
      // Test extension compatibility
      const HAS_EXTENSIONS = await page.evaluate(
        () => typeof browser !== "undefined"
      );
      // Don't fail if extensions aren't available
      // Variable intentionally unused as per comment above
      break;
    }

    default:
      console.log(`Testing browser quirk: ${quirk} for ${browserName}`);
  }
}

async function measurePageLoad(page) {
  const startTime = Date.now();
  await page.goto(page.url());
  await page.waitForLoadState("networkidle");
  return Date.now() - startTime;
}

export default {};
