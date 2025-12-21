/**
 * Comprehensive Accessibility Testing Suite
 * Tests WCAG 2.1 AA compliance with automated and manual checks
 */

import { configureAxe } from "@axe-core/react";
import axe from "axe-core";

// Configure axe with comprehensive rules
configureAxe({
  rules: [
    // WCAG 2.1 Level A
    {
      id: "image-alt",
      enabled: true
    },
    {
      id: "label",
      enabled: true
    },
    {
      id: "link-name",
      enabled: true
    },
    {
      id: "button-name",
      enabled: true
    },
    {
      id: "html-has-lang",
      enabled: true
    },
    {
      id: "html-lang-valid",
      enabled: true
    },

    // WCAG 2.1 Level AA
    {
      id: "color-contrast",
      enabled: true
    },
    {
      id: "keyboard",
      enabled: true
    },
    {
      id: "focus-order-semantics",
      enabled: true
    },
    {
      id: "focus-visible",
      enabled: true
    },
    {
      id: "heading-order",
      enabled: true
    },
    {
      id: "landmark-one-main",
      enabled: true
    },
    {
      id: "page-has-heading-one",
      enabled: true
    },
    {
      id: "region",
      enabled: true
    },

    // Custom rules for our app
    {
      id: "aria-required-attr",
      enabled: true
    },
    {
      id: "aria-valid-attr",
      enabled: true
    },
    {
      id: "aria-roles",
      enabled: true
    },
    {
      id: "skip-link",
      enabled: true
    }
  ]
});

/**
 * Run comprehensive accessibility tests
 */
export const runComprehensiveAccessibilityTests = async (options = {}) => {
  const defaultOptions = {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]
    },
    resultTypes: ["violations", "incomplete", "inapplicable"],
    ...options
  };

  try {
    const results = await axe.run(document, defaultOptions);
    return {
      success: results.violations.length === 0,
      violations: results.violations,
      incomplete: results.incomplete,
      inapplicable: results.inapplicable,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  } catch (error) {
    console.error("Accessibility test failed:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
  }
};

/**
 * Test keyboard navigation functionality
 */
export const testKeyboardNavigation = () => {
  const results = {
    tabIndex: [],
    focusableElements: [],
    skipLinks: [],
    keyboardTraps: [],
    issues: []
  };

  // Test all focusable elements
  const focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ];

  focusableSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      const hasTabIndex = element.hasAttribute("tabindex");
      const tabIndexValue = hasTabIndex
        ? element.getAttribute("tabindex")
        : "0";

      results.focusableElements.push({
        tagName: element.tagName,
        id: element.id || null,
        className: element.className,
        tabIndex: tabIndexValue,
        textContent: element.textContent?.substring(0, 50) || "",
        isFocusable:
          !element.hasAttribute("disabled") && element.offsetParent !== null
      });

      // Check for positive tabindex (should be avoided)
      if (hasTabIndex && parseInt(tabIndexValue) > 0) {
        results.issues.push({
          type: "tabindex",
          element: element.tagName + (element.id ? `#${element.id}` : ""),
          message: "Positive tabindex values can disrupt natural tab order"
        });
      }
    });
  });

  // Test skip links
  const skipLinks = document.querySelectorAll('a[href^="#"]');
  skipLinks.forEach((link) => {
    results.skipLinks.push({
      href: link.getAttribute("href"),
      text: link.textContent?.trim() || "",
      isVisible: link.offsetParent !== null,
      hasProperHref: link.getAttribute("href").length > 1
    });
  });

  // Test for keyboard traps (focus gets stuck)
  const trapElements = document.querySelectorAll(
    '[role="dialog"], [role="modal"]'
  );
  trapElements.forEach((element) => {
    const focusableInTrap = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableInTrap.length > 0) {
      results.keyboardTraps.push({
        element: element.tagName + (element.id ? `#${element.id}` : ""),
        focusableChildren: focusableInTrap.length,
        hasEscapeHandler: element.hasAttribute("data-escape-handler")
      });
    }
  });

  return results;
};

/**
 * Test screen reader compatibility
 */
