import { useState, useEffect } from "react";

/**
 * Hook to detect connection speed and apply optimizations for slow networks
 * Particularly useful for 2G/3G networks in areas like Cameroon
 */
export const useConnectionSpeed = () => {
  const [connectionSpeed, setConnectionSpeed] = useState("unknown");
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    // Check Network Information API (supported in modern browsers)
    const checkConnection = () => {
      if ("connection" in navigator) {
        const connection =
          navigator.connection ||
          navigator.mozConnection ||
          navigator.webkitConnection;

        if (connection) {
          const effectiveType = connection.effectiveType;
          const downlink = connection.downlink;

          // Determine if connection is slow
          const isSlow =
            effectiveType === "slow-2g" ||
            effectiveType === "2g" ||
            (effectiveType === "3g" && downlink < 1) ||
            downlink < 0.5;

          setConnectionSpeed(effectiveType || "unknown");
          setIsSlowConnection(isSlow);

          // Apply CSS class to body for global slow network optimizations
          if (isSlow) {
            document.body.classList.add("connection-slow");
          } else {
            document.body.classList.remove("connection-slow");
          }
        }
      } else {
        // Fallback: measure connection speed with a small request
        measureConnectionSpeed();
      }
    };

    const measureConnectionSpeed = async () => {
      try {
        const startTime = Date.now();
        // Use a small image or API call to measure speed
        await fetch("/favicon.ico", {
          method: "HEAD",
          cache: "no-cache"
        });
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Rough estimation: if it takes more than 500ms, consider it slow
        const isSlow = duration > 500;
        setIsSlowConnection(isSlow);
        setConnectionSpeed(isSlow ? "slow" : "fast");

        if (isSlow) {
          document.body.classList.add("connection-slow");
        }
      } catch {
        // If measurement fails, assume fast connection
        setConnectionSpeed("unknown");
        setIsSlowConnection(false);
      }
    };

    checkConnection();

    // Listen for connection changes
    if ("connection" in navigator) {
      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;
      if (connection) {
        const updateConnection = () => checkConnection();
        connection.addEventListener("change", updateConnection);

        return () => {
          connection.removeEventListener("change", updateConnection);
        };
      }
    }
  }, []);

  return { connectionSpeed, isSlowConnection };
};

export default useConnectionSpeed;
