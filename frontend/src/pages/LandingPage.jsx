import React from "react";
import { Link, useNavigate } from "react-router-dom";
// import LandingHeader from "../components/Navigation/LandingHeader.jsx";
import Footer from "../components/Footer.jsx";
import HeroSection from "../components/landing/HeroSection.jsx";
import ProblemSolutionSection from "../components/landing/ProblemSolutionSection";
import TrustSection from "../components/landing/TrustSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import CTAFooter from "../components/landing/CTAFooter";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleExploreBusinesses = () => {
    const whatInput = document.querySelector(
      'input[placeholder*="What do you need"]'
    ).value;
    const whereInput = document.querySelector(
      'input[placeholder*="Where"]'
    ).value;
    const params = new URLSearchParams();
    if (whatInput.trim()) params.set("q", whatInput.trim());
    if (whereInput.trim()) params.set("location", whereInput.trim());
    navigate(`/explore?${params.toString()}`);
  };

  const handleProviderCTA = () => {
    if (user?.user_type === "provider") {
      navigate("/provider-dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className='min-h-screen bg-white flex flex-col font-sans' id='hero'>
      <HeroSection />
      {/* --- MARKETPLACE PREVIEW: REFACTORED FOR CREDIBILITY --- */}
      <section className='py-20 bg-gray-50'>
        <div className='container mx-auto px-6'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Businesses you can book right now
            </h2>
            <p className='text-gray-600 max-w-2xl mx-auto'>
              Trusted by local experts to manage their schedules and grow their
              clientele.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
            {[
              {
                name: "FreshCuts Barber",
                category: "Grooming",
                city: "Douala",
                img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop"
              },
              {
                name: "HealthFirst Clinic",
                category: "Medical",
                city: "Yaoundé",
                img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop"
              },
              {
                name: "FitPro Coaching",
                category: "Fitness",
                city: "Buea",
                img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop"
              }
            ].map((biz, idx) => (
              <div
                key={idx}
                className='bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group'
              >
                <div className='relative h-48 overflow-hidden'>
                  <img
                    src={biz.img}
                    alt={biz.name}
                    loading='lazy'
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                  />
                  <div className='absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-green-700 tracking-tighter flex items-center gap-1 shadow-sm'>
                    <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>{" "}
                    VERIFIED
                  </div>
                </div>
                <div className='p-6'>
                  <h3 className='font-bold text-xl text-gray-900 mb-1'>
                    {biz.name}
                  </h3>
                  <p className='text-sm text-gray-500 mb-6 font-medium'>
                    {biz.category} • {biz.city}
                  </p>

                  <button
                    onClick={handleExploreBusinesses}
                    className='w-full py-3 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-700 hover:text-green-500 transition-colors'
                  >
                    View availability
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ProblemSolutionSection />
      <TrustSection />

      <TestimonialsSection />

      {/* <section className='py-16 bg-white' id='features'>
        <div className='container-mobile'>
          <h2 className='text-3xl font-bold text-center mb-12 text-green-800'>
            What BOOKEasy Offers
          </h2>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
            <div className='p-6 bg-gray-50 rounded-xl'>
              <h3 className='font-bold mb-2'>Private & secure</h3>
              <p className='text-gray-600'>
                Your data is protected with industry-standard security.
              </p>
            </div>
            <div className='p-6 bg-gray-50 rounded-xl'>
              <h3 className='font-bold mb-2'>Instant updates</h3>
              <p className='text-gray-600'>
                Receive confirmations and reminders automatically.
              </p>
            </div>
            <div className='p-6 bg-gray-50 rounded-xl'>
              <h3 className='font-bold mb-2'>Simple management</h3>
              <p className='text-gray-600'>
                Manage your schedule and clients in one place.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* <section className='py-16 px-4 bg-green-50'>
        <div className='container-mobile grid grid-cols-1 sm:grid-cols-2 gap-8'>
          <div>
            <h3 className='text-xl font-bold mb-3 text-green-800'>
              For Service Providers
            </h3>
            <ul className='space-y-2 text-gray-700'>
              <li>✓ Accept bookings 24/7</li>
              <li>✓ Reduce no-shows</li>
              <li>✓ Manage clients easily</li>
            </ul>
            <Link
              to='/register'
              className='inline-block mt-4 text-green-700 font-semibold hover:underline'
            >
              Create a business profile →
            </Link>
          </div>

          <div>
            <h3 className='text-xl font-bold mb-3 text-green-800'>
              For Clients
            </h3>
            <ul className='space-y-2 text-gray-700'>
              <li>✓ No calls or waiting</li>
              <li>✓ Instant booking</li>
              <li>✓ Automatic reminders</li>
            </ul>
            <button
              onClick={handleExploreBusinesses}
              className='inline-block mt-4 text-green-700 font-semibold hover:underline'
            >
              Find a business →
            </button>
          </div>
        </div>
      </section> */}

      <CTAFooter onProviderClick={handleProviderCTA} />
    </div>
  );
}
