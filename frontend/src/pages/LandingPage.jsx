import React from "react";
import { Link } from "react-router-dom";
import LandingHeader from "../components/LandingHeader.jsx";
import Footer from "../components/Footer.jsx";

export default function HomePage() {
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      {/* Mobile responsive header */}
      <LandingHeader />

      <main className='min-h-80 py-6 sm:py-8 lg:px-12 flex-grow flex items-center justify-center hero-overlay relative background-landing'>
        <div className='overlay flex items-center justify-center w-full'>
          <div className='text-center px-4 sm:px-6 lg:px-8 content max-w-4xl mx-auto'>
            <h2 className='text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 drop-shadow-lg leading-tight'>
              Seamless Appointment Booking
            </h2>
            <p className='text-base sm:text-lg lg:text-xl text-gray-100 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md'>
              Connect with providers effortlessly. Book, manage, and receive
              real-time updates with our intuitive platform designed to grow
              your business.{" "}
            </p>
            <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center'>
              <Link
                to='/register'
                className='btn btn-primary w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg button-index touch-target animate-mobile'
              >
                Book Your First Appointment{" "}
              </Link>
              <Link
                to='/demo'
                className='btn btn-outline w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold backdrop-blur-sm touch-target border-2 border-green-400/50 hover:bg-green-700/50'
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* --- SOCIAL PROOF / TRUSTED BY --- */}
      <div className='bg-white border-b border-gray-100 py-8'>
        <div className='container-mobile'>
          <p className='text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 text-center'>
            Trusted by 2,000+ Businesses
          </p>
          <div className='grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500'>
            <span className='text-sm sm:text-base font-bold text-gray-600 text-center'>
              SalonLuxe
            </span>
            <span className='text-sm sm:text-base font-bold text-gray-600 text-center'>
              UrbanSpa
            </span>
            <span className='text-sm sm:text-base font-bold text-gray-600 text-center'>
              BarberCo
            </span>
            <span className='text-sm sm:text-base font-bold text-gray-600 text-center'>
              WellnessFlow
            </span>
            <span className='text-sm sm:text-base font-bold text-gray-600 text-center hidden xs:block'>
              StyleStudio
            </span>
          </div>
        </div>
      </div>

      <section className='bg-white py-12 sm:py-16'>
        <div className='container-mobile'>
          <div className='text-center mb-8 sm:mb-12'>
            <h3 className='text-2xl sm:text-3xl font-bold text-gray-900'>
              Platform Essentials
            </h3>
            <p className='text-gray-500 mt-2 text-sm sm:text-base'>
              Built with performance and security in mind.
            </p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
            <div className='card-mobile bg-gray-50 rounded-2xl hover:shadow-lg transition p-4 sm:p-6'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl sm:text-2xl'></div>
              <h3 className='text-lg sm:text-xl font-bold text-gray-800 mb-2'>
                Secure Authentication
              </h3>
              <p className='text-gray-600 text-sm sm:text-base'>
                Protect your data with enterprise-grade JWT-based
                authentication.
              </p>
            </div>
            <div className='card-mobile bg-gray-50 rounded-2xl hover:shadow-lg transition p-4 sm:p-6'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl sm:text-2xl'></div>
              <h3 className='text-lg sm:text-xl font-bold text-gray-800 mb-2'>
                Real-Time Notifications
              </h3>
              <p className='text-gray-600 text-sm sm:text-base'>
                Stay updated with instant alerts via WebSockets whenever a
                booking happens.
              </p>
            </div>
            <div className='card-mobile bg-gray-50 rounded-2xl hover:shadow-lg transition p-4 sm:p-6 sm:col-span-2 lg:col-span-1'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl sm:text-2xl'></div>
              <h3 className='text-lg sm:text-xl font-bold text-gray-800 mb-2'>
                Provider Management
              </h3>
              <p className='text-gray-600 text-sm sm:text-base'>
                View available slots, manage staff shifts, and organize
                appointments efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='py-12 sm:py-20 bg-gray-50'>
        <div className='container-mobile'>
          <div className='text-center max-w-3xl mx-auto mb-12 sm:mb-16'>
            <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-green-900 mb-4'>
              Run Your Business Like a Pro
            </h2>
            <p className='text-base sm:text-lg text-gray-600'>
              Everything you need to manage clients, payments, and marketing in
              one place.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8'>
            <div className='card-mobile bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100'>
              <h4 className='text-base sm:text-lg font-bold text-green-800 mb-3 border-b border-green-100 pb-2'>
                Taking Care of Clients
              </h4>
              <ul className='space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base'>
                <li className='flex items-center'>✓ Online Calendar 24/7</li>
                <li className='flex items-center'>✓ Client Profiles (CRM)</li>
                <li className='flex items-center'>✓ Consultation Forms</li>
              </ul>
            </div>
            <div className='card-mobile bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100'>
              <h4 className='text-base sm:text-lg font-bold text-green-800 mb-3 border-b border-green-100 pb-2'>
                Manage Operations
              </h4>
              <ul className='space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base'>
                <li className='flex items-center'>✓ Staff Management</li>
                <li className='flex items-center'>✓ Inventory Tracking</li>
                <li className='flex items-center'>✓ Performance Reports</li>
              </ul>
            </div>
            {/* Feature 3 */}
            <div className='card-mobile bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100'>
              <h4 className='text-base sm:text-lg font-bold text-green-800 mb-3 border-b border-green-100 pb-2'>
                Secure Revenue
              </h4>
              <ul className='space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base'>
                <li className='flex items-center'>✓ No-Show Protection</li>
                <li className='flex items-center'>✓ Online Payments</li>
                <li className='flex items-center'>✓ Gift Cards & Deposits</li>
              </ul>
            </div>
            {/* Feature 4 */}
            <div className='card-mobile bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100'>
              <h4 className='text-base sm:text-lg font-bold text-green-800 mb-3 border-b border-green-100 pb-2'>
                Boost Your Brand
              </h4>
              <ul className='space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base'>
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

      <section className='py-12 sm:py-20 bg-white overflow-hidden'>
        <div className='container-mobile space-y-12 sm:space-y-24'>
          <div className='flex flex-col md:flex-row items-center gap-8 md:gap-12'>
            <div className='md:w-1/2 order-2 md:order-1'>
              <span className='text-green-600 font-bold uppercase tracking-wider text-xs sm:text-sm'>
                Save Time
              </span>
              <h3 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4 sm:mb-6'>
                Let your clients book themselves, 24/7.
              </h3>
              <p className='text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed'>
                Stop playing phone tag. Open your schedule and let clients find
                the perfect time slot. Over 50% of beauty appointments are
                booked outside of business hours. Don't miss out.
              </p>
              <Link
                to='/register'
                className='text-green-700 font-bold hover:underline inline-flex items-center touch-target'
              >
                Start saving time &rarr;
              </Link>
            </div>
            <div className='md:w-1/2 order-1 md:order-2 bg-gray-100 rounded-2xl h-48 sm:h-64 md:h-80 lg:h-96 w-full flex items-center justify-center text-gray-300'>
              <div className='text-center'>
                <span className='text-4xl sm:text-6xl'>📅</span>
                <p className='mt-2 sm:mt-4 font-medium text-sm sm:text-base'>
                  Calendar UI Preview
                </p>
              </div>
            </div>
          </div>

          <div className='flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12'>
            <div className='md:w-1/2'>
              <span className='text-green-600 font-bold uppercase tracking-wider text-xs sm:text-sm'>
                Fill Cancellations
              </span>
              <h3 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4 sm:mb-6'>
                Smart Waitlists that work for you.
              </h3>
              <p className='text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed'>
                Last minute cancellation? No problem. Our automated waitlist
                system instantly notifies interested clients to fill the gap,
                ensuring your revenue stays protected.
              </p>
              <Link
                to='/register'
                className='text-green-700 font-bold hover:underline inline-flex items-center touch-target'
              >
                Learn about Waitlists &rarr;
              </Link>
            </div>
            <div className='md:w-1/2 bg-gray-100 rounded-2xl h-48 sm:h-64 md:h-80 lg:h-96 w-full flex items-center justify-center text-gray-300'>
              {/* Placeholder for Image */}
              <div className='text-center'>
                <span className='text-4xl sm:text-6xl'>🔔</span>
                <p className='mt-2 sm:mt-4 font-medium text-sm sm:text-base'>
                  Notification UI Preview
                </p>
              </div>
            </div>
          </div>

          <div className='flex flex-col md:flex-row items-center gap-8 md:gap-12'>
            <div className='md:w-1/2 order-2 md:order-1'>
              <span className='text-green-600 font-bold uppercase tracking-wider text-xs sm:text-sm'>
                Grow Reputation
              </span>
              <h3 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4 sm:mb-6'>
                Turn 5-star reviews into new clients.
              </h3>
              <p className='text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed'>
                Automatically redirect happy clients to leave reviews on Google.
                Build your online presence and rank higher in local search
                results effortlessly.
              </p>
              <Link
                to='/register'
                className='text-green-700 font-bold hover:underline inline-flex items-center touch-target'
              >
                Boost your reviews &rarr;
              </Link>
            </div>
            <div className='md:w-1/2 order-1 md:order-2 bg-gray-100 rounded-2xl h-48 sm:h-64 md:h-80 lg:h-96 w-full flex items-center justify-center text-gray-300'>
              <div className='text-center'>
                <span className='text-4xl sm:text-6xl'>⭐</span>
                <p className='mt-2 sm:mt-4 font-medium text-sm sm:text-base'>
                  Reviews Widget Preview
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className='py-12 sm:py-20 bg-green-100'>
        <div className='container-mobile text-center'>
          <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-green-900'>
            What Professionals Say
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
            <div className='card-mobile bg-green-800 p-6 sm:p-8 rounded-xl text-left'>
              <div className='flex text-yellow-400 mb-4 text-sm sm:text-base'>
                ★★★★★
              </div>
              <p className='mb-4 sm:mb-6 italic text-green-100 text-sm sm:text-base'>
                "My revenue increased by 30% just by enabling online bookings.
                Clients love how easy it is to use."
              </p>
              <div>
                <p className='font-bold text-sm sm:text-base'>Sarah Jenkins</p>
                <p className='text-xs sm:text-sm text-green-300'>
                  Owner, Glow Studio
                </p>
              </div>
            </div>
            <div className='card-mobile bg-green-800 p-6 sm:p-8 rounded-xl text-left'>
              <div className='flex text-yellow-400 mb-4 text-sm sm:text-base'>
                ★★★★★
              </div>
              <p className='mb-4 sm:mb-6 italic text-green-100 text-sm sm:text-base'>
                "The no-show protection is a lifesaver. Deposits are
                automatically handled and I sleep better at night."
              </p>
              <div>
                <p className='font-bold text-sm sm:text-base'>David Chen</p>
                <p className='text-xs sm:text-sm text-green-300'>
                  Barber, The Cut
                </p>
              </div>
            </div>
            <div className='card-mobile bg-green-800 p-6 sm:p-8 rounded-xl text-left sm:col-span-2 lg:col-span-1'>
              <div className='flex text-yellow-400 mb-4 text-sm sm:text-base'>
                ★★★★★
              </div>
              <p className='mb-4 sm:mb-6 italic text-green-100 text-sm sm:text-base'>
                "Finally, a system that manages my staff and my inventory in one
                place. Best decision for my spa."
              </p>
              <div>
                <p className='font-bold text-sm sm:text-base'>
                  Elena Rodriguez
                </p>
                <p className='text-xs sm:text-sm text-green-300'>
                  Manager, Pure Wellness
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---  CTA SECTION --- */}
      <section className='py-16 sm:py-24 bg-gray-50 text-center'>
        <div className='container-mobile'>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-extrabold text-green-900 mb-4 sm:mb-6'>
            Ready to elevate your business?
          </h2>
          <p className='text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10'>
            Join thousands of professionals who trust BOOKEasy to run their day.
          </p>
          <div className='flex flex-col sm:flex-row justify-center gap-3 sm:gap-4'>
            <Link
              to='/register'
              className='btn btn-primary w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-lg text-base sm:text-lg font-bold touch-target'
            >
              Start Free Trial
            </Link>
            <Link
              to='/contact'
              className='btn btn-outline w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-full border-2 border-green-200 hover:border-green-700 hover:text-green-700 text-base sm:text-lg font-semibold touch-target'
            >
              Book Us Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
