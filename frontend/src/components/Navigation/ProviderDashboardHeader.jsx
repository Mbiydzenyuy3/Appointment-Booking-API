import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import CurrencySelector from "../Common/CurrencySelector.jsx";
import {
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

export default function ProviderDashboardHeader() {
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
          <Link to='/' className='flex items-center gap-2'>
            <div className='w-10 h-10 bg-[#1B4332] rounded-xl flex items-center justify-center'>
              <span className='text-white font-bold text-lg'>B</span>
            </div>
            <span className='text-2xl font-bold text-[#1B4332]'>BOOKEasy</span>
            <span className='sm:hidden text-lg'>BOOKEasy</span>
          </Link>
          {/* Desktop Navigation */}
          <nav
            className='hidden md:flex items-center space-x-6'
            role='navigation'
            aria-label='Provider dashboard navigation'
          >
            <Link
              to='/provider/dashboard'
              className='text-sm font-medium px-3 py-2 transition-all duration-200 touch-target text-gray-800 hover:text-green-600 hover:bg-green-50 rounded'
            >
              Dashboard
            </Link>

            {/* <Link
              to='/appointments'
              className='text-sm font-medium px-3 py-2 transition-all duration-200 touch-target text-gray-800 hover:text-green-600 hover:bg-green-50 rounded'
            >
              Appointments
            </Link> */}
          </nav>

          <div className='flex items-center space-x-3'>
            <CurrencySelector />

            <div className='relative' ref={profileRef}>
              <div
                className='flex items-center space-x-2 p-2 cursor-pointer'
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium hover:bg-green-600 transition-colors'>
                  {user?.name
                    ? user.name.charAt(0).toUpperCase()
                    : user?.email?.charAt(0).toUpperCase()}
                </div>

                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 hover:text-gray-700 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className='absolute right-0 top-16 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
                  <div className='py-2'>
                    <div className='px-4 py-3 border-b border-gray-100'>
                      <div className='text-sm font-medium text-gray-900'>
                        {user?.name || "Provider"}
                      </div>
                      <div className='text-sm text-gray-500 truncate'>
                        {user?.email}
                      </div>
                      <div className='text-xs text-green-600 mt-1 capitalize'>
                        {user?.user_type || "Provider"}
                      </div>
                    </div>

                    <Link
                      to='/provider/profile'
                      onClick={() => setIsProfileOpen(false)}
                      className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                    >
                      <UserIcon className='w-4 h-4 mr-3' />
                      My Profile
                    </Link>
                    {/* 
                    <Link
                      to='/appointments'
                      onClick={() => setIsProfileOpen(false)}
                      className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                    >
                      <CalendarDaysIcon className='w-4 h-4 mr-3' />
                      Appointment Requests
                    </Link> */}

                    {/* <Link
                      to='/timeslots'
                      onClick={() => setIsProfileOpen(false)}
                      className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                    >
                      <ClockIcon className='w-4 h-4 mr-3' />
                      Time Slots
                    </Link> */}

                    <div className='border-t border-gray-100 mt-2 pt-2'>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className='flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors'
                      >
                        <ArrowRightOnRectangleIcon className='w-4 h-4 mr-3' />
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
