// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
// import Header from "../components/Header.jsx"
import Footer from "../components/Footer.jsx";

export default function HomePage() {
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <header className='bg-green-900 shadow-md'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-white'>📅 BOOKEasy</h1>
          <nav className='space-x-4'>
            <Link
              to='/register'
              className='bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800'
            >
              Register
            </Link>
            <Link
              to='/login'
              className='text-white border border-green-700 px-4 py-2 rounded hover:text-green-600 hover:bg-white'
            >
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main className='min-h-80 flex-grow flex items-center justify-center hero-overlay relative background-landing'>
        <div className='overlay flex items-center justify-center'>
          <div className='text-center px-4 content'>
            <h2 className='text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-lg'>
              Seamless Appointment Booking
            </h2>
            <p className='text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md'>
              Connect with providers effortlessly. Book, manage, and receive
              real-time updates with our intuitive platform designed to grow
              your business.{" "}
            </p>
            <div className='space-x-4'>
              <Link
                to='/register'
                className='bg-green-700 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold text-lg shadow-lg button-index'
              >
                Book Your First Appointment{" "}
              </Link>
              <Link
                to='/demo'
                className='border-2 border-green-400/50 text-white px-8 py-4 rounded-lg hover:bg-green-700/50 transition-all duration-200 font-semibold text-lg backdrop-blur-sm'
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* --- NEW: SOCIAL PROOF / TRUSTED BY --- */}
      <div className='bg-white border-b border-gray-100 py-8'>
        <div className='max-w-7xl mx-auto px-4 text-center'>
          <p className='text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6'>
            Trusted by 2,000+ Businesses
          </p>
          <div className='flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500'>
            {/* Placeholders for Logos - Replace with <img> tags */}
            <span className='text-xl font-bold text-gray-600'>SalonLuxe</span>
            <span className='text-xl font-bold text-gray-600'>UrbanSpa</span>
            <span className='text-xl font-bold text-gray-600'>BarberCo</span>
            <span className='text-xl font-bold text-gray-600'>
              WellnessFlow
            </span>
            <span className='text-xl font-bold text-gray-600'>StyleStudio</span>
          </div>
        </div>
      </div>

      {/* --- EXISTING SECTION (Technical Features) --- */}
      <section className='bg-white py-16'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='text-center mb-12'>
            <h3 className='text-3xl font-bold text-gray-900'>
              Platform Essentials
            </h3>
            <p className='text-gray-500 mt-2'>
              Built with performance and security in mind.
            </p>
          </div>
          <div className='grid md:grid-cols-3 gap-8 text-center'>
            <div className='p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition'>
              <div className='w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl'></div>
              <h3 className='text-xl font-bold text-gray-800 mb-2'>
                Secure Authentication
              </h3>
              <p className='text-gray-600'>
                Protect your data with enterprise-grade JWT-based
                authentication.
              </p>
            </div>
            <div className='p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition'>
              <div className='w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl'></div>
              <h3 className='text-xl font-bold text-gray-800 mb-2'>
                Real-Time Notifications
              </h3>
              <p className='text-gray-600'>
                Stay updated with instant alerts via WebSockets whenever a
                booking happens.
              </p>
            </div>
            <div className='p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition'>
              <div className='w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl'></div>
              <h3 className='text-xl font-bold text-gray-800 mb-2'>
                Provider Management
              </h3>
              <p className='text-gray-600'>
                View available slots, manage staff shifts, and organize
                appointments efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- NEW: COMPREHENSIVE FEATURES (Inspired by BookInBeautiful Grid) --- */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='text-center max-w-3xl mx-auto mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-green-900 mb-4'>
              Run Your Business Like a Pro
            </h2>
            <p className='text-lg text-gray-600'>
              Everything you need to manage clients, payments, and marketing in
              one place.
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {/* Feature 1 */}
            <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
              <h4 className='text-lg font-bold text-green-800 mb-3 border-b border-green-100 pb-2'>
                Taking Care of Clients
              </h4>
              <ul className='space-y-3 text-gray-600'>
                <li className='flex items-center'>✓ Online Calendar 24/7</li>
                <li className='flex items-center'>✓ Client Profiles (CRM)</li>
                <li className='flex items-center'>✓ Consultation Forms</li>
              </ul>
            </div>
            {/* Feature 2 */}
            <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
              <h4 className='text-lg font-bold text-green-800 mb-3 border-b border-green-100 pb-2'>
                Manage Operations
              </h4>
              <ul className='space-y-3 text-gray-600'>
                <li className='flex items-center'>✓ Staff Management</li>
                <li className='flex items-center'>✓ Inventory Tracking</li>
                <li className='flex items-center'>✓ Performance Reports</li>
              </ul>
            </div>
            {/* Feature 3 */}
            <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
              <h4 className='text-lg font-bold text-green-800 mb-3 border-b border-green-100 pb-2'>
                Secure Revenue
              </h4>
              <ul className='space-y-3 text-gray-600'>
                <li className='flex items-center'>✓ No-Show Protection</li>
                <li className='flex items-center'>✓ Online Payments</li>
                <li className='flex items-center'>✓ Gift Cards & Deposits</li>
              </ul>
            </div>
            {/* Feature 4 */}
            <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
              <h4 className='text-lg font-bold text-green-800 mb-3 border-b border-green-100 pb-2'>
                Boost Your Brand
              </h4>
              <ul className='space-y-3 text-gray-600'>
                <li className='flex items-center'>✓ Custom Website</li>
                <li className='flex items-center'>✓ Review Booster</li>
                <li className='flex items-center'>
                  ✓ Social Media Integration
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- NEW: ALTERNATING HIGHLIGHTS (Inspired by BookInBeautiful "Highlights") --- */}
      <section className='py-20 bg-white overflow-hidden'>
        <div className='max-w-7xl mx-auto px-4 space-y-24'>
          {/* Highlight 1: Image Right, Text Left */}
          <div className='flex flex-col md:flex-row items-center gap-12'>
            <div className='md:w-1/2'>
              <span className='text-green-600 font-bold uppercase tracking-wider text-sm'>
                Save Time
              </span>
              <h3 className='text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6'>
                Let your clients book themselves, 24/7.
              </h3>
              <p className='text-lg text-gray-600 mb-6 leading-relaxed'>
                Stop playing phone tag. Open your schedule and let clients find
                the perfect time slot. Over 50% of beauty appointments are
                booked outside of business hours. Don't miss out.
              </p>
              <Link
                to='/register'
                className='text-green-700 font-bold hover:underline inline-flex items-center'
              >
                Start saving time &rarr;
              </Link>
            </div>
            <div className='md:w-1/2 bg-gray-100 rounded-2xl h-64 md:h-96 w-full flex items-center justify-center text-gray-300'>
              {/* Placeholder for Image */}
              <div className='text-center'>
                <span className='text-6xl'>📅</span>
                <p className='mt-4 font-medium'>Calendar UI Preview</p>
              </div>
            </div>
          </div>

          {/* Highlight 2: Image Left, Text Right */}
          <div className='flex flex-col md:flex-row-reverse items-center gap-12'>
            <div className='md:w-1/2'>
              <span className='text-green-600 font-bold uppercase tracking-wider text-sm'>
                Fill Cancellations
              </span>
              <h3 className='text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6'>
                Smart Waitlists that work for you.
              </h3>
              <p className='text-lg text-gray-600 mb-6 leading-relaxed'>
                Last minute cancellation? No problem. Our automated waitlist
                system instantly notifies interested clients to fill the gap,
                ensuring your revenue stays protected.
              </p>
              <Link
                to='/register'
                className='text-green-700 font-bold hover:underline inline-flex items-center'
              >
                Learn about Waitlists &rarr;
              </Link>
            </div>
            <div className='md:w-1/2 bg-gray-100 rounded-2xl h-64 md:h-96 w-full flex items-center justify-center text-gray-300'>
              {/* Placeholder for Image */}
              <div className='text-center'>
                <span className='text-6xl'>🔔</span>
                <p className='mt-4 font-medium'>Notification UI Preview</p>
              </div>
            </div>
          </div>

          {/* Highlight 3: Image Right, Text Left */}
          <div className='flex flex-col md:flex-row items-center gap-12'>
            <div className='md:w-1/2'>
              <span className='text-green-600 font-bold uppercase tracking-wider text-sm'>
                Grow Reputation
              </span>
              <h3 className='text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6'>
                Turn 5-star reviews into new clients.
              </h3>
              <p className='text-lg text-gray-600 mb-6 leading-relaxed'>
                Automatically redirect happy clients to leave reviews on Google.
                Build your online presence and rank higher in local search
                results effortlessly.
              </p>
              <Link
                to='/register'
                className='text-green-700 font-bold hover:underline inline-flex items-center'
              >
                Boost your reviews &rarr;
              </Link>
            </div>
            <div className='md:w-1/2 bg-gray-100 rounded-2xl h-64 md:h-96 w-full flex items-center justify-center text-gray-300'>
              {/* Placeholder for Image */}
              <div className='text-center'>
                <span className='text-6xl'>⭐</span>
                <p className='mt-4 font-medium'>Reviews Widget Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- NEW: TESTIMONIALS --- */}
      <section className='py-20 bg-green-100 text-white'>
        <div className='max-w-7xl mx-auto px-4 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-12 text-green-900'>
            What Professionals Say
          </h2>
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='bg-green-800 p-8 rounded-xl text-left'>
              <div className='flex text-yellow-400 mb-4'>★★★★★</div>
              <p className='mb-6 italic text-green-100'>
                "My revenue increased by 30% just by enabling online bookings.
                Clients love how easy it is to use."
              </p>
              <div>
                <p className='font-bold'>Sarah Jenkins</p>
                <p className='text-sm text-green-300'>Owner, Glow Studio</p>
              </div>
            </div>
            <div className='bg-green-800 p-8 rounded-xl text-left'>
              <div className='flex text-yellow-400 mb-4'>★★★★★</div>
              <p className='mb-6 italic text-green-100'>
                "The no-show protection is a lifesaver. Deposits are
                automatically handled and I sleep better at night."
              </p>
              <div>
                <p className='font-bold'>David Chen</p>
                <p className='text-sm text-green-300'>Barber, The Cut</p>
              </div>
            </div>
            <div className='bg-green-800 p-8 rounded-xl text-left'>
              <div className='flex text-yellow-400 mb-4'>★★★★★</div>
              <p className='mb-6 italic text-green-100'>
                "Finally, a system that manages my staff and my inventory in one
                place. Best decision for my spa."
              </p>
              <div>
                <p className='font-bold'>Elena Rodriguez</p>
                <p className='text-sm text-green-300'>Manager, Pure Wellness</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- NEW: FINAL CTA STRIP --- */}
      <section className='py-24 bg-gray-50 text-center'>
        <div className='max-w-4xl mx-auto px-4'>
          <h2 className='text-4xl md:text-5xl font-extrabold text-green-900 mb-6'>
            Ready to elevate your business?
          </h2>
          <p className='text-xl text-gray-600 mb-10'>
            Join thousands of professionals who trust BOOKEasy to run their day.
          </p>
          <div className='flex flex-col sm:flex-row justify-center gap-4'>
            <Link
              to='/register'
              className='bg-green-700 text-white px-10 py-4 rounded-full hover:bg-green-800 transition shadow-lg text-lg font-bold'
            >
              Start Free Trial
            </Link>
            <Link
              to='/contact'
              className='bg-white text-green-800 border-2 border-green-200 px-10 py-4 rounded-full hover:border-green-700 hover:text-green-700 transition text-lg font-semibold'
            >
              Book Us Now
            </Link>
          </div>
          <p className='mt-6 text-sm text-gray-400'>
            No credit card required at all.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
