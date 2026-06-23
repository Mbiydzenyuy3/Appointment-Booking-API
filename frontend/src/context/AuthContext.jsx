import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api.js";
import {
  trackLogin,
  trackRegistrationCompleted
} from "../services/analytics.js";

const Context = createContext();

export const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/profile")
      .then((response) => {
        setUser(response.data.data);
      })
      .catch(() => {
        setUser(null);
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
    setUser(null);
  };

  return (
    <Context.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </Context.Provider>
  );
};

export const useAuth = () => useContext(Context);
