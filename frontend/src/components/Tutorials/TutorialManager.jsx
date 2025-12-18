// src/components/Tutorials/TutorialManager.jsx
import React from "react";
import { useTutorial } from "../../hooks/useTutorial";
import VideoTutorial from "./VideoTutorial";
import TutorialCatalog from "./TutorialCatalog";
import ContextualHelp from "./ContextualHelp";

const TutorialManager = () => {
  const {
    activeTutorial,
    showTutorialCatalog,
    showContextualHelp,
    setShowTutorialCatalog,
    startTutorial,
    completeTutorial,
    hideHelp
  } = useTutorial();

  const handleSelectTutorial = (tutorial) => {
    startTutorial(tutorial);
  };

  const handleCloseCatalog = () => {
    setShowTutorialCatalog(false);
  };

  const handleCloseTutorial = () => {
    // The tutorial will be closed by the VideoTutorial component
  };

  const handleTutorialComplete = (tutorialId) => {
    completeTutorial(tutorialId);
  };

  return (
    <>
      {/* Video Tutorial Modal */}
      <VideoTutorial
        isOpen={!!activeTutorial}
        onClose={handleCloseTutorial}
        tutorial={activeTutorial}
        onComplete={handleTutorialComplete}
        autoPlay={true}
      />

      {/* Tutorial Catalog Modal */}
      <TutorialCatalog
        isOpen={showTutorialCatalog}
        onClose={handleCloseCatalog}
        onSelectTutorial={handleSelectTutorial}
      />

      {/* Contextual Help */}
      <ContextualHelp
        isOpen={showContextualHelp}
        onClose={hideHelp}
        position='bottom'
      />
    </>
  );
};

export default TutorialManager;
