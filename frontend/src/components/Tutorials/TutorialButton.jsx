// src/components/Tutorials/TutorialButton.jsx
import React, { useState } from "react";
import { HelpCircle, Book, Play, Star } from "lucide-react";
import { useTutorial, useContextualHelp } from "../../hooks/useTutorial";
import { useAccessibility } from "../../hooks/useAccessibility";

const TutorialButton = ({
  variant = "icon", // 'icon', 'button', 'floating'
  type = "help", // 'help', 'tutorial', 'catalog'
  size = "medium", // 'small', 'medium', 'large'
  position = "bottom-right", // for floating variant
  context = null, // 'booking', 'account', 'accessibility'
  className = "",
  ...props
}) => {
  const { setShowTutorialCatalog, getCompletionRate } = useTutorial();
  const { showBookingHelp, showAccountHelp, showAccessibilityHelp } =
    useContextualHelp();
  const { settings } = useAccessibility();
  const [isHovered, setIsHovered] = useState(false);

  const completionRate = getCompletionRate();

  const handleClick = () => {
    switch (type) {
      case "help":
        if (context) {
          switch (context) {
            case "booking":
              showBookingHelp();
              break;
            case "account":
              showAccountHelp();
              break;
            case "accessibility":
              showAccessibilityHelp();
              break;
            default:
              break;
          }
        }
        break;
      case "tutorial":
        // Show specific tutorial based on context
        setShowTutorialCatalog(true);
        break;
      case "catalog":
        setShowTutorialCatalog(true);
        break;
      default:
        break;
    }
  };

  const getSizeClasses = () => {
    const sizes = {
      small: "w-8 h-8 p-1.5",
      medium: "w-10 h-10 p-2",
      large: "w-12 h-12 p-3"
    };
    return sizes[size] || sizes.medium;
  };

  const getIconSize = () => {
    const sizes = {
      small: "w-4 h-4",
      medium: "w-5 h-5",
      large: "w-6 h-6"
    };
    return sizes[size] || sizes.medium;
  };

  const getButtonText = () => {
    switch (type) {
      case "help":
        return "Help";
      case "tutorial":
        return "Tutorial";
      case "catalog":
        return "All Tutorials";
      default:
        return "Help";
    }
  };

  const renderContent = () => {
    const icon = (
      <>
        {type === "help" && <HelpCircle className={getIconSize()} />}
        {type === "tutorial" && <Play className={getIconSize()} />}
        {type === "catalog" && <Book className={getIconSize()} />}
      </>
    );

    if (variant === "icon") {
      return (
        <button
          onClick={handleClick}
          className={`
            ${getSizeClasses()}
            ${settings.largeTouchTargets ? "large-touch-targets" : ""}
            bg-blue-600 hover:bg-blue-700 text-white rounded-full 
            transition-all duration-200 hover:scale-105 focus:outline-none 
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            shadow-lg hover:shadow-xl
            ${className}
          `}
          aria-label={`${getButtonText()} - ${completionRate}% completed`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...props}
        >
          {icon}
        </button>
      );
    }

    if (variant === "button") {
      return (
        <button
          onClick={handleClick}
          className={`
            ${settings.seniorMode ? "senior-mode" : ""}
            ${settings.largeTouchTargets ? "large-touch-targets" : ""}
            flex items-center space-x-2 px-4 py-2 
            bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
            transition-all duration-200 focus:outline-none 
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${className}
          `}
          aria-label={`${getButtonText()} - ${completionRate}% completed`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...props}
        >
          {icon}
          <span className='font-medium'>{getButtonText()}</span>
          {completionRate > 0 && (
            <div className='flex items-center space-x-1'>
              <Star className='w-3 h-3 text-yellow-300' />
              <span className='text-xs'>{completionRate}%</span>
            </div>
          )}
        </button>
      );
    }

    if (variant === "floating") {
      return (
        <button
          onClick={handleClick}
          className={`
            ${getSizeClasses()}
            ${settings.seniorMode ? "senior-mode" : ""}
            ${settings.largeTouchTargets ? "large-touch-targets" : ""}
            fixed z-40 bg-green-600 hover:bg-green-700 text-white 
            rounded-full transition-all duration-200 hover:scale-110 
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
            shadow-lg hover:shadow-xl
            ${position === "bottom-right" && "bottom-6 right-6"}
            ${position === "bottom-left" && "bottom-6 left-6"}
            ${position === "top-right" && "top-6 right-6"}
            ${position === "top-left" && "top-6 left-6"}
            ${className}
          `}
          aria-label={`${getButtonText()} - ${completionRate}% completed`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...props}
        >
          {icon}

          {/* Pulse animation for attention */}
          <div className='absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20'></div>
        </button>
      );
    }

    return null;
  };

  // Tooltip for additional context
  if (isHovered && variant !== "button") {
    const tooltipText = `${getButtonText()} (${completionRate}% tutorials completed)`;

    return (
      <div className='relative inline-block'>
        {renderContent()}
        <div
          className={`
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
          px-3 py-2 bg-gray-800 text-white text-sm rounded-lg 
          whitespace-nowrap z-50
          ${position.includes("bottom") ? "mb-2" : "mt-2"}
        `}
        >
          {tooltipText}
          <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800'></div>
        </div>
      </div>
    );
  }

  return renderContent();
};

// Specialized components for common use cases
export const HelpButton = ({ context, ...props }) => (
  <TutorialButton
    type='help'
    context={context}
    variant='icon'
    size='medium'
    {...props}
  />
);

export const TutorialButtonMain = ({ ...props }) => (
  <TutorialButton type='tutorial' variant='button' size='medium' {...props} />
);

export const TutorialCatalogButton = ({ ...props }) => (
  <TutorialButton type='catalog' variant='button' size='medium' {...props} />
);

export const FloatingHelpButton = ({ context, ...props }) => (
  <TutorialButton
    type='help'
    context={context}
    variant='floating'
    size='large'
    position='bottom-right'
    {...props}
  />
);

export const FloatingTutorialButton = ({ ...props }) => (
  <TutorialButton
    type='tutorial'
    variant='floating'
    size='large'
    position='bottom-right'
    {...props}
  />
);

export default TutorialButton;
