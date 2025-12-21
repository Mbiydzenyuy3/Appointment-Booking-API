import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function LandingHeader() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
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
              <button
                onClick={() => scrollToSection("hero")}
                className='text-sm font-medium px-3 py-2 transition-all duration-200 touch-target text-green-800 hover:text-white hover:bg-green-700 rounded'
              >
                Home
              </button>

              <button
                onClick={() => scrollToSection("features")}
                className='text-sm font-medium px-3 py-2 transition-all duration-200 touch-target text-green-800 hover:text-white hover:bg-green-700 rounded'
              >
                Features
              </button>

              <button
                onClick={() => scrollToSection("testimonials")}
                className='text-sm font-medium px-3 py-2 transition-all duration-200 touch-target text-green-800 hover:text-white hover:bg-green-700 rounded'
              >
                Testimonials
              </button>

              <Link
                to='/book-appointment'
                className='text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 touch-target text-green-800 hover:text-white hover:bg-green-700'
              >
                Book Now
              </Link>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className='hidden md:flex items-center space-x-3'>
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

        {/* Mobile Navigation Menu */}
        {isMobileNavOpen && (
          <div className='md:hidden bg-white border-t border-green-700 shadow-lg'>
            <div className='px-4 py-4 space-y-2'>
              <button
                onClick={() => scrollToSection("hero")}
                className='block w-full text-left px-3 py-2 text-green-800 hover:text-white hover:bg-green-700 rounded transition-all duration-200 touch-target'
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className='block w-full text-left px-3 py-2 text-green-800 hover:text-white hover:bg-green-700 rounded transition-all duration-200 touch-target'
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className='block w-full text-left px-3 py-2 text-green-800 hover:text-white hover:bg-green-700 rounded transition-all duration-200 touch-target'
              >
                Testimonials
              </button>

              <Link
                to='/book-appointment'
                onClick={closeMobileNav}
                className='block w-full text-left px-3 py-2 text-green-800 hover:text-white hover:bg-green-700 rounded transition-all duration-200 touch-target'
              >
                Book Now
              </Link>

              <hr className='my-4 border-green-200' />

              <Link
                to='/register'
                onClick={closeMobileNav}
                className='block w-full text-left px-3 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-all duration-200 touch-target text-center font-medium'
              >
                Register
              </Link>
              <Link
                to='/login'
                onClick={closeMobileNav}
                className='block w-full text-left px-3 py-2 text-green-800 hover:text-white hover:bg-green-700 rounded transition-all duration-200 touch-target text-center font-medium border border-green-700'
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
