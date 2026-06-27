import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Clock } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";
import nadineDjuikoImg from "../../assets/nadinedjioko.jpeg";

export default function HeroSection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const stats = [
    { icon: Users, value: "500+", label: "Verified Pros" },
    { icon: Star, value: "4.8", label: "Average Rating" },
    { icon: Clock, value: "2 min", label: "Avg. Booking Time" }
  ];

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
    <section className='relative min-h-screen bg-gradient-to-br from-[#FDF8F3] via-white to-[#F5EDE4] overflow-hidden'>
      {/* Decorative elements */}
      <div className='absolute top-20 right-10 w-72 h-72 bg-[#1B4332]/5 rounded-full blur-3xl' />
      <div className='absolute bottom-20 left-10 w-96 h-96 bg-[#D4A574]/10 rounded-full blur-3xl' />

      {/* Navigation */}
      <nav className='relative z-10 px-6 py-6 max-w-7xl mx-auto flex items-center justify-between'>
        <Link to='/' className='flex items-center gap-2'>
          <div className='w-10 h-10 bg-[#1B4332] rounded-xl flex items-center justify-center'>
            <span className='text-white font-bold text-lg'>B</span>
          </div>
          <span className='text-2xl font-bold text-[#1B4332]'>BOOKEasy</span>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden md:flex items-center gap-8'>
          <button
            onClick={() => scrollToSection("hero")}
            className='text-gray-600 hover:text-[#1B4332] transition-colors'
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection("trust")}
            className='text-gray-600 hover:text-[#1B4332] transition-colors'
          >
            Why Trust Us
          </button>
          <button
            onClick={() => scrollToSection("testimonials")}
            className='text-gray-600 hover:text-[#1B4332] transition-colors'
          >
            Reviews
          </button>
        </div>

        {/* Desktop Auth Buttons */}
        <div className='hidden md:flex items-center gap-3'>
          {user ? (
            <Link
              to={
                user.user_type === "provider"
                  ? "/provider/dashboard"
                  : "/dashboard"
              }
              className='bg-[#1B4332] hover:bg-[#2D5A45] text-white rounded-full px-6 py-2 font-medium transition-colors'
            >
              My Account
            </Link>
          ) : (
            <>
              <Link
                to='/register'
                className='bg-[#1B4332] hover:bg-[#2D5A45] text-white rounded-full px-6 py-2 font-medium transition-colors'
              >
                Sign Up
              </Link>
              <Link
                to='/login'
                className='text-[#1B4332] hover:text-[#2D5A45] border border-[#1B4332] hover:border-[#2D5A45] rounded-full px-6 py-2 font-medium transition-colors'
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileNav}
          className='md:hidden p-2 text-[#1B4332] rounded-lg hover:bg-[#1B4332]/10 transition-colors'
          aria-label='Open navigation menu'
          aria-expanded={isMobileNavOpen}
        >
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
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
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileNavOpen && (
        <div className='md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20'>
          <div className='px-6 py-4 space-y-3'>
            <button
              onClick={() => scrollToSection("hero")}
              className='block w-full text-left px-3 py-2 text-gray-600 hover:text-[#1B4332] hover:bg-[#1B4332]/5 rounded transition-colors'
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("trust")}
              className='block w-full text-left px-3 py-2 text-gray-600 hover:text-[#1B4332] hover:bg-[#1B4332]/5 rounded transition-colors'
            >
              Why Trust Us
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className='block w-full text-left px-3 py-2 text-gray-600 hover:text-[#1B4332] hover:bg-[#1B4332]/5 rounded transition-colors'
            >
              Reviews
            </button>

            <hr className='my-4 border-gray-200' />

            {user ? (
              <Link
                to={
                  user.user_type === "provider"
                    ? "/provider/dashboard"
                    : "/dashboard"
                }
                onClick={closeMobileNav}
                className='block w-full text-center bg-[#1B4332] hover:bg-[#2D5A45] text-white rounded-full px-6 py-3 font-medium transition-colors'
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to='/register'
                  onClick={closeMobileNav}
                  className='block w-full text-center bg-[#1B4332] hover:bg-[#2D5A45] text-white rounded-full px-6 py-3 font-medium transition-colors'
                >
                  Sign Up
                </Link>
                <Link
                  to='/login'
                  onClick={closeMobileNav}
                  className='block w-full text-center text-[#1B4332] hover:text-[#2D5A45] border border-[#1B4332] hover:border-[#2D5A45] rounded-full px-6 py-3 font-medium transition-colors'
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hero Content */}
      <div className='relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-16 lg:pt-24'>
        <div className='grid lg:grid-cols-2 gap-8 items-center'>
          <div className='max-w-3xl'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className='inline-flex items-center gap-2 px-4 py-2 bg-[#D4A574]/20 text-[#8B6914] rounded-full text-sm font-medium mb-6'>
                <span className='w-2 h-2 bg-[#D4A574] rounded-full animate-pulse' />
                Now live in Douala, Yaoundé & Buea
              </span>
            </motion.div>

            <motion.h1
              className='text-4xl md:text-6xl lg:text-7xl font-bold text-[#1B4332] leading-tight mb-6'
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Stop Wasting Credit on{" "}
              <span className='relative'>
                <span className='relative z-10'>Unanswered Calls.</span>
                <span className='absolute bottom-2 left-0 w-full h-4 bg-[#D4A574]/30 -z-0' />
              </span>
            </motion.h1>

            <motion.p
              className='text-lg md:text-xl text-gray-600 mb-10 leading-relaxed'
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Find trusted barbers, doctors, and coaches in Douala, Yaoundé, and
              Buea. Book instantly, pay securely, and skip the waiting line.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              className='bg-white rounded-2xl shadow-2xl shadow-[#1B4332]/10 p-3 md:p-4 mb-10'
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className='flex flex-col md:flex-row gap-3'>
                <button
                  onClick={() => navigate("/explore")}
                  className='h-14 px-8 flex items-center justify-center gap-4 text-white rounded-xl font-semibold transition-colors bg-green-800 z-50'
                >
                  Find Available Services
                  <ArrowRight className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform' />
                </button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className='flex flex-wrap gap-8'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-[#1B4332]/10 rounded-xl flex items-center justify-center'>
                    <stat.icon className='w-5 h-5 text-[#1B4332]' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-[#1B4332]'>
                      {stat.value}
                    </p>
                    <p className='text-sm text-gray-500'>{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Success Story Image */}
          <motion.div
            className='hidden lg:block'
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className='relative'>
              <img
                src={nadineDjuikoImg}
                alt='Happy Cameroonian business owner smiling with phone showing BOOKEasy results'
                className='w-full h-[32rem] object-cover rounded-2xl shadow-2xl'
              />
              <div className='absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg'>
                <div className='flex items-center gap-3 mb-3'>
                  <div className='w-10 h-10 bg-[#D4A574] rounded-full flex items-center justify-center'>
                    <span className='text-white text-lg'>📈</span>
                  </div>
                  <div>
                    <p className='font-bold text-gray-900 text-lg'>
                      Nadine Djuiko's hair braiding salon
                    </p>
                    <p className='text-sm text-[#1B4332] font-medium'>
                      Douala, Cameroon
                    </p>
                  </div>
                </div>
                <p className='text-gray-700 font-medium mb-3'>
                  "Bookings increased more than I could have imagined with
                  BOOKEasy!"
                </p>
                <div className='flex items-center gap-2'>
                  <span className='text-xs bg-[#1B4332] text-white px-3 py-1 rounded-full font-medium'>
                    Success Story
                  </span>
                  <span className='text-xs bg-[#D4A574] text-white px-3 py-1 rounded-full font-medium'>
                    3 Months
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
