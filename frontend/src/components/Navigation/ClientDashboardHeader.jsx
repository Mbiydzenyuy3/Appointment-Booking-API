import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import CurrencySelector from "../Common/CurrencySelector.jsx";

export default function ClientDashboardHeader() {
  const { user, logout } = useAuth();

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

          {/* Right Side - Currency Selector & User Menu */}
          <div className='flex items-center space-x-3'>
            {/* Currency Selector */}
            <CurrencySelector />

            {/* User Info */}
            <div className='hidden lg:flex items-center space-x-3'>
              <span className='text-sm text-gray-600 truncate max-w-32'>
                {user?.email}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className='flex items-center gap-1 text-sm font-medium bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-lg transition-all duration-200 touch-target'
            >
              <svg
                height='16'
                width='16'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
                className='logout-icon'
              >
                <g
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                >
                  <path d='M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2' />
                  <path d='M9 12h12l-3-3m0 6l3-3' />
                </g>
              </svg>
              <span className='hidden sm:inline'>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
