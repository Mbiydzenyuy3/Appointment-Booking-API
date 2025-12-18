import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import MobileNav from "./MobileNav.jsx";

export default function ResponsiveHeader() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    closeMobileNav();
  };

  return (
    <>
      <header className='bg-green-white shadow-sm border-b border-green-700 sticky top-0 z-30 safe-area-top'>
        <div className='container-mobile bg-white'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Link
              to='/'
              className='flex items-center space-x-2 text-xl font-bold text-black touch-target'
              onClick={closeMobileNav}
            >
              <span className='text-2xl'>📅</span>
              <span className='hidden sm:inline'>BOOKEasy</span>
              <span className='sm:hidden text-lg'>BOOKEasy</span>
            </Link>

            {/* Desktop Navigation */}
            <nav
              className='hidden md:flex items-center space-x-6'
              role='navigation'
              aria-label='Main navigation'
            >
              <Link
                to='/'
                className={`text-sm font-medium px-3 py-2 transition-all duration-200 touch-target ${
                  isActivePath("/")
                    ? "text-green-800 border-b-2 border-green-800"
                    : "text-green-800 hover:text-white hover:bg-green-700"
                }`}
              >
                Home
              </Link>

              {!user && (
                <Link
                  to='/book-appointment'
                  className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 touch-target ${
                    isActivePath("/book-appointment")
                      ? "text-green-800"
                      : "text-green-800"
                  }`}
                >
                  Book Now
                </Link>
              )}

              {user && (
                <>
                  <Link
                    to='/appointments'
                    className={`text-sm font-medium px-3 py-2 transition-all duration-200 touch-target ${
                      isActivePath("/appointments")
                        ? "text-gray-800"
                        : "text-gray-800 hover:text-green-800"
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
                    className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 touch-target ${
                      isActivePath("/dashboard") ||
                      isActivePath("/provider/dashboard")
                        ? "text-green-800 bg-green-100"
                        : "text-gray-800 hover:text-green-800"
                    }`}
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className='hidden md:flex items-center space-x-3'>
              {!user ? (
                <>
                  <Link
                    to='/register'
                    className='btn btn-primary text-sm px-4 py-2 touch-target shadow-sm'
                  >
                    Register
                  </Link>
                  <Link
                    to='/login'
                    className='text-sm font-medium text-green-800 hover:text-white px-4 py-2 rounded-lg hover:bg-green-800 border border-green-800 transition-all duration-200 touch-target'
                  >
                    Login
                  </Link>
                </>
              ) : (
                <div className='flex items-center space-x-3'>
                  <span className='text-sm text-gray-800 hidden lg:inline truncate max-w-32'>
                    {user.email}
                  </span>
                  <div className='flex items-center space-x-3'>
                    <button
                      onClick={handleLogout}
                      className='text-sm flex items-center gap-1 font-medium bg-green-800 text-green-800 hover:text-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 touch-target z-10 border border-green-700'
                    >
                      Logout
                      <span className='logout-icon'>
                        <svg
                          height='24'
                          width='24'
                          viewBox='0 0 24 24'
                          xmlns='http://www.w3.org/2000/svg'
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
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileNav}
              className='md:hidden p-2 text-black rounded-lg hover:bg-green-800 focus-ring-mobile touch-target transition-all duration-200'
              aria-label='Open navigation menu'
              aria-expanded={isMobileNavOpen}
              aria-controls='mobile-navigation'
            >
              <svg
                className='w-6 h-6 text-black'
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
