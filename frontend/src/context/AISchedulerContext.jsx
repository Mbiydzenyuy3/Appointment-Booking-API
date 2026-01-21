import React, { createContext, useContext, useState, useCallback } from "react";

const AISchedulerContext = createContext();

export const useAIScheduler = () => {
  const context = useContext(AISchedulerContext);
  if (!context) {
    throw new Error(
      "useAIScheduler must be used within an AISchedulerProvider"
    );
  }
  return context;
};

export const AISchedulerProvider = ({ children }) => {
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cognitiveLoad, setCognitiveLoad] = useState(0.5);
  const [focusTimeProtection, setFocusTimeProtection] = useState(null);

  const getAccessibilityOptimizedSlots = useCallback(
    async (userId, serviceId, preferences) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/ai-scheduler/accessibility-slots`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ userId, serviceId, preferences })
        });

        if (!response.ok) {
          throw new Error("Failed to get AI suggestions");
        }

        const data = await response.json();
        setAiSuggestions(data.data.optimizedSlots);
        return data.data;
      } catch (error) {
        console.error("Error getting AI suggestions:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const learnFromAppointmentBehavior = useCallback(
    async (userId, appointmentData) => {
      try {
        const response = await fetch(
          `/api/ai-scheduler/learn-behavior/${userId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(appointmentData)
          }
        );

        if (!response.ok) {
          throw new Error("Failed to learn from behavior");
        }

        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error("Error learning from behavior:", error);
        throw error;
      }
    },
    []
  );

  const getCognitiveLoadOptimization = useCallback(
    async (userId, appointmentData) => {
      try {
        const response = await fetch(
          `/api/ai-scheduler/cognitive-load/${userId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(appointmentData)
          }
        );

        if (!response.ok) {
          throw new Error("Failed to get cognitive load optimization");
        }

        const data = await response.json();
        setCognitiveLoad(data.data.realTimeLoad.currentLoad);
        return data.data;
      } catch (error) {
        console.error("Error getting cognitive load optimization:", error);
        throw error;
      }
    },
    []
  );

  const getFocusTimeProtection = useCallback(async (userId) => {
    try {
      const response = await fetch(`/api/ai-scheduler/focus-time/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to get focus time protection");
      }

      const data = await response.json();
      setFocusTimeProtection(data.data);
      return data.data;
    } catch (error) {
      console.error("Error getting focus time protection:", error);
      throw error;
    }
  }, []);

  const getAgeAppropriateSuggestions = useCallback(async (userId) => {
    try {
      const response = await fetch(
        `/api/ai-scheduler/age-suggestions/${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to get age-appropriate suggestions");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error getting age-appropriate suggestions:", error);
      throw error;
    }
  }, []);

  const value = {
    aiSuggestions,
    isLoading,
    cognitiveLoad,
    focusTimeProtection,
    getAccessibilityOptimizedSlots,
    learnFromAppointmentBehavior,
    getCognitiveLoadOptimization,
    getFocusTimeProtection,
    getAgeAppropriateSuggestions
  };

  return (
    <AISchedulerContext.Provider value={value}>
      {children}
    </AISchedulerContext.Provider>
  );
};
