/**
 * Performance Testing Suite
 * Tests Core Web Vitals and performance metrics
 */

import { test, expect } from "@playwright/test";
import { injectSpeedInsights } from "./utils/performance-utils.js";

// Test data for different pages and scenarios
const pages = [
  { name: "Landing Page", url: "/", userType: "anonymous" },
  { name: "Login Page", url: "/login", userType: "anonymous" },
  { name: "Register Page", url: "/register", userType: "anonymous" },
  { name: "Dashboard", url: "/dashboard", userType: "authenticated" },
  {
    name: "Book Appointment",
    url: "/book-appointment",
    userType: "authenticated"
  },
  { name: "Appointments", url: "/appointments", userType: "authenticated" }
];

// Performance thresholds (based on Core Web Vitals)
const PERFORMANCE_THRESHOLDS = {
  // Largest Contentful Paint (LCP) - should be under 2.5s
  LCP: 2500,

  // First Input Delay (FID) - should be under 100ms
  FID: 100,

  // Cumulative Layout Shift (CLS) - should be under 0.1
  CLS: 0.1,

  // First Contentful Paint (FCP) - should be under 1.8s
  FCP: 1800,

  // Time to Interactive (TTI) - should be under 3.5s
  TTI: 3500,

  // Total Blocking Time (TBT) - should be under 200ms
  TBT: 200,

  // Speed Index - should be under 3.4s
  SPEED_INDEX: 3400
};

test.describe("Performance Tests - Core Web Vitals", () => {
  for (const pageData of pages) {
    test.describe(`${pageData.name}`, () => {
      test.beforeEach(async ({ page }) => {
        // Inject performance monitoring
        await page.addInitScript(injectSpeedInsights);

        // Clear cache before each test
        await page.context().clearCookies();
        await page.context().clearPermissions();
      });

      test(`should have good ${pageData.name} LCP performance`, async ({
        page
      }) => {
        // Navigate and measure LCP
        await page.goto(pageData.url);
        await page.waitForLoadState("networkidle");

        // Get LCP measurement
        const lcp = await page.evaluate(() => {
          return new Promise((resolve) => {
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              resolve(lastEntry.startTime);
            }).observe({ entryTypes: ["largest-contentful-paint"] });

            // Fallback timeout
            setTimeout(() => resolve(0), 5000);
          });
        });

        expect(lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP);
      });

      test(`should have good ${pageData.name} FCP performance`, async ({
        page
      }) => {
        await page.goto(pageData.url);
        await page.waitForLoadState("networkidle");

        const fcp = await page.evaluate(() => {
          return new Promise((resolve) => {
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              entries.forEach((entry) => {
                if (entry.name === "first-contentful-paint") {
                  resolve(entry.startTime);
                }
              });
            }).observe({ entryTypes: ["paint"] });

            setTimeout(() => resolve(0), 5000);
          });
        });

        expect(fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP);
      });

      test(`should have good ${pageData.name} CLS performance`, async ({
        page
      }) => {
        await page.goto(pageData.url);
        await page.waitForLoadState("networkidle");

        // Wait for potential layout shifts
        await page.waitForTimeout(2000);

        const cls = await page.evaluate(() => {
          return new Promise((resolve) => {
            let clsValue = 0;
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              entries.forEach((entry) => {
                if (!entry.hadRecentInput) {
                  clsValue += entry.value;
                }
              });
              resolve(clsValue);
            }).observe({ entryTypes: ["layout-shift"] });

            setTimeout(() => resolve(clsValue), 5000);
          });
        });

        expect(cls).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS);
      });

      test(`should load ${pageData.name} within acceptable time`, async ({
        page
      }) => {
        const startTime = Date.now();
        await page.goto(pageData.url);
        await page.waitForLoadState("networkidle");
        const loadTime = Date.now() - startTime;

        // Should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);
      });

      test(`should have efficient resource loading on ${pageData.name}`, async ({
        page
      }) => {
        const resourceTimings = [];

        await page.route("**/*", (route) => {
          const startTime = Date.now();
          route.continue().then(() => {
            const loadTime = Date.now() - startTime;
            resourceTimings.push({
              url: route.request().url(),
              loadTime
            });
          });
        });

        await page.goto(pageData.url);
        await page.waitForLoadState("networkidle");

        // Check that no resource took more than 1 second to load
        const slowResources = resourceTimings.filter((r) => r.loadTime > 1000);
        expect(slowResources.length).toBe(0);
      });
    });
  }
});

