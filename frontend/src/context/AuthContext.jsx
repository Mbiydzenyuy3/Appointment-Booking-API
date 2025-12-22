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

  const login = async (
    email,
    password,
    isGoogleAuth = false,
    userData = null
  ) => {
    try {
      if (isGoogleAuth && userData) {
        // Handle Google OAuth login
        // userData should contain the user information from Google
        const decoded = {
          sub: userData.user_id,
          email: userData.email,
          user_type: userData.user_type,
          provider_id: userData.provider_id,
          name: userData.name,
          profile_picture: userData.profile_picture,
          is_new_user: userData.is_new_user || false
        };

        setUser(decoded);
        return {
          success: true,
          user_type: userData.user_type,
          is_new_user: userData.is_new_user || false
        };
      } else {
        // Handle regular email/password login
        const response = await api.post("/auth/login", { email, password });
        const { token } = response.data;

        if (token && token.split(".").length === 3) {
          localStorage.setItem("token", token);
          const decoded = jwtDecode(token);
          setUser(decoded);
          return { success: true, user_type: decoded.user_type };
        } else {
          return { success: false, message: "Invalid token received" };
        }
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
      await api.post("/auth/register", userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed"
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
