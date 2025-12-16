// Accessibility Preferences Configuration Component
import React, { useState, useEffect } from "react";
import { useAIScheduler } from "../../hooks/useAIScheduler.js";

export default function AccessibilityPreferences({ isOpen, onClose }) {
  // const { user } = useAuth();
  const { accessibilityProfile, updateAccessibilityPreferences, loading } =
    useAIScheduler();

  const [preferences, setPreferences] = useState({
    visual: {
      highContrast: false,
      largeText: false,
      screenReader: false,
      colorBlindFriendly: false
    },
    cognitive: {
      simpleInterface: false,
      reducedOptions: false,
      extraTime: false,
      clearInstructions: false
    },
    motor: {
      largerTouchTargets: false,
      voiceControl: false,
      switchControl: false,
      extendedTime: false
    },
    auditory: {
      hearingImpaired: false,
      visualAlerts: false,
      signLanguage: false,
      captions: false
    }
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    if (accessibilityProfile) {
      setPreferences((prevPreferences) => ({
        visual: { ...prevPreferences.visual, ...accessibilityProfile.visual },
        cognitive: {
          ...prevPreferences.cognitive,
          ...accessibilityProfile.cognitive
        },
        motor: { ...prevPreferences.motor, ...accessibilityProfile.motor },
        auditory: {
          ...prevPreferences.auditory,
          ...accessibilityProfile.auditory
        }
      }));
    }
  }, [accessibilityProfile]);

  const handlePreferenceChange = (category, feature, value) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [feature]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    const success = await updateAccessibilityPreferences(preferences);
    if (success) {
      setUnsavedChanges(false);
      onClose();
    }
  };

  const handleCancel = () => {
    if (accessibilityProfile) {
      setPreferences((prevPreferences) => ({
        visual: { ...prevPreferences.visual, ...accessibilityProfile.visual },
        cognitive: {
          ...prevPreferences.cognitive,
          ...accessibilityProfile.cognitive
        },
        motor: { ...prevPreferences.motor, ...accessibilityProfile.motor },
        auditory: {
          ...prevPreferences.auditory,
          ...accessibilityProfile.auditory
        }
      }));
    }
    setUnsavedChanges(false);
    onClose();
  };

  const getTotalSelectedCount = () => {
    return Object.values(preferences).reduce((total, category) => {
      return total + Object.values(category).filter(Boolean).length;
    }, 0);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      visual: "👁️",
      cognitive: "🧠",
      motor: "✋",
      auditory: "👂"
    };
    return icons[category] || "⚙️";
  };

  const getCategoryTitle = (category) => {
    const titles = {
      visual: "Visual Accessibility",
      cognitive: "Cognitive Accessibility",
      motor: "Motor Accessibility",
      auditory: "Auditory Accessibility"
    };
    return titles[category] || category;
  };

  const getFeatureDescription = (category, feature) => {
    const descriptions = {
      visual: {
        highContrast: "Enhanced contrast for better visibility",
        largeText: "Larger text and UI elements",
        screenReader: "Optimized for screen reader compatibility",
        colorBlindFriendly: "Color schemes that work for color blindness"
      },
      cognitive: {
        simpleInterface: "Simplified, uncluttered interface design",
        reducedOptions: "Fewer choices to reduce decision fatigue",
        extraTime: "Additional time for processing and decisions",
        clearInstructions: "Step-by-step guidance and clear directions"
      },
      motor: {
        largerTouchTargets: "Larger buttons and interactive elements",
        voiceControl: "Voice-activated controls and navigation",
        switchControl: "Support for switch-based navigation",
        extendedTime: "Extra time for physical movements and actions"
      },
      auditory: {
        hearingImpaired: "Support for hearing impairments",
        visualAlerts: "Visual alternatives to audio notifications",
        signLanguage: "Sign language interpretation support",
        captions: "Closed captions for audio content"
      }
    };
    return descriptions[category]?.[feature] || "";
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 safe-area-bottom'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 flex items-center'>
                <span className='text-3xl mr-3'>♿</span>
                Accessibility Preferences
              </h2>
              <p className='text-gray-600 mt-1'>
                Customize your experience for optimal accessibility
              </p>
            </div>
            <button
              onClick={handleCancel}
              className='p-2 hover:bg-gray-100 rounded-lg touch-target'
              aria-label='Close accessibility preferences'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {/* Summary */}
          <div className='mt-4 flex items-center justify-between'>
            <div className='text-sm text-gray-600'>
              <span className='font-medium'>{getTotalSelectedCount()}</span>{" "}
              accessibility features selected
            </div>
            {unsavedChanges && (
              <div className='text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full'>
                Unsaved changes
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className='p-6 space-y-8'>
          {Object.entries(preferences).map(([category, features]) => (
            <div key={category} className='space-y-4'>
              <div className='flex items-center mb-4'>
                <span className='text-2xl mr-3'>
                  {getCategoryIcon(category)}
                </span>
                <h3 className='text-xl font-semibold text-gray-900'>
                  {getCategoryTitle(category)}
                </h3>
                <span className='ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>
                  {Object.values(features).filter(Boolean).length} selected
                </span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {Object.entries(features).map(([feature, enabled]) => (
                  <label
                    key={feature}
                    className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      enabled
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    <div className='flex items-center h-6 mr-3 mt-0.5'>
                      <input
                        type='checkbox'
                        checked={enabled}
                        onChange={(e) =>
                          handlePreferenceChange(
                            category,
                            feature,
                            e.target.checked
                          )
                        }
                        className='w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 touch-target'
                      />
                    </div>
                    <div className='flex-1'>
                      <div className='font-medium text-gray-900 capitalize'>
                        {feature.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                      <div className='text-sm text-gray-600 mt-1'>
                        {getFeatureDescription(category, feature)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className='sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-600'>
              {getTotalSelectedCount() > 0 ? (
                <>
                  <span className='font-medium'>Great!</span> Your preferences
                  will help us optimize scheduling for your needs.
                </>
              ) : (
                "Select any accessibility features that apply to your needs."
              )}
            </div>
            <div className='flex space-x-3'>
              <button
                onClick={handleCancel}
                className='btn btn-secondary touch-target'
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className='btn btn-primary touch-target'
                disabled={loading || !unsavedChanges}
              >
                {loading ? (
                  <div className='flex items-center'>
                    <div className='loading-spinner mr-2'></div>
                    Saving...
                  </div>
                ) : (
                  "Save Preferences"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
