import React from "react";
import { useNavigate } from "react-router-dom";

const UserTypeSelection = () => {
  const navigate = useNavigate();

  const handleUserTypeSelect = (userType) => {
    // Store the selected user type temporarily
    sessionStorage.setItem("selectedUserType", userType);
    // Navigate to the appropriate registration page
    navigate(`/register/${userType}`);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Welcome to BookEasy
          </h1>
          <p className='text-gray-600'>
            Choose how you'd like to use our platform
          </p>
        </div>

        <div className='space-y-4'>
          <button
            onClick={() => handleUserTypeSelect("client")}
            className='w-full p-6 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group'
          >
            <div className='flex items-center space-x-4'>
              <div className='flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors'>
                <svg
                  className='w-6 h-6 text-blue-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
              </div>
              <div className='text-left'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  I'm a Client
                </h3>
                <p className='text-gray-600 text-sm'>
                  I want to book appointments with service providers
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleUserTypeSelect("provider")}
            className='w-full p-6 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group'
          >
            <div className='flex items-center space-x-4'>
              <div className='flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors'>
                <svg
                  className='w-6 h-6 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                  />
                </svg>
              </div>
              <div className='text-left'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  I'm a Provider
                </h3>
                <p className='text-gray-600 text-sm'>
                  I want to offer services and manage appointments
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className='mt-8 text-center'>
          <p className='text-sm text-gray-500'>
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className='text-blue-600 hover:text-blue-500 font-medium'
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
