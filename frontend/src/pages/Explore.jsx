import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCurrency } from "../context/CurrencyContext.jsx";
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
        // Track explore page view
        trackExploreView({ service_count: services.length });
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
    // Track service viewed and booking started
    trackServiceViewed(service.service_id, service.service_name);
    trackBookingStarted(service.service_id, service.service_name, !user);

    setBookingModal({ open: true, service });
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

                    <div className='flex items-center justify-between mb-2'>
                      <p className='text-sm text-gray-500'>
                        Provider: {service.provider_name}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const whatsappUrl = `https://wa.me/237XXXXXXXXX?text=Hi, I'm interested in your ${service.service_name} service`;
                          window.open(whatsappUrl, "_blank");
                        }}
                        className='flex items-center space-x-1 px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs rounded-full transition-colors'
                        title='Contact via WhatsApp'
                      >
                        <svg
                          className='w-3 h-3'
                          fill='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' />
                        </svg>
                      </button>
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
                        {service.duration_minutes} min
                      </span>
                    </div>

                    <button
                      onClick={() => handleBookClick(service)}
                      className='btn btn-primary w-full touch-target text-sm sm:text-base'
                    >
                      Book Appointment
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
