// Accessibility Testing Script
import { configureAxe } from "@axe-core/react";
import axe from "axe-core";

// Configure axe
configureAxe({
  rules: [
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
    }
  ]
});

export const runAccessibilityTests = async () => {
  try {
    const results = await axe.run();
    return results;
  } catch (error) {
    console.error("Accessibility test failed:", error);
    return null;
  }
};

export const checkHeadingHierarchy = () => {
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  const headingStructure = [];

  headings.forEach((heading) => {
    headingStructure.push({
      level: parseInt(heading.tagName.charAt(1)),
      text: heading.textContent.trim(),
      id: heading.id || null,
      className: heading.className
    });
  });

  return headingStructure;
};

export const checkLandmarks = () => {
  const landmarks = {
    main: document.querySelector("main"),
    nav: document.querySelector("nav"),
    header: document.querySelector("header"),
    footer: document.querySelector("footer"),
    aside: document.querySelector("aside")
  };

  return Object.entries(landmarks).map(([role, element]) => ({
    role,
    present: !!element,
    id: element?.id || null
  }));
};

export const checkSkipLinks = () => {
  const skipLinks = document.querySelectorAll('a[href^="#"]');
  return Array.from(skipLinks).map((link) => ({
    href: link.getAttribute("href"),
    text: link.textContent.trim(),
    visible: link.offsetParent !== null
  }));
};
