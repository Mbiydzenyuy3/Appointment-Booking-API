import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext.jsx";
import BookAppointmentForm from "../components/BookAppointments/BookAppointment.jsx";
import ProgressiveImage from "../components/Common/ProgressiveImage.jsx";
import { useConnectionSpeed } from "../hooks/useConnectionSpeed.js";
import api from "../services/api.js";
import { toast } from "react-toastify";
import { trackEvent } from "../services/analytics.js";

const ProviderProfile = () => {
  const { bookingSlug } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  // Enable connection speed detection for slow network optimizations
  useConnectionSpeed();

  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState({
    open: false,
    service: null
  });

  const fetchProviderProfile = async () => {
    try {
      const response = await api.get(`/providers/profile/${bookingSlug}`);
      const data = response.data.data;

      setProvider({
        ...data,
        name: data.name,
        bio: data.bio || "Professional service provider",
        profile_views: data.profile_views
      });
      setServices(data.services || []);
      setReviews(data.reviews || []);

      // Track profile view
      trackEvent("Profile Viewed", {
        provider_id: data.provider_id,
        provider_name: data.name,
        booking_slug: bookingSlug
      });
    } catch (error) {
      console.error("Failed to fetch provider profile:", error);
      toast.error(
        "We're having trouble loading this profile right now. Please try refreshing the page."
      );
      navigate("/explore");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingSlug) {
      fetchProviderProfile();
    }
  }, [bookingSlug]);

  const handleBookClick = (service) => {
    setBookingModal({ open: true, service });
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='loading-spinner mx-auto mb-4 w-8 h-8'></div>
          <p className='text-gray-600'>Loading provider profile...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-4xl mb-4'>🔍</div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Provider not found
          </h2>
          <p className='text-gray-600 mb-4'>
            The provider you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/explore")}
            className='btn btn-primary'
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  // Helper functions
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg
            key={i}
            className='w-4 h-4 text-yellow-400 fill-current'
            viewBox='0 0 20 20'
          >
            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg
            key={i}
            className='w-4 h-4 text-yellow-400 fill-current'
            viewBox='0 0 20 20'
          >
            <defs>
              <linearGradient id={`half-star-${i}`}>
                <stop offset='50%' stopColor='currentColor' />
                <stop offset='50%' stopColor='transparent' />
              </linearGradient>
            </defs>
            <path
              fill={`url(#half-star-${i})`}
              d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
            />
          </svg>
        );
      } else {
        stars.push(
          <svg
            key={i}
            className='w-4 h-4 text-gray-300 fill-current'
            viewBox='0 0 20 20'
          >
            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
          </svg>
        );
      }
    }
    return stars;
  };

  const totalSlots = services.reduce(
    (sum, service) => sum + (service.available_slots || 0),
    0
  );
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container-mobile py-8'>
        {/* Hero Section - Critical Content */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 critical-content progressive-content'>
          <div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-6'>
            <div className='flex items-center space-x-4 mb-4 md:mb-0'>
              <div className='w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg'>
                <span className='text-3xl font-bold text-white'>
                  {provider.name?.charAt(0)?.toUpperCase() || "P"}
                </span>
              </div>
              <div>
                <div className='flex items-center space-x-2 mb-1'>
                  <h1 className='text-3xl font-bold text-gray-900'>
                    {provider.name}
                  </h1>
                  <div className='flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium'>
                    <svg
                      className='w-3 h-3 mr-1'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    Verified
                  </div>
                </div>
                <div className='flex items-center space-x-4 mb-2'>
                  <div className='flex items-center space-x-1'>
                    {renderStars(averageRating)}
                    <span className='text-sm font-medium text-gray-900 ml-1'>
                      {averageRating.toFixed(1)}
                    </span>
                    <span className='text-sm text-gray-500'>
                      ({reviews.length} reviews)
                    </span>
                  </div>
                </div>
                <div className='flex items-center space-x-4 text-sm text-gray-600'>
                  {provider.years_of_experience && (
                    <div className='flex items-center'>
                      <svg
                        className='w-4 h-4 mr-1'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                          clipRule='evenodd'
                        />
                      </svg>
                      {provider.years_of_experience} years experience
                    </div>
                  )}
                  <div className='flex items-center'>
                    <svg
                      className='w-4 h-4 mr-1'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                        clipRule='evenodd'
                      />
                    </svg>
                    {provider.total_bookings || 0} bookings completed
                  </div>
                  <div className='flex items-center'>
                    <svg
                      className='w-4 h-4 mr-1'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
                      <path
                        fillRule='evenodd'
                        d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                    {provider.profile_views} profile views
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-col items-end space-y-2'>
              {totalSlots > 0 && (
                <div className='bg-orange-100 text-orange-800 px-3 py-2 rounded-lg text-sm font-medium'>
                  ⚡ Only {totalSlots} times left this week!
                </div>
              )}
              <button
                onClick={() =>
                  services.length > 0 && handleBookClick(services[0])
                }
                className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors'
              >
                Book Now - Save Time
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className='flex flex-wrap items-center gap-3 mb-4'>
            {provider.certifications && provider.certifications.length > 0 && (
              <div className='flex items-center space-x-2'>
                <svg
                  className='w-5 h-5 text-blue-600'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
                <span className='text-sm font-medium text-gray-700'>
                  Certified Professional
                </span>
              </div>
            )}
            {provider.business_photos &&
              provider.business_photos.length > 0 && (
                <div className='flex items-center space-x-2'>
                  <svg
                    className='w-5 h-5 text-purple-600'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm font-medium text-gray-700'>
                    Business Photos Available
                  </span>
                </div>
              )}
            {reviews.length >= 10 && (
              <div className='flex items-center space-x-2'>
                <svg
                  className='w-5 h-5 text-green-600'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                <span className='text-sm font-medium text-gray-700'>
                  Highly Rated
                </span>
              </div>
            )}
          </div>

          <p className='text-gray-600 leading-relaxed'>{provider.bio}</p>
        </div>

        {/* Business Photos Gallery - Non-critical content */}
        {provider.business_photos && provider.business_photos.length > 0 && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 non-critical'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Business Gallery
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {provider.business_photos.slice(0, 8).map((photo, index) => (
                <div
                  key={index}
                  className='aspect-square rounded-lg overflow-hidden bg-gray-100'
                >
                  <ProgressiveImage
                    src={photo}
                    webpSrc={photo} // Assuming photos are already WebP from backend
                    alt={`Business photo ${index + 1}`}
                    className='w-full h-full object-cover hover:scale-105 transition-transform duration-200'
                    priority={index < 2} // Load first 2 images immediately
                  />
                </div>
              ))}
            </div>
            {provider.business_photos.length > 8 && (
              <p className='text-sm text-gray-500 mt-4 text-center'>
                +{provider.business_photos.length - 8} more photos
              </p>
            )}
          </div>
        )}

        {/* Testimonials */}
        {provider.testimonials && provider.testimonials.length > 0 && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              What Clients Say
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {provider.testimonials.slice(0, 4).map((testimonial, index) => (
                <div
                  key={index}
                  className='bg-gray-50 rounded-lg p-4 border-l-4 border-green-500'
                >
                  <div className='flex items-center mb-2'>
                    {renderStars(testimonial.rating || 5)}
                  </div>
                  <p className='text-gray-700 italic mb-2'>
                    "{testimonial.text}"
                  </p>
                  <p className='text-sm font-medium text-gray-900'>
                    - {testimonial.author || "Happy Client"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Recent Reviews
              </h2>
              <div className='flex items-center space-x-2'>
                <div className='flex items-center'>
                  {renderStars(averageRating)}
                  <span className='ml-2 text-lg font-semibold text-gray-900'>
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <span className='text-gray-500'>
                  ({reviews.length} reviews)
                </span>
              </div>
            </div>
            <div className='space-y-4'>
              {reviews.slice(0, 5).map((review) => (
                <div
                  key={review.review_id}
                  className='border-b border-gray-100 pb-4 last:border-b-0'
                >
                  <div className='flex items-start justify-between mb-2'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center'>
                        <span className='text-sm font-medium text-gray-700'>
                          {review.reviewer_name?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                      <span className='font-medium text-gray-900'>
                        {review.reviewer_name}
                      </span>
                    </div>
                    <div className='flex items-center'>
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className='text-gray-700'>{review.review_text}</p>
                  <p className='text-xs text-gray-500 mt-1'>
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            {reviews.length > 5 && (
              <div className='text-center mt-4'>
                <button className='text-green-600 hover:text-green-700 font-medium'>
                  View all {reviews.length} reviews
                </button>
              </div>
            )}
          </div>
        )}

        {/* Services Section */}
        <section>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                Book Your Service
              </h2>
              <p className='text-gray-600 mt-1'>
                Choose from available services below
              </p>
            </div>
            <div className='text-right'>
              <div className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full mb-2'>
                {services.length} services available
              </div>
              {totalSlots > 0 && (
                <div className='text-xs text-orange-600 font-medium'>
                  🔥 Limited times available
                </div>
              )}
            </div>
          </div>

          {services.length === 0 ? (
            <div className='text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100'>
              <div className='text-4xl mb-4'>🛠️</div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No services available
              </h3>
              <p className='text-gray-600'>
                This provider hasn't added any services yet.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
              {services.map((service) => (
                <div
                  key={service.service_id}
                  className='bg-white rounded-xl shadow-sm border border-gray-100 group hover:shadow-lg transition-all duration-200 hover-lift'
                >
                  <div className='p-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <h3 className='text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors'>
                        {service.name}
                      </h3>
                      <div className='text-right'>
                        <div className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold'>
                          {formatPrice(service.price)}
                        </div>
                        {service.available_slots <= 5 &&
                          service.available_slots > 0 && (
                            <div className='text-xs text-orange-600 font-medium mt-1'>
                              Only {service.available_slots} left!
                            </div>
                          )}
                      </div>
                    </div>

                    <p
                      className='text-gray-600 mb-4 overflow-hidden'
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical"
                      }}
                    >
                      {service.description}
                    </p>

                    <div className='flex items-center justify-between mb-4 text-sm text-gray-500'>
                      <span className='flex items-center'>
                        <svg
                          className='w-4 h-4 mr-1'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                            clipRule='evenodd'
                          />
                        </svg>
                        {service.duration} min
                      </span>
                      <span className='flex items-center'>
                        <svg
                          className='w-4 h-4 mr-1'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                            clipRule='evenodd'
                          />
                        </svg>
                        {service.available_slots} times available
                      </span>
                    </div>

                    {/* Social Proof */}
                    <div className='flex items-center justify-between mb-4 text-xs text-gray-500'>
                      <span>⭐ Popular choice</span>
                      <span>{provider.total_bookings || 0} total bookings</span>
                    </div>

                    <button
                      onClick={() => handleBookClick(service)}
                      className='w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md'
                    >
                      Book Now - Instant Confirmation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          {services.length > 0 && (
            <div className='mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 text-center border border-green-100'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Ready to book with {provider.name}?
              </h3>
              <p className='text-gray-600 mb-4'>
                Join hundreds of satisfied customers. Book now and secure your
                preferred time slot.
              </p>
              <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                <button
                  onClick={() =>
                    services.length > 0 && handleBookClick(services[0])
                  }
                  className='bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-colors'
                >
                  Book Your Appointment
                </button>
                <button className='border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors'>
                  View Availability
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Back to Explore */}
        <div className='mt-8 text-center'>
          <button
            onClick={() => navigate("/explore")}
            className='text-green-600 hover:text-green-700 font-medium'
          >
            ← Back to Explore
          </button>
        </div>

        {/* Booking Modal */}
        <BookAppointmentForm
          providerId={provider.provider_id}
          isOpen={bookingModal.open}
          onClose={() => setBookingModal({ open: false, service: null })}
          service={bookingModal.service}
        />
      </div>
    </div>
  );
};

export default ProviderProfile;
