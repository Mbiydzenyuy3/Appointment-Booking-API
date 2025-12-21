/**
 * End-to-End Testing Suite
 * Tests complete user workflows with accessibility validation
 */

import { test, expect } from "@playwright/test";
import { analyzeAccessibility } from "@axe-core/playwright";

// Test user workflows for appointment booking system
test.describe("End-to-End User Workflows", () => {
  test.describe("Anonymous User Journey", () => {
    test("should complete registration workflow with accessibility", async ({
      page
    }) => {
      // Navigate to landing page
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check accessibility of landing page
      const landingAccessibility = await analyzeAccessibility(page);
      expect(landingAccessibility.violations.length).toBe(0);

      // Navigate to registration
      await page.click("text=Register");
      await page.waitForLoadState("networkidle");

      // Check accessibility of registration page
      const registerAccessibility = await analyzeAccessibility(page);
      expect(registerAccessibility.violations.length).toBe(0);

      // Fill registration form
      await page.fill('input[name="firstName"]', "John");
      await page.fill('input[name="lastName"]', "Doe");
      await page.fill('input[name="email"]', "john.doe@example.com");
      await page.fill('input[name="password"]', "SecurePass123!");
      await page.fill('input[name="confirmPassword"]', "SecurePass123!");

      // Check form accessibility
      const formInputs = page.locator("input, select, textarea");
      const inputCount = await formInputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = formInputs.nth(i);
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

      // Submit form
      await page.click('button[type="submit"]');

      // Check for success message with accessibility
      const successMessage = page.locator(
        '[role="alert"], .success, .alert-success'
      );
      await expect(successMessage).toBeVisible();

      // Verify success message is accessible
      const isAlert = await successMessage.evaluate(
        (el) =>
          el.getAttribute("role") === "alert" || el.classList.contains("alert")
      );
      expect(isAlert).toBeTruthy();
    });

    test("should complete login workflow with accessibility", async ({
      page
    }) => {
      await page.goto("/login");
      await page.waitForLoadState("networkidle");

      // Check accessibility of login page
      const loginAccessibility = await analyzeAccessibility(page);
      expect(loginAccessibility.violations.length).toBe(0);

      // Test keyboard navigation
      await page.keyboard.press("Tab");
      const firstFocusable = await page.evaluate(
        () => document.activeElement.tagName
      );
      expect(firstFocusable).toBeTruthy();

      // Fill login form
      await page.fill('input[name="email"]', "john.doe@example.com");
      await page.fill('input[name="password"]', "SecurePass123!");

      // Test form submission with Enter key
      await page.keyboard.press("Enter");

      // Check for loading state
      const loadingIndicator = page.locator(
        '[aria-busy="true"], .loading, .spinner'
      );
      if ((await loadingIndicator.count()) > 0) {
        await expect(loadingIndicator).toBeVisible();
      }
    });
  });

  test.describe("Authenticated User Journey", () => {
    test.beforeEach(async ({ page }) => {
      // Login as test user
      await page.goto("/login");
      await page.fill('input[name="email"]', "test@example.com");
      await page.fill('input[name="password"]', "password123");
      await page.click('button[type="submit"]');
      await page.waitForLoadState("networkidle");
    });

    test("should complete appointment booking workflow with accessibility", async ({
      page
    }) => {
      // Check dashboard accessibility
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      const dashboardAccessibility = await analyzeAccessibility(page);
      expect(dashboardAccessibility.violations.length).toBe(0);

      // Navigate to appointment booking
      await page.click("text=Book Appointment");
      await page.waitForLoadState("networkidle");

      // Check booking page accessibility
      const bookingAccessibility = await analyzeAccessibility(page);
      expect(bookingAccessibility.violations.length).toBe(0);

      // Test service selection with keyboard navigation
      const serviceOptions = page.locator('select[name="service"] option');
      const serviceCount = await serviceOptions.count();

      if (serviceCount > 1) {
        await page.selectOption('select[name="service"]', { index: 1 });
      }

      // Test date picker accessibility
      const datePicker = page.locator('input[type="date"], .date-picker');
      if ((await datePicker.count()) > 0) {
        await datePicker.first().click();

        // Check date picker is keyboard accessible
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Enter");
      }

      // Test time slot selection
      const availableSlots = page.locator(".time-slot:not([disabled])");
      const availableCount = await availableSlots.count();

      if (availableCount > 0) {
        // Test keyboard navigation through time slots
        await availableSlots.first().focus();
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Enter");
      }

      // Test form submission
      await page.click('button[type="submit"], .book-appointment-btn');

      // Check for confirmation with accessibility
      const confirmation = page.locator(
        '[role="alert"], .confirmation, .success-message'
      );
      await expect(confirmation).toBeVisible();

      // Verify confirmation is screen reader friendly
      const confirmationText = await confirmation.textContent();
      expect(confirmationText).toBeTruthy();
    });

    test("should manage appointments with accessibility", async ({ page }) => {
      await page.goto("/appointments");
      await page.waitForLoadState("networkidle");

      // Check appointments page accessibility
      const appointmentsAccessibility = await analyzeAccessibility(page);
      expect(appointmentsAccessibility.violations.length).toBe(0);

      // Test appointment list accessibility
      const appointmentItems = page.locator(".appointment-item, tr");
      const itemCount = await appointmentItems.count();

      if (itemCount > 0) {
        // Test keyboard navigation through appointment list
        await appointmentItems.first().focus();
        await page.keyboard.press("ArrowDown");

        // Test action buttons accessibility
        const actionButtons = page.locator(
          ".appointment-actions button, .btn-reschedule, .btn-cancel"
        );
        const buttonCount = await actionButtons.count();

        if (buttonCount > 0) {
          // Check buttons have proper labels
          for (let i = 0; i < Math.min(buttonCount, 3); i++) {
            const button = actionButtons.nth(i);
            const hasLabel = await button.evaluate((el) => {
              const ariaLabel = el.getAttribute("aria-label");
              const textContent = el.textContent?.trim();
              return !!(ariaLabel || textContent);
            });
            expect(hasLabel).toBeTruthy();
          }
        }
      }
    });
  });
});

