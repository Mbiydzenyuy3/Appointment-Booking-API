// Smart AI-Powered Accessibility-First Scheduler Component
import React, { useState, useEffect, useCallback } from "react";
import { useAIScheduler } from "../../hooks/useAIScheduler.js";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";

export default function SmartScheduler({ serviceId, onSlotSelect, onClose }) {
  const { user } = useAuth();
  const {
    getAISuggestions,
    getCognitiveLoadOptimization,
    getFocusTimeProtection,
    getAgeAppropriateSuggestions
  } = useAIScheduler();

  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [cognitiveOptimization, setCognitiveOptimization] = useState(null);
  const [focusProtection, setFocusProtection] = useState(null);
  const [ageSuggestions, setAgeSuggestions] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeTab, setActiveTab] = useState("ai-suggestions");
  const [service, setService] = useState(null);

  const loadSmartSchedulingData = useCallback(async () => {
    if (!serviceId || !user) return;

    try {
      // Load service details
      const serviceResponse = await api.get(`/services/${serviceId}`);
      setService(serviceResponse.data.data);

      // Get AI suggestions with null check
      if (getAISuggestions) {
        const suggestionsResponse = await getAISuggestions(serviceId);
        if (suggestionsResponse) {
          setAiSuggestions(suggestionsResponse.suggestions || []);
        }
      }

      // Get cognitive load optimization with null check
      if (getCognitiveLoadOptimization && serviceResponse.data.data) {
        const cognitiveResponse = await getCognitiveLoadOptimization(
          serviceResponse.data.data.type,
          serviceResponse.data.data.duration_minutes,
          serviceResponse.data.data.complexity || "medium"
        );
        if (cognitiveResponse) {
          setCognitiveOptimization(cognitiveResponse);
        }
      }

      // Get focus time protection with null check
      if (getFocusTimeProtection) {
        const focusResponse = await getFocusTimeProtection();
        if (focusResponse) {
          setFocusProtection(focusResponse);
        }
      }

      // Get age-appropriate suggestions with null check
      if (getAgeAppropriateSuggestions) {
        const ageResponse = await getAgeAppropriateSuggestions();
        if (ageResponse) {
          setAgeSuggestions(ageResponse);
        }
      }
    } catch (error) {
      console.error("Failed to load smart scheduling data:", error);
      // Consider adding user-facing error state here
    }
  }, [
    serviceId,
    user,
    getAISuggestions,
    getCognitiveLoadOptimization,
    getFocusTimeProtection,
    getAgeAppropriateSuggestions
  ]);

  useEffect(() => {
    loadSmartSchedulingData();
  }, [loadSmartSchedulingData]);

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    if (onSlotSelect) {
      onSlotSelect(slot);
    }
  };

  const getSlotAccessibilityIcon = (slot) => {
    if (!aiSuggestions || aiSuggestions.length === 0) return null;

    const slotData = aiSuggestions.find((s) => s._id === slot._id);
    if (!slotData) return null;

    const { aiScore, cognitiveLoad, focusProtection } = slotData;

    if (aiScore > 130) return "🌟"; // Excellent accessibility fit
    if (aiScore > 110) return "✨"; // Good accessibility fit
    if (cognitiveLoad < 0.8) return "🧠"; // Low cognitive load
    if (focusProtection > 30) return "🛡️"; // Focus protection
    return "👍"; // Good option
  };

  const getSlotExplanation = (slot) => {
    if (!aiSuggestions || aiSuggestions.length === 0) return "";

    const slotData = aiSuggestions.find((s) => s._id === slot._id);
    if (!slotData) return "";

    const explanations = [];

    if (slotData.aiScore > 120) {
      explanations.push("Optimized for your accessibility needs");
    }

    if (slotData.cognitiveLoad < 0.8) {
      explanations.push("Low cognitive load - easier decision making");
    }

    if (slotData.focusProtection > 40) {
      explanations.push("Protected focus time");
    }

    return explanations.length > 0
      ? explanations.join(" • ")
      : "Standard appointment slot";
  };

  const renderAISuggestions = () => (
    <div className='space-y-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
          <span className='text-2xl mr-2'>🤖</span>
          AI-Powered Suggestions
        </h3>
        <span className='text-sm text-gray-500 bg-green-100 px-3 py-1 rounded-full'>
          {aiSuggestions.length} optimized slots
        </span>
      </div>

      {aiSuggestions.length === 0 ? (
        <div className='text-center py-8'>
          <div className='text-4xl mb-4'>🤔</div>
          <p className='text-gray-600'>No AI suggestions available yet.</p>
          <p className='text-sm text-gray-500 mt-2'>
            This might be because no slots match your accessibility preferences.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {aiSuggestions.slice(0, 8).map((slot) => (
            <div
              key={slot._id}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                selectedSlot?._id === slot._id
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-green-300 hover:bg-green-50"
              }`}
              onClick={() => handleSlotSelect(slot)}
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center mb-2'>
                    <span className='text-xl mr-2'>
                      {getSlotAccessibilityIcon(slot)}
                    </span>
                    <span className='font-medium text-gray-900'>
                      {new Date(slot.day).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                    <span className='mx-2 text-gray-400'>•</span>
                    <span className='text-gray-700'>
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>

                  <div className='flex items-center space-x-4 text-sm text-gray-600'>
                    <span className='flex items-center'>
                      <span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
                      AI Score: {Math.round(slot.aiScore || 0)}
                    </span>
                    <span className='flex items-center'>
                      <span className='w-2 h-2 bg-blue-500 rounded-full mr-2'></span>
                      Cognitive Load: {slot.cognitiveLoad || "N/A"}
                    </span>
                    <span className='flex items-center'>
                      <span className='w-2 h-2 bg-purple-500 rounded-full mr-2'></span>
                      Focus: {slot.focusProtection || 0}
                    </span>
                  </div>

                  <p className='text-sm text-gray-600 mt-2'>
                    {getSlotExplanation(slot)}
                  </p>
                </div>

                {selectedSlot?._id === slot._id && (
                  <div className='ml-4'>
                    <svg
                      className='w-6 h-6 text-green-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCognitiveOptimization = () => (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-900 flex items-center mb-4'>
        <span className='text-2xl mr-2'>🧠</span>
        Cognitive Load Optimization
      </h3>

      {cognitiveOptimization ? (
        <div className='space-y-4'>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <h4 className='font-medium text-blue-900 mb-2'>
              Recommended Duration
            </h4>
            <p className='text-blue-800'>
              {cognitiveOptimization.recommendedDuration} minutes
              {cognitiveOptimization.recommendedDuration !==
                service?.duration_minutes &&
                ` (extended from ${service?.duration_minutes} minutes for comfort)`}
            </p>
          </div>

          {cognitiveOptimization.suggestedBreakPoints?.length > 0 && (
            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
              <h4 className='font-medium text-green-900 mb-2'>
                Recommended Breaks
              </h4>
              <ul className='text-green-800 space-y-1'>
                {cognitiveOptimization.suggestedBreakPoints.map(
                  (breakpoint, index) => (
                    <li key={index} className='flex items-center'>
                      <span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
                      At {breakpoint.point} minutes - {breakpoint.reason}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {cognitiveOptimization.timingRecommendations?.length > 0 && (
            <div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
              <h4 className='font-medium text-purple-900 mb-2'>
                Optimal Time Windows
              </h4>
              <div className='space-y-2'>
                {cognitiveOptimization.timingRecommendations.map(
                  (rec, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between'
                    >
                      <span className='text-purple-800'>{rec.timeRange}</span>
                      <span className='text-sm text-purple-600'>
                        {rec.reason}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className='text-center py-8'>
          <div className='text-4xl mb-4'>⏳</div>
          <p className='text-gray-600'>
            Cognitive optimization data loading...
          </p>
        </div>
      )}
    </div>
  );

  const renderFocusProtection = () => (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-900 flex items-center mb-4'>
        <span className='text-2xl mr-2'>🛡️</span>
        Focus Time Protection
      </h3>

      {focusProtection ? (
        <div className='space-y-4'>
          {focusProtection.protectedTimeBlocks?.length > 0 && (
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
              <h4 className='font-medium text-yellow-900 mb-2'>
                Protected Time Blocks
              </h4>
              <div className='space-y-2'>
                {focusProtection.protectedTimeBlocks.map((block, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between'
                  >
                    <span className='text-yellow-800'>
                      {block.start}:00 - {block.end}:00
                    </span>
                    <span className='text-sm text-yellow-600'>
                      {block.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {focusProtection.schedulingGuidelines?.length > 0 && (
            <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
              <h4 className='font-medium text-orange-900 mb-2'>
                Scheduling Guidelines
              </h4>
              <ul className='text-orange-800 space-y-1'>
                {focusProtection.schedulingGuidelines.map(
                  (guideline, index) => (
                    <li key={index} className='flex items-start'>
                      <span className='w-2 h-2 bg-orange-500 rounded-full mr-2 mt-2 flex-shrink-0'></span>
                      {guideline}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className='text-center py-8'>
          <div className='text-4xl mb-4'>⏳</div>
          <p className='text-gray-600'>Focus protection data loading...</p>
        </div>
      )}
    </div>
  );

  const renderAgeAppropriate = () => (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-900 flex items-center mb-4'>
        <span className='text-2xl mr-2'>👥</span>
        Age-Appropriate Suggestions
      </h3>

      {ageSuggestions ? (
        <div className='space-y-4'>
          {ageSuggestions.interfaceAdjustments?.length > 0 && (
            <div className='bg-indigo-50 border border-indigo-200 rounded-lg p-4'>
              <h4 className='font-medium text-indigo-900 mb-2'>
                Interface Adjustments
              </h4>
              <ul className='text-indigo-800 space-y-1'>
                {ageSuggestions.interfaceAdjustments.map(
                  (adjustment, index) => (
                    <li key={index} className='flex items-center'>
                      <span className='w-2 h-2 bg-indigo-500 rounded-full mr-2'></span>
                      {adjustment}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {ageSuggestions.timingPreferences?.length > 0 && (
            <div className='bg-teal-50 border border-teal-200 rounded-lg p-4'>
              <h4 className='font-medium text-teal-900 mb-2'>
                Timing Preferences
              </h4>
              <ul className='text-teal-800 space-y-1'>
                {ageSuggestions.timingPreferences.map((pref, index) => (
                  <li key={index} className='flex items-center'>
                    <span className='w-2 h-2 bg-teal-500 rounded-full mr-2'></span>
                    {pref}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className='text-center py-8'>
          <div className='text-4xl mb-4'>⏳</div>
          <p className='text-gray-600'>
            Age-appropriate suggestions loading...
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className='max-w-4xl mx-auto'>
      {/* Header */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center'>
              <span className='text-3xl mr-3'>🤖</span>
              Smart AI Scheduler
            </h2>
            <p className='text-gray-600 mt-1'>
              Accessibility-first appointment booking with AI optimization
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg touch-target'
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
      </div>

      {/* Tab Navigation */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 mb-6'>
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8 px-6'>
            {[
              { id: "ai-suggestions", label: "AI Suggestions", icon: "🤖" },
              { id: "cognitive", label: "Cognitive Load", icon: "🧠" },
              { id: "focus", label: "Focus Protection", icon: "🛡️" },
              { id: "age", label: "Age-Appropriate", icon: "👥" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 touch-target ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className='mr-2'>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className='p-6'>
          {activeTab === "ai-suggestions" && renderAISuggestions()}
          {activeTab === "cognitive" && renderCognitiveOptimization()}
          {activeTab === "focus" && renderFocusProtection()}
          {activeTab === "age" && renderAgeAppropriate()}
        </div>
      </div>

      {/* Selected Slot Actions */}
      {selectedSlot && (
        <div className='bg-green-50 border border-green-200 rounded-xl p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold text-green-900'>
                Selected Time Slot
              </h3>
              <p className='text-green-700'>
                {new Date(selectedSlot.day).toLocaleDateString()} at{" "}
                {selectedSlot.start_time}
              </p>
              <p className='text-sm text-green-600 mt-1'>
                {getSlotExplanation(selectedSlot)}
              </p>
            </div>
            <div className='flex space-x-3'>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className='btn btn-outline text-sm px-4 py-2 touch-target'
              >
                {showExplanation ? "Hide" : "Show"} Details
              </button>
              <button
                onClick={() => handleSlotSelect(selectedSlot)}
                className='btn btn-primary touch-target'
              >
                Book This Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
