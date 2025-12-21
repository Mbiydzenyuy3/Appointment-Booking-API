import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export function useGoogleAuth() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeGoogleAuth = () => {
    if (isInitialized || !window.google) return;

    try {
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
    }
  };

  const signInWithGoogle = async () => {
    if (!isInitialized) {
      initializeGoogleAuth();
    }

    setIsLoading(true);

    try {
      if (!window.google) {
        throw new Error("Google SDK not loaded. Please refresh the page and try again.");
      }

      // Use Google's ID token flow
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "continue_with",
          locale: "en"
        }
      );

      // Trigger the Google sign-in flow
      window.google.accounts.id.prompt();
    } catch (error) {
      console.error("Google sign-in error:", error);
      setIsLoading(false);
      
      // Show user-friendly error message
      alert("Google sign-in is not available. Please try again later or use email/password login.");
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
        await login(userData.email, null, true, userData);
        
        console.log("User logged in via Google:", userData);
      } else {
        throw new Error(backendResponse.data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Google authentication error:", error);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || error.message || "Google authentication failed. Please try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGoogleButton = (elementId = "google-signin-button") => {
    if (!window.google) {
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
    isLoading,
    isInitialized
  };
}