import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api.js";
import BookAppointment from "../components/BookAppointments/BookAppointment.jsx";

export default function ProviderBooking() {
  const { providerId } = useParams();
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [providerRes, servicesRes] = await Promise.all([
          api.get(`/providers/${providerId}`),
          api.get(`/services?provider_id=${providerId}`)
        ]);
        setSelectedProvider(providerRes.data.data);
        setServices(servicesRes.data.data || []);
      } catch (error) {
        setError("Provider not found or failed to load services");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [providerId]);

  const handleBookService = (service) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setSelectedService(null);
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        Loading...
      </div>
    );
  }

  if (error || !selectedProvider) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        Provider not found
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-4'>{selectedProvider.name}</h1>
      <p className='text-gray-600 mb-8'>{selectedProvider.description}</p>
      <h2 className='text-2xl font-semibold mb-6'>Available Services</h2>
      {services.length === 0 ? (
        <p>No services available</p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {services.map((service) => (
            <div
              key={service.service_id}
              className='bg-white rounded-lg shadow-md p-6'
            >
              <h3 className='text-xl font-semibold mb-2'>
                {service.service_name}
              </h3>
              <p className='text-gray-600 mb-4'>{service.description}</p>
              <button
                onClick={() => handleBookService(service)}
                className='btn btn-primary'
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      )}
      {isBookingOpen && (
        <BookAppointment
          providerId={selectedProvider.provider_id}
          service={selectedService}
          isOpen={isBookingOpen}
          onClose={handleCloseBooking}
        />
      )}
    </div>
  );
}
