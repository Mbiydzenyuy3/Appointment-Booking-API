// src/components/Accessibility/AccessibilityPanel.jsx
import React, { useState } from "react";
import { useAccessibility } from "../../hooks/useAccessibility";

const AccessibilityPanel = () => {
  const { settings, updateSetting, resetSettings } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const fontSizeOptions = [
    {
      value: "small",
      label: "Small (14px)",
      description: "Easier for detailed reading"
    },
    {
      value: "medium",
      label: "Medium (16px)",
      description: "Standard comfortable reading"
    },
    {
      value: "large",
      label: "Large (18px)",
      description: "Better for users with low vision"
    }
  ];

  return (
    <>
      {/* Accessibility Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='fixed bottom-4 right-4 z-50 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg focus-ring transition-colors'
        aria-label='Open accessibility settings'
        aria-expanded={isOpen}
        aria-controls='accessibility-panel'
      >
        <span className='sr-only'>Accessibility Settings</span>♿
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div
          id='accessibility-panel'
          className='fixed bottom-20 right-4 z-40 bg-white border border-border-default rounded-xl shadow-strong p-6 w-80 max-w-[calc(100vw-2rem)]'
          role='dialog'
          aria-modal='true'
          aria-labelledby='accessibility-title'
        >
          <div className='flex justify-between items-center mb-4'>
            <h2
              id='accessibility-title'
              className='text-xl font-bold text-text-primary'
            >
              Accessibility Settings
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className='text-text-secondary hover:text-text-primary p-1 rounded focus-ring'
              aria-label='Close accessibility settings'
            >
              ✕
            </button>
          </div>

          <div className='space-y-6'>
            {/* Font Size Control */}
            <div>
              <label className='block text-sm font-semibold text-text-primary mb-2'>
                Font Size
              </label>
              <div className='space-y-2'>
                {fontSizeOptions.map((option) => (
                  <label
                    key={option.value}
                    className='flex items-start space-x-3 cursor-pointer'
                  >
                    <input
                      type='radio'
                      name='fontSize'
                      value={option.value}
                      checked={settings.fontSize === option.value}
                      onChange={(e) =>
                        updateSetting("fontSize", e.target.value)
                      }
                      className='mt-1 text-primary-600 focus:ring-primary-500'
                    />
                    <div>
                      <div className='font-medium text-text-primary'>
                        {option.label}
                      </div>
                      <div className='text-sm text-text-secondary'>
                        {option.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div>
              <label className='flex items-center justify-between cursor-pointer'>
                <div>
                  <span className='text-sm font-semibold text-text-primary'>
                    High Contrast Mode
                  </span>
                  <p className='text-xs text-text-secondary mt-1'>
                    Enhances color contrast for better visibility
                  </p>
                </div>
                <input
                  type='checkbox'
                  checked={settings.highContrast}
                  onChange={(e) =>
                    updateSetting("highContrast", e.target.checked)
                  }
                  className='ml-4 text-primary-600 focus:ring-primary-500'
                  aria-describedby='high-contrast-desc'
                />
              </label>
            </div>

            {/* Reduced Motion Toggle */}
            <div>
              <label className='flex items-center justify-between cursor-pointer'>
                <div>
                  <span className='text-sm font-semibold text-text-primary'>
                    Reduced Motion
                  </span>
                  <p className='text-xs text-text-secondary mt-1'>
                    Minimizes animations and transitions
                  </p>
                </div>
                <input
                  type='checkbox'
                  checked={settings.reducedMotion}
                  onChange={(e) =>
                    updateSetting("reducedMotion", e.target.checked)
                  }
                  className='ml-4 text-primary-600 focus:ring-primary-500'
                  aria-describedby='reduced-motion-desc'
                />
              </label>
            </div>

            {/* Focus Indicators Toggle */}
            <div>
              <label className='flex items-center justify-between cursor-pointer'>
                <div>
                  <span className='text-sm font-semibold text-text-primary'>
                    Enhanced Focus Indicators
                  </span>
                  <p className='text-xs text-text-secondary mt-1'>
                    Makes keyboard navigation more visible
                  </p>
                </div>
                <input
                  type='checkbox'
                  checked={settings.focusIndicators}
                  onChange={(e) =>
                    updateSetting("focusIndicators", e.target.checked)
                  }
                  className='ml-4 text-primary-600 focus:ring-primary-500'
                  aria-describedby='focus-indicators-desc'
                />
              </label>
            </div>

            {/* Screen Reader Mode Toggle */}
            <div>
              <label className='flex items-center justify-between cursor-pointer'>
                <div>
                  <span className='text-sm font-semibold text-text-primary'>
                    Screen Reader Optimization
                  </span>
                  <p className='text-xs text-text-secondary mt-1'>
                    Optimizes layout for screen readers
                  </p>
                </div>
                <input
                  type='checkbox'
                  checked={settings.screenReaderMode}
                  onChange={(e) =>
                    updateSetting("screenReaderMode", e.target.checked)
                  }
                  className='ml-4 text-primary-600 focus:ring-primary-500'
                  aria-describedby='screen-reader-desc'
                />
              </label>
            </div>

            {/* Reset Button */}
            <div className='pt-4 border-t border-border-light'>
              <button
                onClick={resetSettings}
                className='w-full btn-secondary py-2 text-sm'
                aria-label='Reset all accessibility settings to default'
              >
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className='mt-4 pt-4 border-t border-border-light'>
            <h3 className='text-sm font-semibold text-text-primary mb-2'>
              Keyboard Shortcuts
            </h3>
            <ul className='text-xs text-text-secondary space-y-1'>
              <li>
                <kbd className='bg-background-muted px-1 rounded'>Tab</kbd> -
                Navigate forward
              </li>
              <li>
                <kbd className='bg-background-muted px-1 rounded'>
                  Shift+Tab
                </kbd>{" "}
                - Navigate backward
              </li>
              <li>
                <kbd className='bg-background-muted px-1 rounded'>
                  Enter/Space
                </kbd>{" "}
                - Activate element
              </li>
              <li>
                <kbd className='bg-background-muted px-1 rounded'>Esc</kbd> -
                Close dialogs
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityPanel;
