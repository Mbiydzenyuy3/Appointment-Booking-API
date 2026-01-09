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
    const token = sessionStorage.getItem("token");

    // ✅ Ensure token is valid before decoding
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error("Invalid token:", err);
        sessionStorage.removeItem("token");
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
        sessionStorage.setItem("token", token);
        try {
          const decoded = jwtDecode(token);
          setUser(decoded);

          // Track login event
          trackLogin(decoded.sub, decoded.user_type);

          return { success: true, user_type: decoded.user_type };
        } catch {
          sessionStorage.removeItem("token");
          return { success: false, message: "Invalid token received" };
        }
      } else {
        return { success: false, message: "No token received" };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed"
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      const { token } = response.data;

      if (token && token.split(".").length === 3) {
        localStorage.setItem("token", token);
        const decoded = jwtDecode(token);
        setUser(decoded);

        // Track registration completion
        trackRegistrationCompleted(decoded.sub, decoded.user_type);

        return { success: true, user_type: decoded.user_type };
      } else {
        return { success: false, message: "Invalid token received" };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed"
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <Context.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </Context.Provider>
  );
};

export const useAuth = () => useContext(Context);
