import React from "react";
import { Link, useNavigate } from "react-router-dom";
import LandingHeader from "../components/Navigation/LandingHeader.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBookNow = () => {
    if (user) {
      if (user.user_type === "client") {
        navigate("/dashboard");
      } else if (user.user_type === "provider") {
        navigate("/provider-dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      navigate("/login");
    }
  };

  const handleExploreBusinesses = () => {
    navigate("/explore");
  };

  const handleProviderCTA = () => {
    if (user?.user_type === "provider") {
      navigate("/provider-dashboard");
    } else {
      navigate("/register");
    }
  };

  const ctaLabel = user
    ? user.user_type === "provider"
      ? "Go to Dashboard"
      : "Book an Appointment"
    : "Start Accepting Bookings";

  return (
    <div className='min-h-screen bg-white flex flex-col font-sans' id='hero'>
      <LandingHeader />

      <main className='relative min-h-[80vh] flex items-center justify-center background-landing'>
        <div
          className='absolute inset-0 bg-black/50 bg-gradient-to-b from-black/30 to-black/50 z-0'
          aria-hidden='true'
        ></div>

        <div className='relative z-10 max-w-5xl text-center px-4' id='/'>
          <h1 className='text-5xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight'>
            Let clients book you without calls, messages, or stress.
          </h1>
          <p className='text-lg sm:text-xl text-green-100 mb-10'>
            BookEasy helps service businesses accept bookings online while
            clients book instantly, anytime.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button
              onClick={handleExploreBusinesses}
              aria-label='Explore Businesses'
              className='btn btn-primary px-8 py-4 text-lg font-semibold'
            >
              Explore Businesses
            </button>

            <button
              onClick={handleProviderCTA}
              aria-label={ctaLabel}
              className='btn btn-outline border-white text-white hover:bg-white hover:text-green-900 px-8 py-4 text-lg font-semibold'
            >
              {ctaLabel}
            </button>
          </div>
          <p className='mt-6 text-sm text-green-200'>
            Free to start • No credit card required
          </p>
        </div>
      </main>

      {/* Trusted By Section */}
      <section className='bg-white py-10 border-b'>
        <div className='container-mobile text-center'>
          <p className='text-xs font-semibold text-gray-400 uppercase mb-6'>
            Built with early service businesses across Cameroon
          </p>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-6 text-gray-600 font-semibold'>
            <span>Health Clinics</span>
            <span>Barber Shops</span>
            <span>Consultants</span>
            <span>Fitness Coaches</span>
          </div>
        </div>
      </section>

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

      <section className='py-16 bg-white' id='features'>
        <div className='container-mobile'>
          <h2 className='text-3xl font-bold text-center mb-12 text-green-800'>
            What Book Easy Offers
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
      </section>

      <section className='py-16 px-4 bg-green-50'>
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
      </section>

      <section className='py-20 bg-white'>
        <div className='container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center'>
          <div>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight'>
              Stop losing clients to <br />
              manual scheduling.
            </h2>
            <div className='space-y-6'>
              <div className='flex gap-4'>
                <div className='flex-shrink-0 w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </div>
                <div>
                  <h4 className='font-bold text-gray-900'>The Old Way</h4>
                  <p className='text-gray-500 text-sm'>
                    Missed calls, double-bookings, and constant back-and-forth
                    messages.
                  </p>
                </div>
              </div>
              <div className='flex gap-4'>
                <div className='flex-shrink-0 w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                </div>
                <div>
                  <h4 className='font-bold text-gray-900'>The BookEasy Way</h4>
                  <p className='text-gray-500 text-sm'>
                    Automated reminders, real-time availability, and a
                    professional link in your bio.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div
            className='bg-green-50 rounded-3xl p-10 relative overflow-hidden'
            id='testimonials'
          >
            <h3 className='text-2xl font-bold text-green-900 mb-4'>
              "I saved 10 hours a week"
            </h3>
            <p className='text-green-800/80 mb-6 italic'>
              "Since using BookEasy, I don't have to answer the phone while I'm
              with a client. They just book themselves. It's transformed my
              business."
            </p>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-green-200 rounded-full'>
                <img
                  className='rounded-full'
                  src='https://ca.slack-edge.com/T045U09V0US-U07RJ7G5GNS-bd2528068427-72'
                  alt='Nkwenui Nadine'
                />
              </div>
              <div>
                <p className='text-sm font-bold text-green-900 leading-none'>
                  Local Service Provider
                </p>
                <p className='text-xs text-green-700'>Yaounde, Cameroon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION (Original Logic, Better UI) ---
      <section id='testimonials' className='py-20 bg-green-900 text-white'>
        <div className='container mx-auto px-6 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-16'>
            Trusted by the community
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[
              {
                name: "Nkwenui Nadine",
                role: "Software Engineer",
                img: "https://ca.slack-edge.com/T045U09V0US-U07RJ7G5GNS-bd2528068427-72",
                text: "As a busy professional, this app makes scheduling consultations effortless. My clients can book anytime."
              },
              {
                name: "Ayuk Giress",
                role: "Consultant",
                img: "https://ca.slack-edge.com/T045U09V0US-U062ZTHFJD6-31bd16fc0524-192",
                text: "The real-time notifications have transformed my practice. I handle multiple clients without overlaps."
              },
              {
                name: "Marie-Blanche",
                role: "Clinic Owner",
                img: "https://scontent-los2-1.xx.fbcdn.net/v/t39.30808-6/470488767_1106050554255256_7815918165849126675_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&oh=00_AfqjzY37_ENNpIsV2rmSv8sx7XWqzWzB9-wJeXCqGLFBYA&oe=6961ADB5",
                text: "From a client's perspective, booking has never been easier. Confirmations are instant."
              }
            ].map((t, idx) => (
              <div
                key={idx}
                className='bg-white/5 border border-white/10 p-8 rounded-2xl text-left hover:bg-white/10 transition-colors'
              >
                <div className='flex text-yellow-400 mb-4'>★★★★★</div>
                <p className='mb-8 italic text-green-50/80 leading-relaxed'>
                  "{t.text}"
                </p>
                <div className='flex items-center gap-4'>
                  <img
                    src={t.img}
                    alt={t.name}
                    className='w-12 h-12 rounded-full object-cover'
                  />
                  <div>
                    <p className='font-bold'>{t.name}</p>
                    <p className='text-xs text-green-400'>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <section className='py-20 bg-white text-center'>
        <div className='container mx-auto px-6'>
          <h2 className='text-4xl font-bold text-gray-900 mb-6'>
            Ready to grow your business?
          </h2>
          <p className='text-gray-500 mb-10 text-lg'>
            Join hundreds of providers today. Setup takes less than 2 minutes.
          </p>
          <Link
            to={handleBookNow}
            className='px-6 py-4 border border-green-600 bg-green-600 text-white rounded-2xl font-bold text-xl h transition-all active:scale-95'
          >
            Get Started for Free
          </Link>
          <p className='mt-6 text-sm text-gray-400'>
            No credit card required • Secure & Encrypted
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
