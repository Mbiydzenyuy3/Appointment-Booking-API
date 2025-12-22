import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import CurrencySelector from "../Common/CurrencySelector.jsx";

export default function ClientDashboardHeader() {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <header className='bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30 safe-area-top'>
      <div className='container-mobile bg-white'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <Link
            to='/'
            className='flex items-center space-x-2 text-xl font-bold text-gray-800 touch-target'
          >
            <span className='text-2xl'>📅</span>
            <span className='hidden sm:inline'>BOOKEasy</span>
            <span className='sm:hidden text-lg'>BOOKEasy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className='hidden md:flex items-center space-x-6'
            role='navigation'
            aria-label='Dashboard navigation'
          >
            <Link
              to='/dashboard'
              className='flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-green-800 transition-colors duration-200 touch-target'
            >
              <span>Dashboard</span>
            </Link>
            <Link
              to='/my-appointments'
              className='flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-green-800 transition-colors duration-200 touch-target'
            >
              <span>My Appointments</span>
            </Link>
          </nav>

          <div className='flex items-center space-x-3'>
            {/* Currency Selector */}
            <CurrencySelector />

            {/* User Profile Dropdown */}
            <div className='relative' ref={profileRef}>
              {/* Always visible profile placeholder */}
              <div
                className='flex items-center space-x-2 p-2 cursor-pointer'
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                {/* User Avatar - Always visible */}
                <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium hover:bg-blue-600 transition-colors'>
                  {user?.name
                    ? user.name.charAt(0).toUpperCase()
                    : user?.email?.charAt(0).toUpperCase()}
                </div>

                {/* Dropdown Arrow - Always visible */}
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 hover:text-gray-700 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className='absolute top-20 right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
                  <div className='py-2'>
                    {/* User Info Header */}
                    <div className='px-4 py-3 border-b border-gray-100'>
                      {/* <div className='text-sm font-medium text-gray-900'>
                        {user?.name || "User"}
                      </div> */}
                      <div className='text-sm text-gray-500 truncate'>
                        {user?.email}
                      </div>
                      <div className='text-xs text-green-600 mt-1 capitalize'>
                        {user?.user_type || "Client"}
                      </div>
                    </div>

                    {/* Menu Items */}
                    <Link
                      to='/profile'
                      onClick={() => setIsProfileOpen(false)}
                      className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                    >
                      <svg
                        className='w-4 h-4 mr-3'
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
                      My Profile
                    </Link>

                    <Link
                      to='/my-appointments'
                      onClick={() => setIsProfileOpen(false)}
                      className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                    >
                      <svg
                        className='w-4 h-4 mr-3'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                        />
                      </svg>
                      My Appointments
                    </Link>

                    <div className='border-t border-gray-100 mt-2 pt-2'>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className='flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors'
                      >
                        <svg
                          className='w-4 h-4 mr-3'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                          />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
