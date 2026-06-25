import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api.js";
import { connectSocket, disconnectSocket } from "../services/socket.js";
import {
  trackLogin,
  trackRegistrationCompleted
} from "../services/analytics.js";

const Context = createContext();

export const Provider = ({ children }) => {
  // Use cached auth state for instant initial render on return visits
  const [user, setUser] = useState(() => {
    try {
      const cached = sessionStorage.getItem("auth_user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  // Skip loading state if we have a cached user (show page instantly)
  const [isLoading, setIsLoading] = useState(() => {
    try {
      return !sessionStorage.getItem("auth_user");
    } catch {
      return true;
    }
  });

  useEffect(() => {
    api
      .get("/auth/profile")
      .then((response) => {
        const userData = response.data.data;
        setUser(userData);
        // Cache for instant loads on subsequent navigations
        try {
          sessionStorage.setItem("auth_user", JSON.stringify(userData));
        } catch {
          // Storage full or unavailable — no problem
        }
        connectSocket();
      })
      .catch(() => {
        setUser(null);
        try {
          sessionStorage.removeItem("auth_user");
        } catch {
          // Ignore
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const userData = response.data.data;

      setUser(userData);
      connectSocket();

      // Track login event
      trackLogin(userData.user_id, userData.user_type);

      return { success: true, user_type: userData.user_type };
    } catch (error) {
      let message = "Login failed";
      if (!error.response) {
        message =
          "Network error: Please check your internet connection and try again.";
      } else if (error.response.status >= 500) {
        message = "Server error: Please try again later.";
      } else {
        message =
          error.response.data?.message ||
          "Login failed due to an unexpected error.";
      }
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      const newUser = response.data.data;

      setUser(newUser);
      connectSocket();

      // Track registration completion
      trackRegistrationCompleted(newUser.user_id, newUser.user_type);

      return { success: true, user_type: newUser.user_type };
    } catch (error) {
      let message = "Registration failed";
      if (!error.response) {
        message =
          "Network error: Please check your internet connection and try again.";
      } else if (error.response.status >= 500) {
        message = "Server error: Please try again later.";
      } else {
        message =
          error.response.data?.message ||
          "Registration failed due to an unexpected error.";
      }
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore errors — cookie will be cleared on the server anyway
    }
    disconnectSocket();
    setUser(null);
    try {
      sessionStorage.removeItem("auth_user");
    } catch {
      // Ignore
    }
  };

  return (
    <Context.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </Context.Provider>
  );
};

export const useAuth = () => useContext(Context);
