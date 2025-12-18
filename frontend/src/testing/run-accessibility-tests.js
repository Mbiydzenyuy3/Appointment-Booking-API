#!/usr/bin/env node

/**
 * Accessibility Test Runner
 * Runs comprehensive accessibility tests and generates reports
 */

import { chromium, firefox, webkit } from "playwright";
import { generateAccessibilityReport } from "./comprehensive-accessibility-suite.js";
import process from "node:process";

// Test configuration
const CONFIG = {
  baseURL: "http://localhost:5173",
  headless: true,
  timeout: 30000,
  browsers: ["chromium", "firefox", "webkit"],
  pages: [
    { name: "Landing Page", path: "/" },
    { name: "Login Page", path: "/login" },
    { name: "Register Page", path: "/register" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Book Appointment", path: "/book-appointment" },
    { name: "Appointments", path: "/appointments" }
  ]
};

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function testPage(browserType, pageInfo) {
  const browser = await browserType.launch({ headless: CONFIG.headless });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    logInfo(`Testing ${pageInfo.name} on ${browserType.name()}`);

    // Navigate to page
    await page.goto(`${CONFIG.baseURL}${pageInfo.path}`, {
      timeout: CONFIG.timeout,
      waitUntil: "networkidle"
    });

    // Wait for page to be fully loaded
    await page.waitForTimeout(2000);

    // Generate accessibility report
    const report = await generateAccessibilityReport();

    // Analyze results
    const criticalIssues = report.tests.automated.violations.filter(
      (v) => v.impact === "critical"
    ).length;

    const seriousIssues = report.tests.automated.violations.filter(
      (v) => v.impact === "serious"
    ).length;

    const moderateIssues = report.tests.automated.violations.filter(
      (v) => v.impact === "moderate"
    ).length;

    const minorIssues = report.tests.automated.violations.filter(
      (v) => v.impact === "minor"
    ).length;

    const totalIssues =
      criticalIssues + seriousIssues + moderateIssues + minorIssues;

    if (totalIssues === 0) {
      logSuccess(`${pageInfo.name}: No accessibility issues found`);
    } else {
      logWarning(`${pageInfo.name}: ${totalIssues} accessibility issues found`);
      log(
        `  Critical: ${criticalIssues}, Serious: ${seriousIssues}, Moderate: ${moderateIssues}, Minor: ${minorIssues}`,
        colors.yellow
      );
    }

    // Log specific violations
    if (report.tests.automated.violations.length > 0) {
      report.tests.automated.violations.forEach((violation) => {
        log(`  - ${violation.id}: ${violation.description}`, colors.red);
        log(`    Impact: ${violation.impact}`, colors.yellow);
        log(`    Help: ${violation.help}`, colors.cyan);
      });
    }

    await browser.close();

    return {
      page: pageInfo.name,
      browser: browserType.name(),
      totalIssues,
      criticalIssues,
      seriousIssues,
      moderateIssues,
      minorIssues,
      violations: report.tests.automated.violations,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logError(
      `Error testing ${pageInfo.name} on ${browserType.name()}: ${
        error.message
      }`
    );
    await browser.close();
    return {
      page: pageInfo.name,
      browser: browserType.name(),
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function runAccessibilityTests() {
  log(
    "🧪 Starting Comprehensive Accessibility Testing",
    colors.bright + colors.magenta
  );
  log("=".repeat(60), colors.magenta);

  const results = [];
  let totalCriticalIssues = 0;
  let totalTests = 0;
  let passedTests = 0;

  // Test each browser
  const browsers = {
    chromium,
    firefox,
    webkit
  };

  for (const [browserName, browserType] of Object.entries(browsers)) {
    log(
      `\n🌐 Testing ${browserName.toUpperCase()}`,
      colors.bright + colors.blue
    );
    log("-".repeat(40), colors.blue);

    for (const pageInfo of CONFIG.pages) {
      const result = await testPage(browserType, pageInfo);
      results.push(result);
      totalTests++;

      if (result.error) {
        logError(`Test failed: ${result.error}`);
      } else if (result.criticalIssues === 0) {
        passedTests++;
      }

      if (result.criticalIssues) {
        totalCriticalIssues += result.criticalIssues;
      }
    }
  }

  // Generate summary report
  log("\n📊 ACCESSIBILITY TEST SUMMARY", colors.bright + colors.green);
  log("=".repeat(60), colors.green);

  log(`Total Tests Run: ${totalTests}`, colors.cyan);
  log(`Tests Passed: ${passedTests}`, colors.green);
  log(`Tests Failed: ${totalTests - passedTests}`, colors.red);
  log(`Total Critical Issues: ${totalCriticalIssues}`, colors.red);

  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  log(`Pass Rate: ${passRate}%`, passRate >= 90 ? colors.green : colors.yellow);

  // Save detailed report
  const report = {
    summary: {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      passRate: `${passRate}%`,
      totalCriticalIssues,
      timestamp: new Date().toISOString(),
      config: CONFIG
    },
    results,
    recommendations: generateRecommendations(results)
  };

  // Write report to file
  const fs = await import("fs");
  fs.writeFileSync(
    "accessibility-report.json",
    JSON.stringify(report, null, 2)
  );

  log(`\n📄 Detailed report saved to: accessibility-report.json`, colors.cyan);

  // Exit with appropriate code
  if (totalCriticalIssues > 0) {
    logError(
      `\n❌ FAILED: ${totalCriticalIssues} critical accessibility issues found`
    );
    process.exit(1);
  } else if (passedTests < totalTests) {
    logWarning(`\n⚠️  PARTIAL: Some tests failed but no critical issues`);
    process.exit(1);
  } else {
    logSuccess(`\n✅ SUCCESS: All accessibility tests passed!`);
    process.exit(0);
  }
}

function generateRecommendations(results) {
  const recommendations = [];
  const violationCounts = {};

  // Analyze common violations
  results.forEach((result) => {
    if (result.violations) {
      result.violations.forEach((violation) => {
        violationCounts[violation.id] =
          (violationCounts[violation.id] || 0) + 1;
      });
    }
  });

  // Generate recommendations based on common issues
  Object.entries(violationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .forEach(([violationId, count]) => {
      recommendations.push({
        violation: violationId,
        frequency: count,
        priority: getViolationPriority(violationId),
        description: getViolationDescription(violationId)
      });
    });

  return recommendations;
}

function getViolationPriority(violationId) {
  const highPriority = ["color-contrast", "keyboard", "image-alt"];
  const mediumPriority = ["heading-order", "label", "landmark-one-main"];

  if (highPriority.includes(violationId)) return "high";
  if (mediumPriority.includes(violationId)) return "medium";
  return "low";
}

function getViolationDescription(violationId) {
  const descriptions = {
    "color-contrast": "Improve color contrast ratios for better readability",
    keyboard: "Ensure all interactive elements are keyboard accessible",
    "image-alt": "Add alternative text to all images",
    "heading-order":
      "Fix heading hierarchy for better screen reader navigation",
    label: "Add proper labels to form controls",
    "landmark-one-main": "Ensure page has exactly one main landmark"
  };

  return descriptions[violationId] || "Review and fix this accessibility issue";
}

// CLI argument parsing
const args = process.argv.slice(2);
const options = {
  headless: !args.includes("--no-headless"),
  verbose: args.includes("--verbose"),
  browser: args.find((arg) => arg.startsWith("--browser="))?.split("=")[1],
  page: args.find((arg) => arg.startsWith("--page="))?.split("=")[1]
};

if (options.browser) {
  CONFIG.browsers = [options.browser];
}

if (options.page) {
  CONFIG.pages = CONFIG.pages.filter((page) =>
    page.name.toLowerCase().includes(options.page.toLowerCase())
  );
}

CONFIG.headless = options.headless;

// Run tests
runAccessibilityTests().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
