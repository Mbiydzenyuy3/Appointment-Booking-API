import React, { useEffect, useRef, useCallback } from "react";
import { X, Play, Book, MessageCircle, Settings } from "lucide-react";
import { useTutorial } from "../../hooks/useTutorial";
import { useAccessibility } from "../../hooks/useAccessibility";

const ContextualHelp = ({ isOpen, onClose, position = "bottom" }) => {
  const { helpContent, hideHelp, startTutorial, setShowTutorialCatalog } =
    useTutorial();
  const { settings } = useAccessibility();
  const helpRef = useRef(null);

  // Use onClose if provided, otherwise fall back to hideHelp
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      hideHelp();
    }
  }, [onClose, hideHelp]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, handleClose]);

  const handleAction = (action) => {
    switch (action.action) {
      case "start_tutorial":
        // This would need to be implemented to find the tutorial by ID
        startTutorial({ id: action.tutorialId, title: action.label });
        break;
      case "show_catalog":
        setShowTutorialCatalog(true);
        break;
      case "contact_support":
        // Open support chat or contact form
        window.open("/support", "_blank");
        break;
      case "open_accessibility":
        // Open accessibility panel
        {
          const event = new CustomEvent("openAccessibilityPanel");
          window.dispatchEvent(event);
        }
        break;
      default:
        break;
    }
    handleClose();
  };

  const getActionIcon = (action) => {
    switch (action.action) {
      case "start_tutorial":
        return <Play className='w-4 h-4' />;
      case "show_catalog":
        return <Book className='w-4 h-4' />;
      case "contact_support":
        return <MessageCircle className='w-4 h-4' />;
      case "open_accessibility":
        return <Settings className='w-4 h-4' />;
      default:
        return null;
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
      case "bottom":
        return "top-full left-1/2 transform -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 transform -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 transform -translate-y-1/2 ml-2";
      default:
        return "top-full left-1/2 transform -translate-x-1/2 mt-2";
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case "top":
        return "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800";
      case "bottom":
        return "bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800";
      case "left":
        return "left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800";
      case "right":
        return "right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800";
      default:
        return "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800";
    }
  };

  if (!isOpen || !helpContent) return null;

  return (
    <div
      ref={helpRef}
      className={`fixed z-50 ${getPositionClasses()} ${
        settings.seniorMode ? "senior-mode" : ""
      } ${settings.largeTouchTargets ? "large-touch-targets" : ""}`}
    >
      <div className='bg-gray-800 text-white rounded-lg shadow-xl p-4 max-w-sm w-80'>
        {/* Header */}
        <div className='flex items-start justify-between mb-3'>
          <h3 className='font-semibold text-white pr-4'>{helpContent.title}</h3>
          <button
            onClick={handleClose}
            className='text-gray-300 hover:text-white transition-colors p-1'
            aria-label='Close help'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Content */}
        <p className='text-gray-200 text-sm mb-4 leading-relaxed'>
          {helpContent.content}
        </p>

        {/* Actions */}
        {helpContent.actions && helpContent.actions.length > 0 && (
          <div className='space-y-2'>
            {helpContent.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleAction(action)}
                className='w-full flex items-center justify-start px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left'
              >
                <span className='mr-3 text-gray-300'>
                  {getActionIcon(action)}
                </span>
                <span className='text-sm text-white'>{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Arrow */}
        <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`} />
      </div>
    </div>
  );
};

export default ContextualHelp;
