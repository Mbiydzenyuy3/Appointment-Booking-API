import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const PrivateRoute = ({ children, allowedRoles }) => {
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

  // If not logged in
  if (!user) {
    return <Navigate to='/login' replace />;
  }

  // If role checking is required but no roles specified, allow all authenticated users
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.user_type;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to='/unauthorized' replace />;
    }
  }

  return children;
};

export default PrivateRoute;