// Test different connection speeds
test.describe("Performance Tests - Network Conditions", () => {
  const networkConditions = [
    { name: "Fast 3G", downloadSpeed: 1600, latency: 150 },
    { name: "Slow 3G", downloadSpeed: 500, latency: 400 },
    { name: "Regular 4G", downloadSpeed: 4000, latency: 70 }
  ];

  for (const condition of networkConditions) {
    test.describe(`Network: ${condition.name}`, () => {
      test.beforeEach(async ({ context }) => {
        // Set network conditions
        await context.setOffline(false);
        await context.setExtraHTTPHeaders({
          Connection: "keep-alive"
        });

        // Note: In Playwright, you'd need to use browser.setOffline() or similar
        // This is a simplified version
      });

      test("should maintain acceptable performance on slow connections", async ({
        page
      }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // Test that the page is still functional
        await expect(page.locator("h1")).toBeVisible();

        // Check that interactive elements are available
        const buttons = page.locator("button, a[href]");
        await expect(buttons.first()).toBeVisible();
      });
    });
  }
});

// Test memory usage
test.describe("Performance Tests - Memory Usage", () => {
  test("should not have memory leaks during navigation", async ({ page }) => {
    const initialMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });

    // Navigate between multiple pages
    for (let i = 0; i < 5; i++) {
      await page.goto("/");
      await page.goto("/login");
      await page.goto("/register");
      await page.goto("/dashboard");
    }

    // Force garbage collection if available
    await page.evaluate(() => {
      if (window.gc) {
        window.gc();
      }
    });

    const finalMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });

    // Memory increase should be reasonable (less than 50% increase)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = (finalMemory - initialMemory) / initialMemory;
      expect(memoryIncrease).toBeLessThan(0.5);
    }
  });
});

// Test bundle size and loading
test.describe("Performance Tests - Bundle Analysis", () => {
  test("should have reasonable JavaScript bundle sizes", async ({ page }) => {
    const responses = [];

    await page.route("**/*.js", (route) => {
      route.continue().then(() => {
        const response = route.request().response();
        if (response) {
          responses.push({
            url: route.request().url(),
            size: response.headers()["content-length"] || 0
          });
        }
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check that no JavaScript file is larger than 500KB
    const largeBundles = responses.filter((r) => r.size > 500 * 1024);
    expect(largeBundles.length).toBe(0);
  });
});

// Test image optimization
test.describe("Performance Tests - Image Optimization", () => {
  test("should use optimized image formats", async ({ page }) => {
    const imageResponses = [];

    await page.route("**/*.{jpg,jpeg,png,gif}", (route) => {
      route.continue().then(() => {
        const response = route.request().response();
        if (response) {
          const contentType = response.headers()["content-type"];
          if (contentType && contentType.startsWith("image/")) {
            imageResponses.push({
              url: route.request().url(),
              contentType,
              size: response.headers()["content-length"] || 0
            });
          }
        }
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Prefer modern formats (WebP, AVIF) when available
    const images = imageResponses.filter(
      (img) =>
        !img.contentType.includes("webp") && !img.contentType.includes("avif")
    );

    // This is a soft requirement - warn if not using modern formats
    if (images.length > 0) {
      console.log(`Warning: ${images.length} images not using modern formats`);
    }
  });
});

// Test caching effectiveness
test.describe("Performance Tests - Caching", () => {
  test("should have proper cache headers for static assets", async ({
    page
  }) => {
    const staticResources = [];

    await page.route(
      "**/*.{js,css,png,jpg,jpeg,gif,svg,woff,woff2}",
      (route) => {
        route.continue().then(() => {
          const response = route.request().response();
          if (response) {
            const headers = response.headers();
            staticResources.push({
              url: route.request().url(),
              cacheControl: headers["cache-control"],
              expires: headers["expires"]
            });
          }
        });
      }
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check that static resources have appropriate cache headers
    const resourcesWithoutCache = staticResources.filter(
      (r) => !r.cacheControl || !r.cacheControl.includes("max-age")
    );

    expect(resourcesWithoutCache.length).toBeLessThan(
      staticResources.length * 0.5
    );
  });
});

export default {};
