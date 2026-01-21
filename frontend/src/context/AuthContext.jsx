import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api.js";
import { jwtDecode } from "jwt-decode";
import {
  trackLogin,
  trackRegistrationCompleted
} from "../services/analytics.js";

const Context = createContext();

export const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ✅ Ensure token is valid before decoding
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        try {
          const decoded = jwtDecode(token);
          setUser(decoded);

          // Track login event
          trackLogin(decoded.sub, decoded.user_type);

          return { success: true, user_type: decoded.user_type };
        } catch {
          localStorage.removeItem("token");
          return { success: false, message: "Invalid token received" };
        }
      } else {
        return { success: false, message: "No token received" };
      }
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
      const { token } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        try {
          const decoded = jwtDecode(token);
          setUser(decoded);

          // Track registration completion
          trackRegistrationCompleted(decoded.sub, decoded.user_type);

          return { success: true, user_type: decoded.user_type };
        } catch (decodeError) {
          console.error("Token decode error:", decodeError);
          localStorage.removeItem("token");
          return { success: false, message: "Invalid token received" };
        }
      } else {
        return { success: false, message: "No token received" };
      }
    } catch (error) {
      console.error("Register API error:", error);
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

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <Context.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </Context.Provider>
  );
};

export const useAuth = () => useContext(Context);
