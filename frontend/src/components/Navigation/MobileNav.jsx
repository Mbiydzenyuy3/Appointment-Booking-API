import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function MobileNav({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const navItems = [
    { name: "Home", path: "/", public: true },
    { name: "Book Appointment", path: "/book-appointment", public: false },
    { name: "My Appointments", path: "/appointments", public: false },
    { name: "Dashboard", path: "/dashboard", public: false },
    { name: "Provider Dashboard", path: "/provider/dashboard", public: false }
  ];

  const filteredNavItems = navItems.filter(
    (item) =>
      item.public ||
      (user && (item.path !== "/dashboard" || user.user_type !== "provider"))
  );

  return (
    <>
      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Mobile Navigation Panel */}
      <nav
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out safe-area-top safe-area-bottom ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role='navigation'
        aria-label='Main navigation'
      >
        {/* Navigation Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200 safe-area-top'>
          <Link
            to='/'
            className='flex items-center space-x-2 text-xl font-bold text-primary-700 touch-target'
            onClick={onClose}
          >
            <span className='text-2xl'>📅</span>
            <span>BOOKEasy</span>
          </Link>
          <button
            onClick={onClose}
            className='p-2 rounded-lg hover:bg-gray-100 focus-ring-mobile touch-target'
            aria-label='Close navigation'
          >
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
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Navigation Content */}
        <div className='flex-1 overflow-y-auto py-4'>
          {/* User Info */}
          {user && (
            <div className='px-4 py-3 bg-gray-50 border-b border-gray-200'>
              <p className='text-sm text-gray-600'>Welcome back,</p>
              <p className='font-semibold text-gray-900 truncate'>
                {user.email}
              </p>
              <p className='text-xs text-gray-500 capitalize'>
                {user.user_type}
              </p>
            </div>
          )}

          {/* Navigation Links */}
          <div className='py-2'>
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-base font-medium transition-colors duration-200 touch-target ${
                  location.pathname === item.path
                    ? "text-primary-700 bg-primary-50 border-r-4 border-primary-700"
                    : "text-gray-700 hover:text-primary-700 hover:bg-gray-50"
                }`}
                onClick={onClose}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Authentication Links */}
          <div className='border-t border-gray-200 mt-4 pt-4'>
            {!user ? (
              <div className='space-y-2 px-4'>
                <Link
                  to='/login'
                  className='block w-full text-center py-3 px-4 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 focus-ring-mobile transition-colors duration-200 touch-target'
                  onClick={onClose}
                >
                  Login
                </Link>
                <Link
                  to='/register'
                  className='block w-full text-center py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus-ring-mobile transition-colors duration-200 touch-target'
                  onClick={onClose}
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className='px-4'>
                <button
                  onClick={handleLogout}
                  className='w-full text-left py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg focus-ring-mobile transition-colors duration-200 touch-target'
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className='border-t border-gray-200 p-4 safe-area-bottom'>
          <p className='text-xs text-gray-500 text-center'>
            © {new Date().getFullYear()} BOOKEasy
          </p>
        </div>
      </nav>
    </>
  );
}
