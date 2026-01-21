import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return (
      <Navigate
        to={
          user.user_type === "provider" ? "/provider/dashboard" : "/dashboard"
        }
        replace
      />
    );
  }

  return children;
};

export default AuthRoute;
