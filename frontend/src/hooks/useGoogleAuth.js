import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

export function useGoogleAuth() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const waitForGoogleSDK = () => {
    return new Promise((resolve, reject) => {
      console.log("Checking for Google SDK...");

      if (window.google && window.google.accounts) {
        console.log("Google SDK already loaded");
        setSdkLoaded(true);
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait

      const checkGoogle = () => {
        attempts++;
        console.log(`Google SDK check attempt ${attempts}/${maxAttempts}`);

        if (window.google && window.google.accounts) {
          console.log(
            "Google SDK loaded successfully after",
            attempts,
            "attempts"
          );
          setSdkLoaded(true);
          resolve();
        } else if (attempts >= maxAttempts) {
          console.error(
            "Google SDK failed to load after",
            maxAttempts,
            "attempts"
          );
          console.log("window.google:", window.google);
          console.log("document.readyState:", document.readyState);
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
      console.log("Google OAuth initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Google OAuth:", error);
      setSdkLoaded(false);
      throw error; // Re-throw to handle in calling function
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);

    try {
      console.log("Starting Google sign-in process...");
      console.log(
        "Google Client ID:",
        import.meta.env.VITE_GOOGLE_CLIENT_ID ? "Configured" : "Missing"
      );

      // Wait for Google SDK to load
      console.log("Waiting for Google SDK to load...");
      await waitForGoogleSDK();
      console.log("Google SDK loaded successfully");

      // Initialize if not already done
      if (!isInitialized) {
        console.log("Initializing Google OAuth...");
        await initializeGoogleAuth();
        console.log("Google OAuth initialized");
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
      console.log("Triggering Google sign-in prompt...");
      window.google.accounts.id.prompt();
    } catch (error) {
      console.error("Google sign-in error:", error);
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
      console.log("Google response received:", response);

      if (!response.credential) {
        throw new Error("No credential received from Google");
      }

      // Send token to backend
      const backendResponse = await api.post("/auth/google-auth", {
        tokenId: response.credential
      });

      if (backendResponse.data.success) {
        console.log("Google authentication successful");

        // Store token in localStorage
        localStorage.setItem("token", backendResponse.data.token);

        // Trigger login in auth context
        const userData = backendResponse.data.data;
        const loginResult = await login(userData.email, null, true, userData);

        console.log("User logged in via Google:", userData);

        // Handle routing based on user type and whether they're new
        if (loginResult.success) {
          if (userData.is_new_user) {
            // New user needs to select user type
            navigate("/select-user-type");
          } else {
            // Existing user - redirect to appropriate dashboard
            if (userData.user_type === "provider") {
              navigate("/provider/dashboard");
            } else {
              navigate("/dashboard");
            }
          }
        }
      } else {
        throw new Error(
          backendResponse.data.message || "Authentication failed"
        );
      }
    } catch (error) {
      console.error("Google authentication error:", error);

      // Show user-friendly error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Google authentication failed. Please try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGoogleButton = (elementId = "google-signin-button") => {
    if (!window.google || !isInitialized) {
      console.warn("Google SDK not loaded yet");
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
