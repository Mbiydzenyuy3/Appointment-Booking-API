import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/Common/PageLoader.jsx";

const AuthRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;

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
