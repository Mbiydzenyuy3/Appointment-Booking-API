import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";

export default function UserTypeSelection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUserTypeSelect = async (selectedUserType) => {
    setIsLoading(true);
    setError("");

    try {
      // Update user type in the backend
      const response = await api.put("/auth/update-user-type", {
        user_type: selectedUserType
      });

      if (response.data.success) {
        // Navigate to appropriate dashboard
        if (selectedUserType === "provider") {
          navigate("/provider/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(response.data.message || "Failed to update user type");
      }
    } catch (error) {
      console.error("Error updating user type:", error);
      setError(
        error.response?.data?.message ||
          "Failed to update user type. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-green-200 py-6 px-4 safe-area-bottom'>
      <div className='bg-white shadow-xl rounded-2xl w-full max-w-md p-6 sm:p-8'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='text-6xl mb-4'>🎯</div>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'>
            Choose Your Account Type
          </h1>
          <p className='text-gray-600'>
            Welcome {user?.name}! Select how you'd like to use BOOKEasy
          </p>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <p className='text-sm text-red-700 text-center flex items-center justify-center'>
              <svg
                className='w-4 h-4 mr-2'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* User Type Options */}
        <div className='space-y-4'>
          {/* Client Option */}
          <button
            onClick={() => handleUserTypeSelect("client")}
            disabled={isLoading}
            className='w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <div className='flex items-center space-x-4'>
              <div className='text-4xl'>👤</div>
              <div className='flex-1'>
                <h3 className='text-xl font-semibold text-gray-900 mb-1'>
                  Client
                </h3>
                <p className='text-gray-600 text-sm'>
                  Book appointments with service providers and manage your
                  bookings
                </p>
              </div>
              <div className='text-green-600'>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </div>
            </div>
          </button>

          {/* Provider Option */}
          <button
            onClick={() => handleUserTypeSelect("provider")}
            disabled={isLoading}
            className='w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <div className='flex items-center space-x-4'>
              <div className='text-4xl'>🏢</div>
              <div className='flex-1'>
                <h3 className='text-xl font-semibold text-gray-900 mb-1'>
                  Provider
                </h3>
                <p className='text-gray-600 text-sm'>
                  Offer your services, manage appointments, and grow your
                  business
                </p>
              </div>
              <div className='text-green-600'>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className='mt-6 text-center'>
            <div className='loading-spinner mx-auto mb-2'></div>
            <p className='text-sm text-gray-600'>Setting up your account...</p>
          </div>
        )}

        {/* Additional Info */}
        <div className='mt-8 pt-6 border-t border-gray-200'>
          <p className='text-xs text-gray-500 text-center'>
            You can change your account type later in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}
