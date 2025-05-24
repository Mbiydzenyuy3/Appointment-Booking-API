import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api.js";
import { jwtDecode } from "jwt-decode";

const Context = createContext();

export const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ✅ Ensure token is valid format before decoding
    if (token && token.split(".").length === 3) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log("Calling /auth/login with:", { email, password });
    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("API response:", response.data);
      const { token } = response.data;
      if (token && token.split(".").length === 3) {
        localStorage.setItem("token", token);
        const decoded = jwtDecode(token);
        setUser(decoded);
        return { success: true, user_type: decoded.user_type };
      } else {
        return { success: false, message: "Invalid token received" };
      }
    } catch (error) {
      console.error("Login error:", error.response || error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post("/auth/register", userData);
      console.log("Registration success:", res);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      const fallbackMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Registration failed. Please try again.";
      return {
        success: false,
        message: fallbackMessage,
      };
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
