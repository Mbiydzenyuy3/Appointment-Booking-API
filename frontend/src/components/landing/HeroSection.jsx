import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, ArrowRight, Star, Users, Clock } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function HeroSection() {
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
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
          </div>
        </div>
      )}

      {/* Hero Content */}
      <div className='relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 lg:pt-24'>
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
              <div className='flex-1 relative flex pl-3'>
                <Search className='absolute left-2 top-1/2 right-3 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <Input
                  placeholder='What do you need? (e.g., Barber, Dentist, Makeup)'
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className='pl-10 h-14 border-0 bg-gray-50 rounded-xl text-gray-600 focus-visible:ring-[#1B4332]'
                />
              </div>
              <div className='flex-1 relative pl-4'>
                <MapPin className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <Input
                  placeholder='Where? (e.g., Akwa, Bonanjo, Molyko)'
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className='pl-12 pr-4 h-14 border-0 bg-gray-50 text-gray-600 rounded-xl text-shadow-gray-500 focus-visible:ring-[#1B4332]'
                />
              </div>
              <button
                onClick={() => {
                  const params = new URLSearchParams();
                  if (service.trim()) params.append("service", service.trim());
                  if (location.trim())
                    params.append("location", location.trim());
                  const queryString = params.toString();
                  navigate(
                    queryString ? `/services?${queryString}` : "/services"
                  );
                }}
                className='h-14 px-8 flex items-center justify-center gap-4 text-white rounded-xl font-semibold transition-colors bg-green-800 z-50'
              >
                Find Appointments
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
      </div>

      {/* Success Story Image */}
      <motion.div
        className='hidden lg:block absolute right-8 top-1/4 w-96'
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className='relative'>
          <img
            src='https://scontent-los2-1.xx.fbcdn.net/v/t39.30808-6/514264380_717675361057900_7905008741915973508_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFFcQeaVIsxVPEhksmCKBoKbIP1fxMyPmFsg_V_EzI-YRcHWpuhlbroylS_JqiZOQiwxb1sdIxi4aAE7w02c-8X&_nc_ohc=B7HLGnHwJF4Q7kNvwFGNBnd&_nc_oc=AdliZiNX8lYUTeLMMPeo_kQxZsjBoYoqPn0UkuiTDV5XVve7w3aGJG4ONm4A2PJaVZzoK3j3FjYG2thGR_xuhxKF&_nc_zt=23&_nc_ht=scontent-los2-1.xx&_nc_gid=5HPMrngLO4bZ2SylL5-8wA&oh=00_AfrY2omDXQ8Zual55tP201w-t6hWKH_ynLIWc8vPm_yU1Q&oe=69641264'
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
    </section>
  );
}
