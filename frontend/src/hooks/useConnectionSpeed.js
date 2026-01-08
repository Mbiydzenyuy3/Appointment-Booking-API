import { useState, useEffect, useCallback } from "react";

export const useConnectionSpeed = () => {
  const [connectionSpeed, setConnectionSpeed] = useState("unknown");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState("unknown");

  // Test connection speed by downloading a small image
  const testConnectionSpeed = useCallback(async () => {
    try {
      const startTime = Date.now();
      const response = await fetch("/favicon.ico", { method: "HEAD" });
      const endTime = Date.now();

      if (response.ok) {
        const latency = endTime - startTime;

        // Estimate connection speed based on latency
        if (latency < 50) {
          setConnectionSpeed("fast");
        } else if (latency < 150) {
          setConnectionSpeed("medium");
        } else {
          setConnectionSpeed("slow");
        }
      }
    } catch {
      setConnectionSpeed("offline");
    }
  }, []);

  // Get connection information from navigator
  const updateConnectionInfo = useCallback(() => {
    if ("connection" in navigator) {
      const connection = navigator.connection;
      setConnectionType(connection.effectiveType || "unknown");

      // Map connection types to speed categories
      switch (connection.effectiveType) {
        case "4g":
          setConnectionSpeed("fast");
          break;
        case "3g":
          setConnectionSpeed("medium");
          break;
        case "2g":
        case "slow-2g":
          setConnectionSpeed("slow");
          break;
        default:
          // If we can't determine from connection API, test manually
          testConnectionSpeed();
      }
    } else {
      // Fallback for browsers that don't support connection API
      testConnectionSpeed();
    }
  }, [testConnectionSpeed]);

  useEffect(() => {
    // Initial connection check
    updateConnectionInfo();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      updateConnectionInfo();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionSpeed("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Listen for connection changes if supported
    if ("connection" in navigator) {
      const connection = navigator.connection;
      const handleConnectionChange = () => {
        updateConnectionInfo();
      };

      connection.addEventListener("change", handleConnectionChange);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        connection.removeEventListener("change", handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [updateConnectionInfo]);

  return {
    connectionSpeed,
    isOnline,
    connectionType,
    testConnectionSpeed
  };
};
