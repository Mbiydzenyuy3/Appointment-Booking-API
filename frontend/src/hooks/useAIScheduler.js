import { useContext } from "react";
import { AISchedulerContext } from "../contexts/AISchedulerContext.js";

/**
 * Custom hook to access the AI Scheduler context
 * @returns {object} The AI Scheduler context value
 * @throws {Error} If used outside of AISchedulerProvider
 */
export const useAIScheduler = () => {
  const context = useContext(AISchedulerContext);
  if (!context) {
    throw new Error(
      "useAIScheduler must be used within an AISchedulerProvider"
    );
  }
  return context;
};