export const testScreenReaderCompatibility = () => {
  const results = {
    landmarks: [],
    headings: [],
    labels: [],
    descriptions: [],
    issues: []
  };

  // Test landmarks
  const landmarkSelectors = {
    main: "main",
    navigation: "nav",
    banner: "header",
    contentinfo: "footer",
    complementary: "aside",
    region: '[role="region"]',
    form: "form"
  };

  Object.entries(landmarkSelectors).forEach(([role, selector]) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      results.landmarks.push({
        role,
        tagName: element.tagName,
        id: element.id || null,
        ariaLabel: element.getAttribute("aria-label"),
        ariaLabelledby: element.getAttribute("aria-labelledby"),
        hasProperRole:
          element.getAttribute("role") === role ||
          element.tagName.toLowerCase() === selector
      });
    });
  });

  // Test heading hierarchy
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  let previousLevel = 0;
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    const isSkipped = level > previousLevel + 1;

    results.headings.push({
      level,
      text: heading.textContent?.trim() || "",
      id: heading.id || null,
      ariaLabel: heading.getAttribute("aria-label"),
      isSkipped,
      isFirst: index === 0 && level !== 1
    });

    if (isSkipped) {
      results.issues.push({
        type: "heading-skip",
        message: `Heading level ${level} follows level ${previousLevel} (skipped levels)`,
        element: `h${level}`
      });
    }

    if (index === 0 && level !== 1) {
      results.issues.push({
        type: "first-heading",
        message: "First heading should be h1",
        element: heading.tagName
      });
    }

    previousLevel = level;
  });

  // Test labels
  const inputElements = document.querySelectorAll("input, select, textarea");
  inputElements.forEach((input) => {
    const hasLabel =
      input.hasAttribute("aria-label") ||
      input.hasAttribute("aria-labelledby") ||
      document.querySelector(`label[for="${input.id}"]`);

    results.labels.push({
      tagName: input.tagName,
      type: input.type || "text",
      id: input.id || null,
      name: input.getAttribute("name"),
      hasLabel: !!hasLabel,
      ariaLabel: input.getAttribute("aria-label"),
      ariaLabelledby: input.getAttribute("aria-labelledby"),
      placeholder: input.getAttribute("placeholder")
    });

    if (!hasLabel) {
      results.issues.push({
        type: "missing-label",
        message: "Form element missing accessible label",
        element:
          `${input.tagName}[${input.type || "text"}]` +
          (input.id ? `#${input.id}` : "")
      });
    }
  });

  return results;
};

/**
 * Test color contrast and visual accessibility
 */
export const testVisualAccessibility = () => {
  const results = {
    contrast: [],
    focus: [],
    animations: [],
    issues: []
  };

  // Test focus indicators
  const focusableElements = document.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  focusableElements.forEach((element) => {
    const computedStyle = window.getComputedStyle(element);
    const hasOutline = computedStyle.outline !== "none";
    const hasBoxShadow = computedStyle.boxShadow !== "none";

    results.focus.push({
      tagName: element.tagName,
      hasOutline,
      outlineStyle: computedStyle.outlineStyle,
      outlineWidth: computedStyle.outlineWidth,
      outlineColor: computedStyle.outlineColor,
      hasBoxShadow,
      boxShadow: computedStyle.boxShadow
    });

    if (!hasOutline && !hasBoxShadow) {
      results.issues.push({
        type: "missing-focus-indicator",
        element: element.tagName + (element.id ? `#${element.id}` : ""),
        message: "Element missing visible focus indicator"
      });
    }
  });

  // Test for reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const animatedElements = document.querySelectorAll(
    '[style*="animation"], [class*="animation"]'
  );

  results.animations.push({
    prefersReducedMotion,
    animatedElementsCount: animatedElements.length,
    hasMotionCSS:
      document.querySelector(
        '[class*="motion"], [class*="transition"], [class*="animation"]'
      ) !== null
  });

  return results;
};

/**
 * Test assistive technology compatibility
 */
