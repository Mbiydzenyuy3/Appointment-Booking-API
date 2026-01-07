import React from "react";
import { Link, useNavigate } from "react-router-dom";
import LandingHeader from "../components/Navigation/LandingHeader.jsx";
import Footer from "../components/Footer.jsx";
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
      <LandingHeader />

      <main className='relative min-h-[80vh] flex items-center justify-center background-landing'>
        <div
          className='absolute inset-0 bg-black/50 bg-gradient-to-b from-black/30 to-black/50 z-0'
          aria-hidden='true'
        ></div>

        <div className='relative z-10 max-w-5xl text-center px-4' id='/'>
          <h1 className='text-5xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-white'>
            Stop Wasting Credit on Unanswered Calls.
          </h1>
          <p className='text-lg sm:text-xl text-green-100 mb-10'>
            Find trusted barbers, doctors, and coaches in Douala, Yaoundé, and
            Buea. Book instantly, pay securely, and skip the waiting line.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExploreBusinesses();
            }}
            className='flex flex-col sm:flex-row gap-4 justify-center mb-6 max-w-2xl mx-auto'
          >
            <input
              type='text'
              placeholder='What do you need? (e.g., Barber, Dentist, Makeup)'
              className='flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500'
            />
            <input
              type='text'
              placeholder='Where? (e.g., Akwa, Bonanjo, Molyko)'
              className='flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500'
            />
            <button
              type='submit'
              className='btn btn-primary px-12 py-3 font-semibold whitespace-nowrap'
            >
              Find Appointments
            </button>
          </form>
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

      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-6 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-12'>
            Real Pros. Verified Identities.
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
            <div className='bg-white p-8 rounded-xl shadow-sm'>
              <div className='w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
              </div>
              <h3 className='font-bold text-xl mb-2'>Identity Checked</h3>
              <p className='text-gray-600'>
                Every "Verified" business has submitted a valid CNI and business
                location proof. We know exactly who they are.
              </p>
            </div>
            <div className='bg-white p-8 rounded-xl shadow-sm'>
              <div className='w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                  />
                </svg>
              </div>
              <h3 className='font-bold text-xl mb-2'>Real Reviews Only</h3>
              <p className='text-gray-600'>
                You can only review a business after you've actually booked and
                paid. No fake 5-star ratings from cousins and friends.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='py-16 bg-white' id='features'>
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
        <div className='container mx-auto px-6'>
          <h2 className='text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12'>
            Why BOOKEasy is Better Than "Just Call Me"
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
            <div className='space-y-8'>
              <div className='flex gap-4'>
                <div className='flex-shrink-0 w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center'>
                  ❌
                </div>
                <div>
                  <h4 className='font-bold text-gray-900'>The Old Way</h4>
                  <p className='text-gray-500'>
                    "Has he read my WhatsApp?" You send a message. One tick. You
                    wait 4 hours for a reply just to hear "I'm busy today."
                  </p>
                </div>
              </div>
              <div className='flex gap-4'>
                <div className='flex-shrink-0 w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center'>
                  ✅
                </div>
                <div>
                  <h4 className='font-bold text-gray-900'>The BOOKEasy Way</h4>
                  <p className='text-gray-500'>
                    Instant Confirmation. See real-time availability. Tap "Book"
                    and get an SMS confirmation in seconds. No chatting
                    required.
                  </p>
                </div>
              </div>
            </div>
            <div className='space-y-8'>
              <div className='flex gap-4'>
                <div className='flex-shrink-0 w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center'>
                  ❌
                </div>
                <div>
                  <h4 className='font-bold text-gray-900'>The Old Way</h4>
                  <p className='text-gray-500'>
                    The "I'm Coming" Lie. You arrive on time, but the barber is
                    eating or "stuck in traffic," and you wait 45 minutes on a
                    plastic chair.
                  </p>
                </div>
              </div>
              <div className='flex gap-4'>
                <div className='flex-shrink-0 w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center'>
                  ✅
                </div>
                <div>
                  <h4 className='font-bold text-gray-900'>The BOOKEasy Way</h4>
                  <p className='text-gray-500'>
                    Respect for Your Time. Professionals on BOOKEasy are rated
                    for punctuality. You get reminders, they get reminders. You
                    sit in the chair, not the waiting room.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='py-20 bg-gray-50'>
        <div className='container mx-auto px-6'>
          <h2 className='text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16'>
            Cameroonians Saving Time with BOOKEasy
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-white p-8 rounded-xl shadow-sm'>
              <p className='text-gray-600 mb-6 italic'>
                "I used to spend my Saturday mornings waiting at the barber in
                Bonamoussadi. Now, I book my slot on Friday night, walk in at
                10:00 AM, and I'm out by 10:45 AM. It feels like VIP treatment."
              </p>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
                  <span className='text-gray-600 font-bold'>JC</span>
                </div>
                <div>
                  <p className='font-bold text-gray-900'>Jean-Claude</p>
                  <p className='text-sm text-gray-500'>
                    Entrepreneur in Douala
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-white p-8 rounded-xl shadow-sm'>
              <p className='text-gray-600 mb-6 italic'>
                "Finding a vet in Buea who was actually open on Sundays was a
                nightmare. BOOKEasy showed me who was available instantly. No
                more driving around blindly."
              </p>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
                  <span className='text-gray-600 font-bold'>SM</span>
                </div>
                <div>
                  <p className='font-bold text-gray-900'>Sarah M.</p>
                  <p className='text-sm text-gray-500'>Pet Owner in Buea</p>
                </div>
              </div>
            </div>
            <div className='bg-white p-8 rounded-xl shadow-sm'>
              <p className='text-gray-600 mb-6 italic'>
                "As a makeup artist, I wasted hours replying to 'How much?' on
                WhatsApp. Now my clients see my prices and book directly. I've
                saved 10+ hours a week."
              </p>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
                  <span className='text-gray-600 font-bold'>AB</span>
                </div>
                <div>
                  <p className='font-bold text-gray-900'>Aline Beauty</p>
                  <p className='text-sm text-gray-500'>
                    Makeup Artist in Yaoundé
                  </p>
                </div>
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

      <section className='py-20 bg-white'>
        <div className='container mx-auto px-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-16'>
            <div className='text-center'>
              <h2 className='text-4xl font-bold text-gray-900 mb-6'>
                Ready to skip the queue?
              </h2>
              <button
                onClick={handleExploreBusinesses}
                className='px-6 py-4 border border-green-600 bg-green-600 text-white rounded-2xl font-bold text-xl transition-all active:scale-95 hover:bg-green-700'
              >
                Book Your First Appointment
              </button>
            </div>
            <div className='text-center'>
              <h2 className='text-4xl font-bold text-gray-900 mb-6'>
                Run a Service Business?
              </h2>
              <p className='text-gray-500 mb-6 text-lg'>
                Join 500+ Cameroonian pros filling their calendars
                automatically. Stop chasing clients and start getting booked.
              </p>
              <button
                onClick={handleProviderCTA}
                className='px-6 py-4 border border-green-600 bg-green-600 text-white rounded-2xl font-bold text-xl transition-all active:scale-95 hover:bg-green-700'
              >
                List My Business Free
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
