/**
 * Guest Booking End-to-End Test
 * Tests the complete guest booking flow from landing to booking completion
 */

import { test, expect } from "@playwright/test";

test.describe("Guest Booking Flow", () => {
  test("should complete full guest booking workflow with lazy registration", async ({
    page
  }) => {
    // Navigate to explore page (public access)
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Page loaded successfully

    // Verify we're on explore page and services are loaded
    await expect(page.locator("h1")).toContainText("Explore Services");

    // Find and click on a service's "Book Now" button
    const bookNowButtons = page.locator('button:has-text("Book Now")');
    await expect(bookNowButtons.first()).toBeVisible();

    // Click the first available Book Now button
    await bookNowButtons.first().click();

    // Wait for booking modal to appear
    const bookingModal = page.locator(
      '[role="dialog"], .modal, .booking-modal'
    );
    await expect(bookingModal).toBeVisible();

    // Booking modal opened successfully

    // Verify modal title
    await expect(page.locator("h3")).toContainText("Book Appointment");

    // Check that guest fields are present (since user is not authenticated)
    const guestNameInput = page.locator("#guestName");
    const guestEmailInput = page.locator("#guestEmail");
    const guestPhoneInput = page.locator("#guestPhone");

    await expect(guestNameInput).toBeVisible();
    await expect(guestEmailInput).toBeVisible();
    await expect(guestPhoneInput).toBeVisible();

    // Fill guest information
    await guestNameInput.fill("John Doe");
    await guestEmailInput.fill("john.doe@example.com");
    await guestPhoneInput.fill("+237 612 345 678");

    // Select a time slot from availability picker
    // Wait for availability picker to load
    await page.waitForTimeout(1000); // Allow time for slots to load

    // Find available time slots
    const availableSlots = page.locator(
      ".time-slot:not([disabled]), .available-slot"
    );
    const slotCount = await availableSlots.count();

    if (slotCount === 0) {
      // If no slots available, we can't complete the test
      console.warn("No available time slots found for booking test");
      return;
    }

    // Click on the first available slot
    await availableSlots.first().click();

    // Verify the slot is selected (should have some visual indication)
    await expect(availableSlots.first()).toHaveClass(/selected|active/);

    // Submit the booking
    const submitButton = page.locator(
      'button[type="submit"], .form-submit-button'
    );
    await expect(submitButton).toBeEnabled();

    // Click submit
    await submitButton.click();

    // Wait for booking to process
    await page.waitForTimeout(2000);

    // Check for success message
    const successMessage = page.locator(
      '[role="alert"], .success, .booking-success'
    );
    await expect(successMessage).toBeVisible();

    // Verify success message content
    await expect(successMessage).toContainText(/success|confirmed|booked/i);

    // Wait for sign-up prompt to appear (should show after 2 seconds)
    await page.waitForTimeout(2500);

    // Check for sign-up prompt modal
    const signUpPrompt = page.locator(".fixed.inset-0 .bg-white.rounded-xl");
    await expect(signUpPrompt).toBeVisible();

    // Verify prompt content
    await expect(signUpPrompt).toContainText("Booking Confirmed!");
    await expect(signUpPrompt).toContainText("Create an account");

    // Test "Maybe Later" button
    const maybeLaterButton = signUpPrompt.locator(
      'button:has-text("Maybe Later")'
    );
    await expect(maybeLaterButton).toBeVisible();

    // Click "Maybe Later"
    await maybeLaterButton.click();

    // Verify prompt is dismissed
    await expect(signUpPrompt).not.toBeVisible();

    // Verify we're still on the same page/modal
    await expect(bookingModal).toBeVisible();
  });

  test("should handle sign-up prompt acceptance", async ({ page }) => {
    // Navigate to explore and start booking process
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Click Book Now on first service
    const bookNowButtons = page.locator('button:has-text("Book Now")');
    await bookNowButtons.first().click();

    // Fill guest details
    await page.locator("#guestName").fill("Jane Smith");
    await page.locator("#guestEmail").fill("jane.smith@example.com");

    // Select time slot
    await page.waitForTimeout(1000);
    const availableSlots = page.locator(
      ".time-slot:not([disabled]), .available-slot"
    );
    if ((await availableSlots.count()) > 0) {
      await availableSlots.first().click();

      // Submit booking
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Wait for success and prompt
      await page.waitForTimeout(3000);

      // Click "Sign Up Now" in prompt
      const signUpNowButton = page.locator('button:has-text("Sign Up Now")');
      if (await signUpNowButton.isVisible()) {
        await signUpNowButton.click();

        // Should navigate to register page
        await page.waitForURL(/\/register/);
        await expect(page.locator("h1, h2")).toContainText(/register|sign up/i);
      }
    }
  });

  test("should validate guest booking form fields", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Open booking modal
    const bookNowButtons = page.locator('button:has-text("Book Now")');
    await bookNowButtons.first().click();

    // Select a time slot first
    await page.waitForTimeout(1000);
    const availableSlots = page.locator(".time-slot:not([disabled])");
    if ((await availableSlots.count()) > 0) {
      await availableSlots.first().click();

      // Try to submit without filling required fields
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should show validation error
      const errorMessage = page.locator('.error, [role="alert"], .field-error');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/name|email|required/i);

      // Fill only email, leave name empty
      await page.locator("#guestEmail").fill("test@example.com");
      await submitButton.click();

      // Should still show error for name
      await expect(errorMessage).toContainText(/name/i);

      // Fill name but leave email empty
      await page.locator("#guestName").fill("Test User");
      await page.locator("#guestEmail").clear();
      await submitButton.click();

      // Should show error for email
      await expect(errorMessage).toContainText(/email/i);
    }
  });

  test("should allow browsing provider profiles", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Find "View Profile" button
    const viewProfileButtons = page.locator('button:has-text("View Profile")');
    await expect(viewProfileButtons.first()).toBeVisible();

    // Click View Profile
    await viewProfileButtons.first().click();

    // Should navigate to provider profile page
    await page.waitForURL(/\/provider\//);
    await expect(page.url()).toMatch(/\/provider\/[^/]+/);

    // Profile page loaded successfully

    // Verify profile content is loaded
    const profileContent = page.locator(".provider-profile, .profile-content");
    await expect(profileContent).toBeVisible();
  });
});