// Test responsive design workflows
test.describe("Responsive End-to-End Tests", () => {
  const viewports = [
    { name: "Mobile", width: 375, height: 667 },
    { name: "Tablet", width: 768, height: 1024 },
    { name: "Desktop", width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    test.describe(`${viewport.name} Workflow (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height
        });
      });

      test("should complete user registration on mobile", async ({ page }) => {
        await page.goto("/register");
        await page.waitForLoadState("networkidle");

        // Check responsive accessibility
        const accessibility = await analyzeAccessibility(page);
        expect(accessibility.violations.length).toBe(0);

        // Test form usability on mobile
        const form = page.locator("form");
        await expect(form).toBeVisible();

        // Test input focus on mobile
        const inputs = page.locator("input, select, textarea");
        const inputCount = await inputs.count();

        for (let i = 0; i < Math.min(inputCount, 3); i++) {
          const input = inputs.nth(i);
          await input.focus();
          const isFocused = await input.evaluate(
            (el) => el === document.activeElement
          );
          expect(isFocused).toBeTruthy();
        }

        // Test button accessibility on mobile
        const buttons = page.locator('button, input[type="submit"]');
        const buttonCount = await buttons.count();

        for (let i = 0; i < Math.min(buttonCount, 2); i++) {
          const button = buttons.nth(i);
          await button.focus();
          const isFocused = await button.evaluate(
            (el) => el === document.activeElement
          );
          expect(isFocused).toBeTruthy();
        }
      });

      test("should have accessible navigation on mobile", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // Test mobile menu accessibility
        const menuButton = page.locator(
          ".mobile-menu-btn, .hamburger, [aria-expanded]"
        );
        if ((await menuButton.count()) > 0) {
          await menuButton.first().click();

          // Check menu is accessible
          const mobileMenu = page.locator(".mobile-menu, .nav-open");
          await expect(mobileMenu).toBeVisible();

          // Test keyboard navigation in mobile menu
          const menuItems = mobileMenu.locator("a, button");
          const itemCount = await menuItems.count();

          if (itemCount > 0) {
            await menuItems.first().focus();
            await page.keyboard.press("ArrowDown");
          }
        }

        // Check navigation landmarks
        const nav = page.locator('nav, [role="navigation"]');
        await expect(nav).toHaveCount(1);
      });
    });
  }
});

// Test assistive technology workflows
test.describe("Assistive Technology Workflows", () => {
  test("should work with screen reader simulation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test heading structure for screen readers
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    const headingCount = await headings.count();

    if (headingCount > 0) {
      const firstHeading = await headings.first().textContent();
      expect(firstHeading).toBeTruthy();

      // Check heading hierarchy
      let previousLevel = 0;
      for (let i = 0; i < Math.min(headingCount, 5); i++) {
        const heading = headings.nth(i);
        const tagName = await heading.evaluate((el) =>
          el.tagName.toLowerCase()
        );
        const level = parseInt(tagName.charAt(1));
        expect(level).toBeLessThanOrEqual(previousLevel + 1);
        previousLevel = level;
      }
    }

    // Test landmark navigation
    const main = page.locator('main, [role="main"]');
    await expect(main).toHaveCount(1);

    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toHaveCount(1);

    // Test skip links for screen readers
    const skipLinks = page.locator('a[href^="#"]');
    const skipLinkCount = await skipLinks.count();
    expect(skipLinkCount).toBeGreaterThan(0);
  });

  test("should support keyboard-only navigation", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Test tab order
    const focusableElements = page.locator(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const elementCount = await focusableElements.count();

    // Test tabbing through all focusable elements
    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      await page.keyboard.press("Tab");

      // Check that focus moved to a focusable element
      const focusedElement = await page.evaluate(() => document.activeElement);
      const isFocusable = await page.evaluate((el) => {
        return (
          el &&
          (el.tagName === "A" ||
            el.tagName === "BUTTON" ||
            el.tagName === "INPUT" ||
            el.tagName === "SELECT" ||
            el.tagName === "TEXTAREA" ||
            el.hasAttribute("tabindex"))
        );
      }, focusedElement);

      expect(isFocusable).toBeTruthy();
    }

    // Test form submission with Enter key
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    if ((await emailInput.count()) > 0 && (await passwordInput.count()) > 0) {
      await emailInput.fill("test@example.com");
      await passwordInput.fill("password123");
      await page.keyboard.press("Enter");

      // Check for appropriate response
      await page.waitForTimeout(1000);
    }
  });
});

// Test error handling and edge cases
test.describe("Error Handling and Edge Cases", () => {
  test("should handle form validation errors accessibly", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    // Submit empty form to trigger validation
    const submitButton = page.locator('button[type="submit"]');
    if ((await submitButton.count()) > 0) {
      await submitButton.first().click();

      // Check for error messages with proper accessibility
      const errorMessages = page.locator(
        '.error, .field-error, [role="alert"]'
      );
      const errorCount = await errorMessages.count();

      if (errorCount > 0) {
        // Verify error messages are associated with form fields
        for (let i = 0; i < Math.min(errorCount, 3); i++) {
          const error = errorMessages.nth(i);

          // Errors should be in alert role or have proper association
          const isAlert = await error.evaluate(
            (el) =>
              el.getAttribute("role") === "alert" ||
              el.classList.contains("error")
          );
          expect(isAlert).toBeTruthy();
        }
      }
    }
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Simulate network error
    await page.route("**/api/**", (route) => {
      route.abort("internet");
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for error message with accessibility
    const errorMessage = page.locator(
      '[role="alert"], .error, .offline-message'
    );
    if ((await errorMessage.count()) > 0) {
      await expect(errorMessage).toBeVisible();

      // Verify error message is accessible
      const isAlert = await errorMessage.evaluate(
        (el) =>
          el.getAttribute("role") === "alert" || el.classList.contains("error")
      );
      expect(isAlert).toBeTruthy();
    }
  });
});

export default {};
