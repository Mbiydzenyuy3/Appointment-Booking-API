import React, { createContext, useState, useEffect } from "react";

const TutorialContext = createContext();

export const TutorialProvider = ({ children }) => {
  const [activeTutorial, setActiveTutorial] = useState(null);
  const [showTutorialCatalog, setShowTutorialCatalog] = useState(false);
  const [completedTutorials, setCompletedTutorials] = useState([]);
  const [tutorialProgress, setTutorialProgress] = useState({});
  const [showContextualHelp, setShowContextualHelp] = useState(false);
  const [helpContent, setHelpContent] = useState(null);

  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem("tutorial-progress");
    if (savedProgress) {
      setTutorialProgress(JSON.parse(savedProgress));
    }

    const savedCompleted = localStorage.getItem("completed-tutorials");
    if (savedCompleted) {
      setCompletedTutorials(JSON.parse(savedCompleted));
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("tutorial-progress", JSON.stringify(tutorialProgress));
  }, [tutorialProgress]);

  useEffect(() => {
    localStorage.setItem(
      "completed-tutorials",
      JSON.stringify(completedTutorials)
    );
  }, [completedTutorials]);

  const startTutorial = (tutorial) => {
    setActiveTutorial(tutorial);
    setShowTutorialCatalog(false);

    // Track tutorial start
    trackTutorialEvent("tutorial_started", {
      tutorialId: tutorial.id,
      tutorialTitle: tutorial.title
    });
  };

  const completeTutorial = (tutorialId) => {
    if (!completedTutorials.includes(tutorialId)) {
      setCompletedTutorials((prev) => [...prev, tutorialId]);
    }

    // Update progress
    setTutorialProgress((prev) => ({
      ...prev,
      [tutorialId]: {
        ...prev[tutorialId],
        completed: true,
        completedAt: new Date().toISOString(),
        progress: 100
      }
    }));

    // Track tutorial completion
    trackTutorialEvent("tutorial_completed", { tutorialId });
  };

  const updateTutorialProgress = (tutorialId, progress, currentTime = null) => {
    setTutorialProgress((prev) => ({
      ...prev,
      [tutorialId]: {
        ...prev[tutorialId],
        progress,
        currentTime,
        lastWatched: new Date().toISOString()
      }
    }));
  };

  const showHelp = (content) => {
    setHelpContent(content);
    setShowContextualHelp(true);
  };

  const hideHelp = () => {
    setShowContextualHelp(false);
    setHelpContent(null);
  };

  const getTutorialProgress = (tutorialId) => {
    return tutorialProgress[tutorialId] || { progress: 0, completed: false };
  };

  const isTutorialCompleted = (tutorialId) => {
    return completedTutorials.includes(tutorialId);
  };

  const getCompletionRate = () => {
    // This would ideally come from a total count of available tutorials
    const totalTutorials = 10; // Estimated total
    return Math.round((completedTutorials.length / totalTutorials) * 100);
  };

  const trackTutorialEvent = (event, data) => {
    // Analytics tracking for tutorial usage
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", event, {
        event_category: "tutorial",
        event_label: data.tutorialId || data.tutorialTitle,
        value: 1
      });
    }
  };

  const resetTutorialProgress = () => {
    setCompletedTutorials([]);
    setTutorialProgress({});
    localStorage.removeItem("tutorial-progress");
    localStorage.removeItem("completed-tutorials");
  };

  const value = {
    // State
    activeTutorial,
    showTutorialCatalog,
    completedTutorials,
    tutorialProgress,
    showContextualHelp,
    helpContent,

    // Actions
    startTutorial,
    completeTutorial,
    updateTutorialProgress,
    showHelp,
    hideHelp,
    setShowTutorialCatalog,

    // Getters
    getTutorialProgress,
    isTutorialCompleted,
    getCompletionRate,
    resetTutorialProgress,
    trackTutorialEvent
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

// Export the context for use in hooks
export { TutorialContext };
