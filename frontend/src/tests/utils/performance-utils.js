/**
 * Performance Testing Utilities
 * Helper functions for performance measurements and monitoring
 */

export const injectSpeedInsights = () => {
  // Inject performance monitoring script
  const script = document.createElement("script");
  script.innerHTML = `
    // Performance observer for Core Web Vitals
    function measurePerformance() {
      // Measure LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Measure FID
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });

      // Measure CLS
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });

      // Measure FCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            console.log('FCP:', entry.startTime);
          }
        });
      }).observe({ entryTypes: ['paint'] });
    }

    // Run performance measurement
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', measurePerformance);
    } else {
      measurePerformance();
    }
  `;
  document.head.appendChild(script);
};

export const measurePageLoad = async (page) => {
  const startTime = Date.now();

  // Start measuring navigation timing
  await page.evaluate(() => {
    performance.mark("navigation-start");
  });

  await page.goto(page.url());
  await page.waitForLoadState("networkidle");

  const endTime = Date.now();
  const loadTime = endTime - startTime;

  // Get detailed timing metrics
  const timingMetrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      connect: navigation.connectEnd - navigation.connectStart,
      ssl: navigation.connectEnd - navigation.secureConnectionStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      download: navigation.responseEnd - navigation.responseStart,
      dom:
        navigation.domContentLoadedEventEnd -
        navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.navigationStart
    };
  });

  return {
    loadTime,
    timingMetrics
  };
};

export const measureResourceLoading = async (page) => {
  const resources = await page.evaluate(() => {
    const resourceEntries = performance.getEntriesByType("resource");
    return resourceEntries.map((entry) => ({
      name: entry.name,
      type: entry.initiatorType,
      size: entry.transferSize || 0,
      duration: entry.duration,
      startTime: entry.startTime
    }));
  });

  return resources;
};

export const checkBundleSize = async (page) => {
  const jsResources = await page.evaluate(() => {
    const resourceEntries = performance.getEntriesByType("resource");
    return resourceEntries
      .filter((entry) => entry.initiatorType === "script")
      .map((entry) => ({
        url: entry.name,
        size: entry.transferSize || 0,
        duration: entry.duration
      }));
  });

  const totalSize = jsResources.reduce(
    (sum, resource) => sum + resource.size,
    0
  );
  const averageDuration =
    jsResources.reduce((sum, resource) => sum + resource.duration, 0) /
    jsResources.length;

  return {
    resources: jsResources,
    totalSize,
    averageDuration,
    resourceCount: jsResources.length
  };
};

export const measureMemoryUsage = async (page) => {
  const memoryInfo = await page.evaluate(() => {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  });

  return memoryInfo;
};

export const simulateSlowNetwork = async (
  context,
  downloadSpeed = 500,
  latency = 400
) => {
  // Note: This would require Playwright's browser-level network simulation
  // This is a placeholder for the functionality
  console.log(
    `Simulating slow network: ${downloadSpeed} kbps download, ${latency}ms latency`
  );
};

export const generatePerformanceReport = async (page) => {
  const loadMetrics = await measurePageLoad(page);
  const resourceMetrics = await measureResourceLoading(page);
  const bundleMetrics = await checkBundleSize(page);
  const memoryMetrics = await measureMemoryUsage(page);

  return {
    timestamp: new Date().toISOString(),
    url: page.url(),
    loadMetrics,
    resourceMetrics,
    bundleMetrics,
    memoryMetrics,
    recommendations: generateRecommendations(loadMetrics, bundleMetrics)
  };
};

const generateRecommendations = (loadMetrics, bundleMetrics) => {
  const recommendations = [];

  if (loadMetrics.loadTime > 3000) {
    recommendations.push({
      type: "performance",
      priority: "high",
      message: "Page load time exceeds 3 seconds",
      suggestion: "Optimize critical rendering path and reduce bundle size"
    });
  }

  if (bundleMetrics.totalSize > 1024 * 1024) {
    recommendations.push({
      type: "bundle-size",
      priority: "medium",
      message: "JavaScript bundle size exceeds 1MB",
      suggestion: "Implement code splitting and tree shaking"
    });
  }

  if (bundleMetrics.resourceCount > 20) {
    recommendations.push({
      type: "bundles",
      priority: "medium",
      message: "High number of JavaScript bundles",
      suggestion: "Consider bundling similar resources together"
    });
  }

  return recommendations;
};

export default {
  injectSpeedInsights,
  measurePageLoad,
  measureResourceLoading,
  checkBundleSize,
  measureMemoryUsage,
  simulateSlowNetwork,
  generatePerformanceReport
};
