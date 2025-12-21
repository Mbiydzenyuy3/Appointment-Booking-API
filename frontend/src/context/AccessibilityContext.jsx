import React, { createContext, useState, useEffect } from "react";

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    fontSize: "medium",
    highContrast: false,
    highContrastMode: "normal",
    reducedMotion: false,
    screenReaderMode: false,
    keyboardNavigation: true,
    focusIndicators: true,
    seniorMode: false,
    simplifiedNavigation: false,
    largerTouchTargets: false,
    voiceNavigation: false,
    showLabels: true,
    highVisibility: false,
    slowAnimations: false
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("accessibility-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Detect system preferences
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleReducedMotion = (e) => {
      setSettings((prev) => ({
        ...prev,
        reducedMotion: e.matches
      }));
    };

    mediaQuery.addListener(handleReducedMotion);
    return () => mediaQuery.removeListener(handleReducedMotion);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));

    // Apply settings to document
    const root = document.documentElement;

    // Enhanced font size system for seniors
    const fontSizes = {
      "extra-small": "12px",
      small: "14px",
      medium: "16px",
      large: "20px",
      "extra-large": "24px",
      senior: "28px"
    };
    root.style.fontSize = fontSizes[settings.fontSize];

    // Enhanced high contrast modes
    if (settings.highContrast) {
      root.classList.add("high-contrast");
      if (settings.highContrastMode === "enhanced") {
        root.classList.add("high-contrast-enhanced");
      } else if (settings.highContrastMode === "maximum") {
        root.classList.add("high-contrast-maximum");
      }
    } else {
      root.classList.remove("high-contrast");
      root.classList.remove("high-contrast-enhanced");
      root.classList.remove("high-contrast-maximum");
    }

    // Senior mode enhancements
    if (settings.seniorMode) {
      root.classList.add("senior-mode");
    } else {
      root.classList.remove("senior-mode");
    }

    // Simplified navigation
    if (settings.simplifiedNavigation) {
      root.classList.add("simplified-navigation");
    } else {
      root.classList.remove("simplified-navigation");
    }

    // Larger touch targets
    if (settings.largerTouchTargets) {
      root.classList.add("large-touch-targets");
    } else {
      root.classList.remove("large-touch-targets");
    }

    // High visibility mode
    if (settings.highVisibility) {
      root.classList.add("high-visibility");
    } else {
      root.classList.remove("high-visibility");
    }

    // Slow animations for seniors
    if (settings.slowAnimations) {
      root.classList.add("slow-animations");
    } else {
      root.classList.remove("slow-animations");
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    // Focus indicators
    if (settings.focusIndicators) {
      root.classList.add("show-focus");
    } else {
      root.classList.remove("show-focus");
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      // Enhanced font size options for seniors
      fontSize: "medium", // extra-small, small, medium, large, extra-large, senior
      // Enhanced high contrast options
      highContrast: false,
      highContrastMode: "normal", // normal, enhanced, maximum
      // Motion and animation preferences
      reducedMotion: false,
      // Screen reader and assistive technology
      screenReaderMode: false,
      keyboardNavigation: true,
      focusIndicators: true,
      // Senior-specific preferences
      seniorMode: false,
      simplifiedNavigation: false,
      largerTouchTargets: false,
      voiceNavigation: false,
      // UI enhancement preferences
      showLabels: true,
      highVisibility: false,
      slowAnimations: false
    };
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export { AccessibilityContext };
