//src/routes/privateroute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If role is not allowed
  if (!allowedRoles?.includes(user?.user_type)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default PrivateRoute;
