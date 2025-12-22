import { useState } from "react";
import api from "../services/api.js";

export function useGoogleAuthDebug() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const waitForGoogleSDK = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) {
        setSdkLoaded(true);
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait

      const checkGoogle = () => {
        attempts++;

        if (window.google && window.google.accounts) {
          setSdkLoaded(true);
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error("Google SDK failed to load"));
        } else {
          setTimeout(checkGoogle, 100);
        }
      };

      checkGoogle();
    });
  };

  const initializeGoogleAuth = async () => {
    if (isInitialized) return;

    try {
      // Check if Google Client ID is configured
      if (
        !import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        import.meta.env.VITE_GOOGLE_CLIENT_ID === "your_google_client_id_here"
      ) {
        throw new Error(
          "Google Client ID is not configured. Please update VITE_GOOGLE_CLIENT_ID in your .env file."
        );
      }

      await waitForGoogleSDK();

      // Configure Google Sign-In
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      setIsInitialized(true);
    } catch (error) {
      setSdkLoaded(false);
      throw error; // Re-throw to handle in calling function
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);

    try {
      // Wait for Google SDK to load

      await waitForGoogleSDK();

      // Initialize if not already done
      if (!isInitialized) {
        await initializeGoogleAuth();
      }

      if (!window.google || !window.google.accounts) {
        throw new Error(
          "Google SDK not properly initialized. Please refresh the page and try again."
        );
      }

      // Render the Google sign-in button if container exists
      const buttonContainer = document.getElementById("google-signin-button");
      if (buttonContainer && !buttonContainer.hasChildNodes()) {
        window.google.accounts.id.renderButton(buttonContainer, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "continue_with",
          locale: "en"
        });
      }

      // Automatically trigger sign-in

      window.google.accounts.id.prompt();
    } catch (error) {
      setIsLoading(false);

      // Show user-friendly error message
      let errorMessage = "Google sign-in failed. Please try again.";

      if (error.message.includes("Client ID")) {
        errorMessage =
          "Google authentication is not configured. Please contact support.";
      } else if (error.message.includes("not loaded")) {
        errorMessage =
          "Google sign-in is not available. Please try again later or use email/password login.";
      } else if (error.message.includes("SDK failed to load")) {
        errorMessage =
          "Unable to load Google authentication. Please check your internet connection and try again.";
      }

      alert(errorMessage);
    }
  };

  const handleGoogleResponse = async (response) => {
    try {
      if (!response.credential) {
        throw new Error("No credential received from Google");
      }

      const backendResponse = await api.post("/debug-auth/google-auth-debug", {
        tokenId: response.credential
      });

      if (backendResponse.data.success) {
        alert(`Debug Success! Check console for details.`);
      } else {
        throw new Error(
          backendResponse.data.message || "Debug authentication failed"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Debug Google authentication failed. Please try again.";

      alert(`Debug Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGoogleButton = (elementId = "google-signin-button") => {
    if (!window.google || !isInitialized) {
      return null;
    }

    return window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "continue_with",
        locale: "en"
      }
    );
  };

  return {
    signInWithGoogle,
    initializeGoogleAuth,
    renderGoogleButton,
    waitForGoogleSDK,
    isLoading,
    isInitialized,
    sdkLoaded
  };
}
