import { useContext } from "react";
import { TutorialContext } from "../context/TutorialContext";

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
};

// Hook for showing contextual help
export const useContextualHelp = () => {
  const { showHelp, hideHelp } = useTutorial();

  const showBookingHelp = () => {
    showHelp({
      type: "booking",
      title: "Need Help with Booking?",
      content: "Learn how to book appointments quickly and easily.",
      actions: [
        {
          label: "Watch Tutorial",
          action: "start_tutorial",
          tutorialId: "first-appointment"
        },
        {
          label: "View All Tutorials",
          action: "show_catalog"
        }
      ]
    });
  };

  const showAccountHelp = () => {
    showHelp({
      type: "account",
      title: "Account Help",
      content: "Get help with managing your account and preferences.",
      actions: [
        {
          label: "Account Setup Tutorial",
          action: "start_tutorial",
          tutorialId: "creating-account"
        },
        {
          label: "Contact Support",
          action: "contact_support"
        }
      ]
    });
  };

  const showAccessibilityHelp = () => {
    showHelp({
      type: "accessibility",
      title: "Accessibility Features",
      content: "Discover all the accessibility and senior-friendly features.",
      actions: [
        {
          label: "Senior Features Tutorial",
          action: "start_tutorial",
          tutorialId: "senior-friendly-features"
        },
        {
          label: "Open Accessibility Panel",
          action: "open_accessibility"
        }
      ]
    });
  };

  return {
    showBookingHelp,
    showAccountHelp,
    showAccessibilityHelp,
    hideHelp
  };
};
