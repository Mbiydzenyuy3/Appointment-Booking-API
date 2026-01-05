import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCurrency } from "../context/CurrencyContext.jsx";
import BookAppointmentForm from "../components/BookAppointments/BookAppointment.jsx";
import api from "../services/api.js";
import { toast } from "react-toastify";

const ExplorePage = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bookingModal, setBookingModal] = useState({
    open: false,
    service: null
  });

  const fetchServices = async (query = "") => {
    try {
      const endpoint = query
        ? `/services/search?q=${encodeURIComponent(query)}`
        : "/services";
      const servicesRes = await api.get(endpoint);
      const servicesWithProvider = (
        Array.isArray(servicesRes.data.data) ? servicesRes.data.data : []
      ).map((s) => ({
        ...s,
        service_name: s.name,
        duration_minutes: s.duration,
        providerId: s.provider_id || "default-provider-id"
      }));
      setServices(servicesWithProvider);
    } catch (error) {
      console.error("Fetch services error:", error);
      toast.error("Failed to load services");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchServices();
      } catch (error) {
        console.error("Fetch data error:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBookClick = (service) => {
    if (user) {
      setBookingModal({ open: true, service });
    } else {
      navigate("/register");
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-gray-50'>
        <div className='text-center'>
          <div className='loading-spinner mx-auto mb-4 w-8 h-8'></div>
          <p className='text-gray-600'>Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container-mobile py-8'>
        {/* Page title section */}
        <div className='mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
            Explore Services
          </h1>
          <p className='text-gray-600 mt-1'>
            Find and book services from trusted providers
          </p>
        </div>

        {/* Available Services Section */}
        <section>
          <div className='flex items-center justify-between mb-4 sm:mb-6'>
            <h2 className='text-xl sm:text-2xl font-semibold text-gray-900'>
              Available Services
            </h2>
            <span className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
              {services.length} services
            </span>
          </div>

          {services.length === 0 ? (
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
                  className='booking-card group hover-lift'
                >
                  <div className='p-4 sm:p-6'>
                    <div className='flex items-start justify-between mb-3'>
                      <h3 className='text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors'>
                        {service.service_name}
                      </h3>
                      <div className='bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium'>
                        {formatPrice(service.price)}
                      </div>
                    </div>

                    <p className='text-sm text-gray-500 mb-2'>
                      Provider: {service.provider_name}
                    </p>

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
                        {service.duration_minutes} min
                      </span>
                    </div>

                    <button
                      onClick={() => handleBookClick(service)}
                      className='btn btn-primary w-full touch-target text-sm sm:text-base'
                    >
                      {user ? "Book Appointment" : "Sign up to Book"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <BookAppointmentForm
          providerId={bookingModal.service?.providerId}
          isOpen={bookingModal.open}
          onClose={() => setBookingModal({ open: false, service: null })}
          service={bookingModal.service}
        />
      </div>
    </div>
  );
};

export default ExplorePage;
