import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function LandingHeader() {
  const { user, logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [activeSection, setActiveSection] = useState(null);

  const [clickedSection, setClickedSection] = useState(null);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  const scrollToSection = (sectionId) => {
    setClickedSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    closeMobileNav();
  };

  useEffect(() => {
    const sections = ["hero", "features", "testimonials"];
    const observer = new IntersectionObserver(
      (entries) => {
        let newActive = null;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id === clickedSection) {
            newActive = entry.target.id;
          }
        });
        setActiveSection(newActive);
      },
      { threshold: 0.5 }
    );
    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [clickedSection]);

  return (
    <>
      <header
        className={`bg-green-white shadow-sm border-b ${
          activeSection ? "border-green-800" : "border-green-700"
        } sticky top-0 z-30 safe-area-top`}
      >
        <div className='container-mobile bg-white'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Link
              to='/'
              className='flex items-center space-x-2 text-xl font-bold text-gray-800 touch-target'
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
                className={`text-sm font-medium px-3 py-2 transition-all duration-200 touch-target text-green-900 hover:text-green-600 hover:bg-green-700 rounded ${
                  activeSection === "hero" ? "border-b-2 border-green-800" : ""
                }`}
              >
                Home
              </button>

              <button
                onClick={() => scrollToSection("features")}
                className={`text-sm font-medium px-3 py-2 transition-all duration-200 touch-target text-green-900 hover:text-green-600 hover:bg-green-700 rounded ${
                  activeSection === "features"
                    ? "border-b-2 border-green-800"
                    : ""
                }`}
              >
                Features
              </button>

              <button
                onClick={() => scrollToSection("testimonials")}
                className={`text-sm font-medium px-3 py-2 transition-all duration-200 touch-target text-green-900 hover:text-green-600 hover:bg-green-700 rounded ${
                  activeSection === "testimonials"
                    ? "border-b-2 border-green-800"
                    : ""
                }`}
              >
                Testimonials
              </button>

              {/* <Link
                to='/book-appointment'
                className='text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 touch-target text-green-800 hover:text-green-700 hover:bg-green-700'
              >
                Book Now
              </Link> */}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className='hidden md:flex items-center space-x-3'>
              {user ? (
                <div className='flex items-center space-x-3'>
                  <Link
                    to='/explore'
                    className='text-sm font-medium text-green-800 hover:text-green-600 px-3 py-2 rounded-lg transition-all duration-200 touch-target'
                  >
                    Explore
                  </Link>
                  <Link
                    to={
                      user.user_type === "provider"
                        ? "/provider/dashboard"
                        : "/dashboard"
                    }
                    className='text-sm font-medium text-green-800 hover:text-green-600 px-3 py-2 rounded-lg transition-all duration-200 touch-target'
                  >
                    Dashboard
                  </Link>
                  <div className='flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200'>
                    <div className='w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium'>
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className='text-sm font-medium text-gray-700'>
                      {user.email}
                    </span>
                    <button
                      onClick={logout}
                      className='text-sm text-red-600 hover:text-red-800 font-medium ml-2'
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
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

        {/* Mobile Navigation Menu */}
        {isMobileNavOpen && (
          <div className='md:hidden bg-white border-t border-green-700 shadow-lg'>
            <div className='px-4 py-4 space-y-2'>
              <button
                onClick={() => scrollToSection("hero")}
                className={`block w-full text-left px-3 py-2 text-green-800 hover:text-white hover:bg-green-700 rounded transition-all duration-200 touch-target ${
                  activeSection === "hero" ? "border-b-2 border-green-800" : ""
                }`}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className={`block w-full text-left px-3 py-2 text-green-800 hover:text-white hover:bg-green-700 rounded transition-all duration-200 touch-target ${
                  activeSection === "features"
                    ? "border-b-2 border-green-800"
                    : ""
                }`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className={`block w-full text-left px-3 py-2 text-green-800 hover:text-white hover:bg-green-700 rounded transition-all duration-200 touch-target ${
                  activeSection === "testimonials"
                    ? "border-b-2 border-green-800"
                    : ""
                }`}
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

              {user ? (
                <div className='space-y-2'>
                  <div className='px-3 py-2 bg-green-50 rounded-lg border border-green-200'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium'>
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <span className='text-sm font-medium text-gray-700'>
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <Link
                    to='/explore'
                    onClick={closeMobileNav}
                    className='block w-full text-left px-3 py-2 text-green-800 hover:text-white hover:bg-green-700 rounded transition-all duration-200 touch-target'
                  >
                    Explore
                  </Link>
                  <Link
                    to={
                      user.user_type === "provider"
                        ? "/provider/dashboard"
                        : "/dashboard"
                    }
                    onClick={closeMobileNav}
                    className='block w-full text-left px-3 py-2 text-green-800 hover:text-white hover:bg-green-700 rounded transition-all duration-200 touch-target'
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeMobileNav();
                    }}
                    className='block w-full text-left px-3 py-2 text-red-600 hover:text-red-800 rounded transition-all duration-200 touch-target'
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