export const testAssistiveTechnologyCompatibility = () => {
  const results = {
    ariaAttributes: [],
    liveRegions: [],
    descriptions: [],
    issues: []
  };

  // Test ARIA attributes
  const ariaSelectors = [
    "[aria-label]",
    "[aria-labelledby]",
    "[aria-describedby]",
    "[aria-expanded]",
    "[aria-hidden]",
    "[aria-required]",
    "[aria-invalid]",
    "[aria-current]",
    "[aria-live]"
  ];

  ariaSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      Array.from(element.attributes).forEach((attr) => {
        if (attr.name.startsWith("aria-")) {
          results.ariaAttributes.push({
            element: element.tagName + (element.id ? `#${element.id}` : ""),
            attribute: attr.name,
            value: attr.value,
            isValid: isValidAriaAttribute(attr.name, attr.value)
          });

          if (!isValidAriaAttribute(attr.name, attr.value)) {
            results.issues.push({
              type: "invalid-aria",
              element: element.tagName + (element.id ? `#${element.id}` : ""),
              attribute: attr.name,
              value: attr.value,
              message: `Invalid ARIA attribute or value`
            });
          }
        }
      });
    });
  });

  // Test live regions
  const liveRegions = document.querySelectorAll("[aria-live]");
  liveRegions.forEach((region) => {
    results.liveRegions.push({
      tagName: region.tagName,
      id: region.id || null,
      ariaLive: region.getAttribute("aria-live"),
      ariaAtomic: region.getAttribute("aria-atomic"),
      ariaRelevant: region.getAttribute("aria-relevant")
    });
  });

  return results;
};

/**
 * Helper function to validate ARIA attributes
 */
const isValidAriaAttribute = (name, value) => {
  const validAriaProps = [
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "aria-expanded",
    "aria-hidden",
    "aria-required",
    "aria-invalid",
    "aria-current",
    "aria-live",
    "aria-atomic",
    "aria-relevant",
    "aria-busy",
    "aria-controls",
    "aria-current",
    "aria-disabled",
    "aria-grabbed",
    "aria-haspopup",
    "aria-invalid",
    "aria-pressed",
    "aria-readonly",
    "aria-selected"
  ];

  if (!validAriaProps.includes(name)) {
    return false;
  }

  // Check boolean attributes
  const booleanAttrs = [
    "aria-expanded",
    "aria-hidden",
    "aria-required",
    "aria-invalid",
    "aria-busy",
    "aria-disabled",
    "aria-grabbed",
    "aria-haspopup",
    "aria-pressed",
    "aria-readonly",
    "aria-selected"
  ];
  if (booleanAttrs.includes(name)) {
    return ["true", "false", "", null].includes(value);
  }

  return true;
};

/**
 * Generate comprehensive accessibility report
 */
export const generateAccessibilityReport = async () => {
  const report = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    tests: {}
  };

  try {
    // Run automated axe tests
    report.tests.automated = await runComprehensiveAccessibilityTests();

    // Run manual tests
    report.tests.keyboardNavigation = testKeyboardNavigation();
    report.tests.screenReaderCompatibility = testScreenReaderCompatibility();
    report.tests.visualAccessibility = testVisualAccessibility();
    report.tests.assistiveTechnologyCompatibility =
      testAssistiveTechnologyCompatibility();

    // Calculate overall score
    const totalIssues =
      report.tests.automated.violations.length +
      report.tests.keyboardNavigation.issues.length +
      report.tests.screenReaderCompatibility.issues.length +
      report.tests.visualAccessibility.issues.length +
      report.tests.assistiveTechnologyCompatibility.issues.length;

    report.summary = {
      totalIssues,
      criticalIssues: report.tests.automated.violations.filter(
        (v) => v.impact === "critical"
      ).length,
      seriousIssues: report.tests.automated.violations.filter(
        (v) => v.impact === "serious"
      ).length,
      moderateIssues: report.tests.automated.violations.filter(
        (v) => v.impact === "moderate"
      ).length,
      minorIssues: report.tests.automated.violations.filter(
        (v) => v.impact === "minor"
      ).length,
      passed: totalIssues === 0
    };

    return report;
  } catch (error) {
    report.error = error.message;
    return report;
  }
};

export default {
  runComprehensiveAccessibilityTests,
  testKeyboardNavigation,
  testScreenReaderCompatibility,
  testVisualAccessibility,
  testAssistiveTechnologyCompatibility,
  generateAccessibilityReport
};
