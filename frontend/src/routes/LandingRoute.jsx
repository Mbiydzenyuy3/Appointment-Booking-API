import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LandingRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='loading-spinner mx-auto mb-4 w-8 h-8'></div>
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    if (user.user_type === "client") {
      return <Navigate to='/dashboard' replace />;
    } else if (user.user_type === "provider") {
      return <Navigate to='/provider/dashboard' replace />;
    } else {
      return <Navigate to='/select-user-type' replace />;
    }
  }

  return children;
};

export default LandingRoute;
