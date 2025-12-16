import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import MobileNav from "./MobileNav.jsx";

export default function ResponsiveHeader() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <header className='bg-green-800 shadow-sm border-b border-gray-200 sticky top-0 z-30 safe-area-top'>
        <div className='container-mobile'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Link
              to='/'
              className='flex items-center space-x-2 text-xl font-bold text-primary-700 touch-target'
              onClick={closeMobileNav}
            >
              <span className='text-2xl'>📅</span>
              <span className='hidden xs:inline text-white'>BOOKEasy</span>
              <span className='xs:hidden'>BOOKEasy</span>
            </Link>

            {/* Desktop Navigation */}
            <nav
              className='hidden md:flex items-center space-x-8 text-white'
              role='navigation'
              aria-label='Main navigation'
            >
              <Link
                to='/'
                className={`text-sm font-medium transition-colors duration-200 touch-target ${
                  isActivePath("/")
                    ? "text-primary-700 border-b-2 border-primary-700 pb-1"
                    : "text-gray-white hover:text-primary-700"
                }`}
              >
                Home
              </Link>

              {!user && (
                <>
                  <Link
                    to='/book-appointment'
                    className='text-sm font-medium text-white hover:text-primary-700 transition-colors duration-200 touch-target'
                  >
                    Book Now
                  </Link>
                </>
              )}

              {user && (
                <>
                  <Link
                    to='/appointments'
                    className={`text-sm font-medium transition-colors duration-200 touch-target ${
                      isActivePath("/appointments")
                        ? "text-primary-700"
                        : "text-white hover:text-primary-700"
                    }`}
                  >
                    My Appointments
                  </Link>

                  <Link
                    to={
                      user.user_type === "provider"
                        ? "/provider/dashboard"
                        : "/dashboard"
                    }
                    className={`text-sm font-medium transition-colors duration-200 touch-target ${
                      isActivePath("/dashboard") ||
                      isActivePath("/provider/dashboard")
                        ? "text-primary-700"
                        : "text-white hover:text-primary-700"
                    }`}
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className='hidden md:flex items-center space-x-4'>
              {!user ? (
                <>
                  <Link
                    to='/login'
                    className='text-sm font-medium text-white hover:text-primary-700 transition-colors duration-200 touch-target'
                  >
                    Login
                  </Link>
                  <Link
                    to='/register'
                    className='btn btn-primary text-sm px-4 py-2 touch-target'
                  >
                    Register
                  </Link>
                </>
              ) : (
                <div className='flex items-center space-x-4'>
                  <span className='text-sm text-white hidden lg:inline'>
                    {user.email}
                  </span>
                  <button
                    onClick={() => (window.location.href = "/api/logout")} // Using direct href to trigger logout
                    className='btn btn-secondary text-sm px-4 py-2 touch-target hover:bg-green-600 hover: text-white transition-colors duration-200'
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileNav}
              className='md:hidden p-2 rounded-lg hover:bg-gray-100 focus-ring-mobile touch-target'
              aria-label='Open navigation menu'
              aria-expanded={isMobileNavOpen}
              aria-controls='mobile-navigation'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                {isMobileNavOpen ? (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                ) : (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isMobileNavOpen} onClose={closeMobileNav} />
    </>
  );
}
