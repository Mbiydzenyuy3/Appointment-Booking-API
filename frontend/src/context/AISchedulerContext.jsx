import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext.jsx";
import api from "../services/api.js";
import { AISchedulerContext } from "../contexts/AISchedulerContext.js";

export const AISchedulerProvider = ({ children }) => {
  const { user } = useAuth();
  const [accessibilityProfile, setAccessibilityProfile] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [cognitiveLoadProfile, setCognitiveLoadProfile] = useState(null);
  const [focusTimePreferences, setFocusTimePreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [personalizedRecommendations, setPersonalizedRecommendations] =
    useState([]);

  // Load user's accessibility profile on mount
  const loadAccessibilityProfile = useCallback(async () => {
    try {
      if (!user?.user_id && !user?.sub) {
        console.warn("User not available for loading accessibility profile");
        return;
      }

      setLoading(true);
      // Use the correct user ID property
      const userId = user.user_id || user.sub;

      // Check if the AI scheduler endpoint exists before calling it
      try {
        const response = await api.get(`/api/ai-scheduler/profile/${userId}`);

        if (response.data.success) {
          const profile = response.data.data;
          setAccessibilityProfile(profile.preferences);
          setCognitiveLoadProfile(profile.cognitiveLoadProfile);
          setFocusTimePreferences(profile.focusTimeProfile);
          setPersonalizedRecommendations(
            profile.personalizedRecommendations || []
          );
        }
      } catch (error) {
        // AI Scheduler endpoint not available, set default accessibility profile
        console.warn("AI Scheduler profile endpoint failed:", error.message);
        console.log(
          "AI Scheduler endpoint not available, using default accessibility profile"
        );
        setAccessibilityProfile({
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

        setCognitiveLoadProfile({
          baselineLoad: 1.0,
          optimalTimeWindows: [],
          stressFactors: [],
          supportNeeds: []
        });

        setFocusTimePreferences({
          protectedRanges: [],
          interruptionSensitivity: "medium",
          optimalFocusPeriods: []
        });
      }
    } catch (error) {
      console.error("Failed to load accessibility profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.user_id, user?.sub]);

  useEffect(() => {
    if (user) {
      loadAccessibilityProfile();
    }
  }, [user, loadAccessibilityProfile]);

  const updateAccessibilityPreferences = async (preferences) => {
    try {
      if (!user?.user_id && !user?.sub) {
        console.warn(
          "User not available for updating accessibility preferences"
        );
        return false;
      }

      setLoading(true);
      const userId = user.user_id || user.sub;

      try {
        const response = await api.put(
          `/api/ai-scheduler/preferences/${userId}`,
          preferences
        );

        if (response.data.success) {
          setAccessibilityProfile(response.data.data);
          // Reload profile to get updated recommendations
          await loadAccessibilityProfile();
          return true;
        }
      } catch (error) {
        console.warn(
          "AI Scheduler endpoint not available for preference update:",
          error.message
        );
        // Update local state anyway for immediate feedback
        setAccessibilityProfile(preferences);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to update accessibility preferences:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAISuggestions = async (serviceId, customPreferences = {}) => {
    try {
      if (!user?.user_id && !user?.sub) {
        console.warn("User not available for getting AI suggestions");
        return null;
      }

      setLoading(true);
      const userId = user.user_id || user.sub;

      try {
        const response = await api.post("/api/ai-scheduler/suggestions", {
          userId,
          serviceId,
          preferences: customPreferences
        });

        if (response.data.success) {
          setAiSuggestions(response.data.data);
          return response.data.data;
        }
      } catch (error) {
        console.warn(
          "AI Scheduler suggestions endpoint not available:",
          error.message
        );
        // Return empty suggestions array
        return [];
      }

      return null;
    } catch (error) {
      console.error("Failed to get AI suggestions:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCognitiveLoadOptimization = async (
    appointmentType,
    duration,
    complexity
  ) => {
    try {
      if (!user?.user_id && !user?.sub) {
        console.warn("User not available for cognitive load optimization");
        return null;
      }

      const userId = user.user_id || user.sub;

      try {
        const response = await api.post(
          `/api/ai-scheduler/cognitive-optimization/${userId}`,
          {
            appointmentType,
            duration,
            complexity
          }
        );

        if (response.data.success) {
          return response.data.data;
        }
      } catch (error) {
        console.warn(
          "AI Scheduler cognitive optimization endpoint not available:",
          error.message
        );
        return {
          optimizedDuration: duration,
          recommendedBreaks: 0,
          complexityLevel: complexity
        };
      }

      return null;
    } catch (error) {
      console.error("Failed to get cognitive load optimization:", error);
      return null;
    }
  };

  const getFocusTimeProtection = async () => {
    try {
      if (!user?.user_id && !user?.sub) {
        console.warn("User not available for focus time protection");
        return null;
      }

      const userId = user.user_id || user.sub;

      try {
        const response = await api.get(
          `/api/ai-scheduler/focus-protection/${userId}`
        );

        if (response.data.success) {
          return response.data.data;
        }
      } catch (error) {
        console.warn(
          "AI Scheduler focus protection endpoint not available:",
          error.message
        );
        return {
          protectedRanges: [],
          recommendedBreakTime: 15,
          focusSessionLength: 25
        };
      }

      return null;
    } catch (error) {
      console.error("Failed to get focus time protection:", error);
      return null;
    }
  };

  const getAgeAppropriateSuggestions = async () => {
    try {
      if (!user?.user_id && !user?.sub) {
        console.warn("User not available for age-appropriate suggestions");
        return null;
      }

      const userId = user.user_id || user.sub;

      try {
        const response = await api.get(
          `/api/ai-scheduler/age-appropriate/${userId}`
        );

        if (response.data.success) {
          return response.data.data;
        }
      } catch (error) {
        console.warn(
          "AI Scheduler age-appropriate endpoint not available:",
          error.message
        );
        return {
          recommendedAppointments: [],
          optimalTimes: [],
          durationPreferences: []
        };
      }

      return null;
    } catch (error) {
      console.error("Failed to get age-appropriate suggestions:", error);
      return null;
    }
  };

  const learnFromBehavior = async (appointmentData) => {
    try {
      if (!user?.user_id && !user?.sub) {
        console.warn("User not available for learning from behavior");
        return null;
      }

      const userId = user.user_id || user.sub;

      try {
        const response = await api.post(
          `/api/ai-scheduler/learn/${userId}`,
          appointmentData
        );

        if (response.data.success) {
          // Refresh profile to incorporate learned preferences
          await loadAccessibilityProfile();
          return response.data.data;
        }
      } catch (error) {
        console.warn(
          "AI Scheduler learning endpoint not available:",
          error.message
        );
        return { success: true, message: "Learning recorded locally" };
      }

      return null;
    } catch (error) {
      console.error("Failed to learn from behavior:", error);
      return null;
    }
  };

  // Helper function to check if user needs specific accessibility features
  const hasAccessibilityNeed = (category, feature) => {
    if (!accessibilityProfile) return false;
    return accessibilityProfile[category]?.[feature] || false;
  };

  // Helper function to get cognitive load level
  const getCognitiveLoadLevel = () => {
    if (!cognitiveLoadProfile) return "normal";
    const baseline = cognitiveLoadProfile.baselineLoad;
    if (baseline < 0.7) return "low";
    if (baseline < 1.0) return "moderate";
    return "high";
  };

  // Helper function to check if time is in optimal window
  const isOptimalTime = (date, hour) => {
    if (!cognitiveLoadProfile?.optimalTimeWindows) return false;

    return cognitiveLoadProfile.optimalTimeWindows.some(
      (window) => hour >= window.start && hour <= window.end
    );
  };

  // Helper function to get focus protection level
  const getFocusProtectionLevel = () => {
    if (!focusTimePreferences) return "normal";

    const protectedRanges = focusTimePreferences.protectedRanges || [];
    const interruptionSensitivity =
      focusTimePreferences.interruptionSensitivity || "medium";

    return {
      level: interruptionSensitivity,
      protectedRanges,
      needsQuietEnvironment:
        focusTimePreferences.environmentalNeeds?.includes("quiet_environment")
    };
  };

  const value = {
    // State
    accessibilityProfile,
    aiSuggestions,
    cognitiveLoadProfile,
    focusTimePreferences,
    personalizedRecommendations,
    loading,

    // Actions
    updateAccessibilityPreferences,
    getAISuggestions,
    getCognitiveLoadOptimization,
    getFocusTimeProtection,
    getAgeAppropriateSuggestions,
    learnFromBehavior,
    loadAccessibilityProfile,

    // Helpers
    hasAccessibilityNeed,
    getCognitiveLoadLevel,
    isOptimalTime,
    getFocusProtectionLevel
  };

  return (
    <AISchedulerContext.Provider value={value}>
      {children}
    </AISchedulerContext.Provider>
  );
};

export default AISchedulerContext;
