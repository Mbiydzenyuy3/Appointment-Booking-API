/**
 * Accessibility Test Runner
 * Runs comprehensive accessibility tests across all pages
 */

import { test, expect } from "@playwright/test";
import { analyzeAccessibility } from "@axe-core/playwright";

// Import our comprehensive accessibility suite
// Note: This would need to be adapted for Playwright context
const runAccessibilityTests = async (page) => {
  const results = await analyzeAccessibility(page, {
    detailedReport: true,
    detailedReportOptions: {
      html: true
    }
  });

  return results;
};

// Test data - all pages in the application
const pages = [
  { name: "Landing Page", url: "/" },
  { name: "Login Page", url: "/login" },
  { name: "Register Page", url: "/register" },
  { name: "Dashboard", url: "/dashboard" },
  { name: "Book Appointment", url: "/book-appointment" },
  { name: "Appointments", url: "/appointments" },
  { name: "Slots", url: "/slots" },
  { name: "Provider Dashboard", url: "/provider-dashboard" }
];

// Run accessibility tests for each page
for (const pageData of pages) {
  test.describe(`Accessibility Tests - ${pageData.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pageData.url);
      await page.waitForLoadState("networkidle");
    });

    test(`should have no critical accessibility violations on ${pageData.name}`, async ({
      page
    }) => {
      const results = await runAccessibilityTests(page);

      // Filter out non-critical violations
      const criticalViolations = results.violations.filter(
        (violation) =>
          violation.impact === "critical" || violation.impact === "serious"
      );

      if (criticalViolations.length > 0) {
        console.log(`Critical violations found on ${pageData.name}:`);
        criticalViolations.forEach((violation) => {
          console.log(`- ${violation.id}: ${violation.description}`);
          console.log(`  Impact: ${violation.impact}`);
          console.log(`  Help: ${violation.helpUrl}`);
        });
      }

      expect(criticalViolations.length).toBe(0);
    });

    test(`should have proper heading structure on ${pageData.name}`, async ({
      page
    }) => {
      const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();

      if (headings.length > 0) {
        // Check if first heading is h1
        const firstHeading = headings[0];
        const firstHeadingTag = await firstHeading.evaluate((el) =>
          el.tagName.toLowerCase()
        );
        expect(firstHeadingTag).toBe("h1");

        // Check heading hierarchy
        let previousLevel = 0;
        for (const heading of headings) {
          const level = parseInt(
            await heading.evaluate((el) => el.tagName.charAt(1))
          );
          expect(level).toBeLessThanOrEqual(previousLevel + 1);
          previousLevel = level;
        }
      }
    });

    test(`should have proper landmark structure on ${pageData.name}`, async ({
      page
    }) => {
      // Check for main landmark
      const mainElement = page.locator('main, [role="main"]');
      await expect(mainElement).toHaveCount(1);

      // Check for navigation
      const navElement = page.locator('nav, [role="navigation"]');
      await expect(navElement).toHaveCount(1);

      // Check for skip links
      const skipLinks = page.locator('a[href^="#"]');
      const skipLinksCount = await skipLinks.count();
      expect(skipLinksCount).toBeGreaterThan(0);
    });

    test(`should have proper form labels on ${pageData.name}`, async ({
      page
    }) => {
      const inputs = page.locator(
        'input:not([type="hidden"]), select, textarea'
      );
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const hasLabel = await input.evaluate((el) => {
          const id = el.getAttribute("id");
          const ariaLabel = el.getAttribute("aria-label");
          const ariaLabelledby = el.getAttribute("aria-labelledby");
          const hasAssociatedLabel =
            id && document.querySelector(`label[for="${id}"]`);

          return !!(ariaLabel || ariaLabelledby || hasAssociatedLabel);
        });

        expect(hasLabel).toBeTruthy();
      }
    });

    test(`should support keyboard navigation on ${pageData.name}`, async ({
      page
    }) => {
      // Check if tab navigation works
      await page.keyboard.press("Tab");
      const focusedElement = await page.evaluate(
        () => document.activeElement.tagName
      );
      expect(focusedElement).toBeTruthy();

      // Check for focus indicators
      const focusableElements = page.locator(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const focusableCount = await focusableElements.count();

      // Test tabbing through focusable elements
      for (let i = 0; i < Math.min(focusableCount, 10); i++) {
        await page.keyboard.press("Tab");
        const isFocused = await page.evaluate(() => {
          const active = document.activeElement;
          return (
            active &&
            (active.tagName === "A" ||
              active.tagName === "BUTTON" ||
              active.tagName === "INPUT" ||
              active.tagName === "SELECT" ||
              active.tagName === "TEXTAREA")
          );
        });
        expect(isFocused).toBeTruthy();
      }
    });

    test(`should have proper color contrast on ${pageData.name}`, async ({
      page
    }) => {
      const results = await runAccessibilityTests(page);
      const contrastViolations = results.violations.filter(
        (v) => v.id === "color-contrast" || v.id === "color-contrast-enhanced"
      );

      expect(contrastViolations.length).toBe(0);
    });
  });
}

// Test responsive design accessibility
test.describe("Responsive Accessibility Tests", () => {
  const viewports = [
    { name: "Mobile", width: 375, height: 667 },
    { name: "Tablet", width: 768, height: 1024 },
    { name: "Desktop", width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    test.describe(`${viewport.name} Viewport (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height
        });
      });

      for (const pageData of pages) {
        test(`should be accessible on ${pageData.name} at ${viewport.name} viewport`, async ({
          page
        }) => {
          await page.goto(pageData.url);
          await page.waitForLoadState("networkidle");

          const results = await runAccessibilityTests(page);
          const criticalViolations = results.violations.filter(
            (v) => v.impact === "critical" || v.impact === "serious"
          );

          expect(criticalViolations.length).toBe(0);
        });
      }
    });
  }
});

// Test accessibility with different user preferences
test.describe("Accessibility with User Preferences", () => {
  test("should work with reduced motion preference", async ({ page }) => {
    // Set reduced motion preference
    await page.addStyleTag({
      content: "* { transition: none !important; animation: none !important; }"
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const results = await runAccessibilityTests(page);
    expect(results.violations.length).toBe(0);
  });

  test("should work with high contrast mode", async ({ page }) => {
    // Simulate high contrast mode
    await page.addStyleTag({
      content: `
        * {
          background-color: white !important;
          color: black !important;
          border: 2px solid black !important;
        }
        a { color: blue !important; text-decoration: underline !important; }
        button { background-color: black !important; color: white !important; }
      `
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const results = await runAccessibilityTests(page);
    expect(results.violations.length).toBe(0);
  });
});

export default {};
