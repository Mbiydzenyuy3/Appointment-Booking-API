import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  trackExploreView,
  trackServiceViewed,
  trackBookingStarted
} from "../services/analytics.js";
import BookAppointmentForm from "../components/BookAppointments/BookAppointment.jsx";
import api from "../services/api.js";
import { toast } from "react-toastify";

const ExplorePage = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [bookingModal, setBookingModal] = useState({
    open: false,
    service: null
  });

  const fetchServices = async (query = "", location = "", category = "") => {
    try {
      const servicesRes = await api.get("/services");

      let servicesData = Array.isArray(servicesRes.data.data)
        ? servicesRes.data.data
        : [];

      if (query) {
        servicesData = servicesData.filter((s) =>
          (s.name || "").toLowerCase().includes(query.toLowerCase())
        );
      }

      if (location) {
        servicesData = servicesData.filter((s) =>
          (s.location || "").toLowerCase().includes(location.toLowerCase())
        );
      }

      if (category) {
        servicesData = servicesData.filter((s) =>
          (s.category || "").toLowerCase().includes(category.toLowerCase())
        );
      }

      const servicesWithProvider = servicesData.map((s) => ({
        ...s,
        service_name: s.name,
        duration_minutes: s.duration,
        providerId: s.provider_id,
        booking_slug: s.booking_slug || s.provider_id
      }));

      setServices(servicesWithProvider);
    } catch (error) {
      console.error("Fetch services error:", error);
      setError(true);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const serviceParam = searchParams.get("service") || "";
      const locationParam = searchParams.get("location") || "";
      const categoryParam = searchParams.get("category") || "";
      await fetchServices(serviceParam, locationParam, categoryParam);
      trackExploreView({ service_count: services.length });
    } catch (err) {
      console.error("Fetch data error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleBookClick = (service) => {
    // Track service viewed and booking started
    trackServiceViewed(service.service_id, service.service_name);
    trackBookingStarted(service.service_id, service.service_name, !user);

    setBookingModal({ open: true, service });
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className='fixed top-4 left-4 z-50 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-full p-3 shadow-lg border border-gray-200 transition-all duration-200 group'
        aria-label='Go back to home'
      >
        <ArrowLeft className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />
      </button>

      {/* Success Metrics Hero Section */}
      <section className='text-green-800 py-16'>
        <div className='container-mobile'>
          <div className='text-center mb-12'>
            <h1 className='text-3xl sm:text-4xl font-bold mb-4'>
              Join Our Circle of Thriving Businesses
            </h1>
            <p className='text-gray-600 text-lg max-w-2xl mx-auto'>
              Discover how service providers are growing their businesses and
              clients are finding trusted professionals on BOOKEasy
            </p>
          </div>
        </div>
      </section>

      <div className='container-mobile py-8'>
        {/* Available Services Section */}
        <section>
          {(() => {
            const categoryParam = searchParams.get("category") || "";
            return (
              <>
                {categoryParam && (
                  <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                    <p className='text-sm text-blue-800'>
                      Filtering by category: <strong>{categoryParam}</strong>
                    </p>
                  </div>
                )}
                <div className='flex items-center justify-between mb-4 sm:mb-6'>
                  <h2 className='text-xl sm:text-2xl font-semibold text-gray-900'>
                    All Available Businesses
                    {categoryParam ? ` in ${categoryParam}` : ""}
                  </h2>
                  <span className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                    {services.length} services
                    {categoryParam ? ` in ${categoryParam}` : ""} from trusted
                    providers
                  </span>
                </div>
              </>
            );
          })()}

          {loading ? (
            <div className='flex justify-center items-center py-20'>
              <div className='text-center'>
                <div className='loading-spinner mx-auto mb-4 w-8 h-8'></div>
                <p className='text-gray-600'>Loading services...</p>
              </div>
            </div>
          ) : error ? (
            <div className='text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100'>
              <div className='text-4xl mb-4'>⚠️</div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Failed to load services
              </h3>
              <p className='text-gray-600 mb-6'>
                The server may be starting up. Please try again.
              </p>
              <button
                onClick={fetchData}
                className='btn btn-primary px-6 py-2'
              >
                Retry
              </button>
            </div>
          ) : services.length === 0 ? (
            <div className='text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100'>
              <div className='text-4xl mb-4'>🔍</div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No services available
              </h3>
              <p className='text-gray-600'>
                Check back later for new services.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
              {services.map((service) => (
                <div
                  key={service.service_id}
                  className='bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 group overflow-hidden'
                >
                  {/* Provider Header with Trust Indicators */}
                  <div className='bg-gradient-to-r from-green-50 to-blue-50 px-4 py-3 border-b border-gray-100'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2'>
                          ✓
                        </div>
                        <div>
                          <div className='font-semibold text-sm text-gray-900'>
                            {service.provider_name}
                          </div>
                          <div className='flex items-center text-xs text-gray-600'>
                            <span className='flex text-yellow-400 mr-1'>
                              {"★".repeat(
                                Math.floor(service.average_rating || 0)
                              )}
                            </span>
                            <span>
                              {Number(service.average_rating || 0).toFixed(1)} (
                              {service.review_count || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium'>
                        {service.certifications &&
                        service.certifications.length > 0
                          ? "Certified"
                          : "Verified"}
                      </div>
                    </div>
                  </div>

                  <div className='p-4 sm:p-6'>
                    <div className='flex items-start justify-between mb-3'>
                      <h3 className='text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors'>
                        {service.service_name}
                      </h3>
                      <div className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold'>
                        {formatPrice(service.price)}
                      </div>
                    </div>

                    <p
                      className='text-gray-600 mb-4 overflow-hidden text-sm'
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical"
                      }}
                    >
                      {service.description}
                    </p>

                    {/* Service Details */}
                    <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
                      <div className='flex items-center text-gray-500'>
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
                        {service.duration_minutes} min
                      </div>
                      <div className='flex items-center text-gray-500'>
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
                        Instant booking
                      </div>
                    </div>

                    {/* Business Results Indicator */}
                    <div className='bg-blue-50 rounded-lg p-3 mb-4'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-blue-700 font-medium'>
                          Business Growth
                        </span>
                        <span className='text-green-600 font-bold'>
                          +85% bookings
                        </span>
                      </div>
                      <div className='w-full bg-blue-200 rounded-full h-2 mt-2'>
                        <div
                          className='bg-green-500 h-2 rounded-full'
                          style={{ width: "85%" }}
                        ></div>
                      </div>
                    </div>

                    <div className='flex space-x-2'>
                      <button
                        onClick={() =>
                          navigate(`/provider/${service.booking_slug}`)
                        }
                        className='btn btn-secondary flex-1 touch-target text-sm sm:text-base'
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleBookClick(service)}
                        className='btn btn-primary flex-1 touch-target text-sm sm:text-base'
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trust & Credibility Section */}

        <BookAppointmentForm
          providerId={bookingModal.service?.providerId}
          isOpen={bookingModal.open}
          onClose={() => setBookingModal({ open: false, service: null })}
          service={bookingModal.service}
          returnPath='/'
        />
      </div>
    </div>
  );
};

export default ExplorePage;
