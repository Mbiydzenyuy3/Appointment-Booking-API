import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCurrency } from "../context/CurrencyContext.jsx";
import RescheduleModal from "../components/Appointments/ResheduleModal.jsx";
import BookAppointmentForm from "../components/BookAppointments/BookAppointment.jsx";
import api from "../services/api.js";
import { toast } from "react-toastify";

const UserDashboard = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [searchQuery, setSearchQuery] = useState("");

  const [rescheduleModal, setRescheduleModal] = useState({
    open: false,
    appointment: null
  });

  const [bookingModal, setBookingModal] = useState({
    open: false,
    service: null
  });

  const handleReschedule = async (newDate) => {
    const appt = rescheduleModal.appointment;
    if (!appt) return;

    try {
      await api.delete(`/appointments/${appt.appointment_id}`);
      const res = await api.post("/appointments/book", {
        serviceId: appt.service_id,
        providerId: appt.provider_id,
        date: newDate
      });
      toast.success("Appointment rescheduled");
      setAppointments((prev) =>
        prev.map((a) =>
          a.appointment_id === appt.appointment_id ? res.data : a
        )
      );
    } catch (error) {
      console.error("Reschedule error:", error);
      toast.error("Failed to reschedule");
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await api.delete(`/appointments/${appointmentId}`);
      setAppointments((prev) =>
        prev.filter((appt) => appt.appointment_id !== appointmentId)
      );
      toast.success("Appointment cancelled");
    } catch (error) {
      console.error("Cancel appointment error:", error);
      toast.error("Failed to cancel appointment");
    }
  };

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
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unauthorized. Please log in.");
        navigate("/login");
        return;
      }

      try {
        await fetchServices();
        const appointmentsRes = await api.get("/appointments/list");
        setAppointments(
          Array.isArray(appointmentsRes.data.data)
            ? appointmentsRes.data.data
            : []
        );
      } catch (error) {
        console.error("Fetch data error:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // useEffect(() => {
  //   const debounceTimer = setTimeout(() => {
  //     fetchServices(searchQuery);
  //   }, 300);

  //   return () => clearTimeout(debounceTimer);
  // }, [searchQuery]);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-gray-50'>
        <div className='text-center'>
          <div className='loading-spinner mx-auto mb-4 w-8 h-8'></div>
          <p className='text-gray-600'>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto'>
      {/* Page title section */}
      <div className='mb-6 sm:mb-8'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
          {user?.name ? `Welcome, ${user.name}` : "Client Dashboard"}
        </h1>
        <p className='text-gray-600 mt-1'>
          Manage your appointments and services
        </p>
      </div>

      {/* Available Services Section */}
      <section className='mb-8 sm:mb-12'>
        <div className='flex items-center justify-between mb-4 sm:mb-6'>
          <h2 className='text-xl sm:text-2xl font-semibold text-gray-900'>
            Available Services
          </h2>
          <span className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
            {services.length} services
          </span>
        </div>

        {/* Search Input */}
        {/* <div className='mb-4 sm:mb-6'>
          <div className='relative flex items-center justify-between'>
            <input
              type='text'
              placeholder='Search by service name or provider name...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full px-4 py-2 pl-10 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
            />
            <svg
              className='absolute right-8 top-4 h-5 w-5 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
        </div> */}

        {services.length === 0 ? (
          <div className='text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100'>
            <div className='text-4xl mb-4'>🔍</div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No services available
            </h3>
            <p className='text-gray-600'>Check back later for new services.</p>
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
                    onClick={() => setBookingModal({ open: true, service })}
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

      {/* My Appointments Section */}
      <section>
        <div className='flex items-center justify-between mb-4 sm:mb-6'>
          <h2 className='text-xl sm:text-2xl font-semibold text-gray-900'>
            My Appointments
          </h2>
          <span className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
            {appointments.length} appointments
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className='text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100'>
            <div className='text-4xl mb-4'>📅</div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No appointments yet
            </h3>
            <p className='text-gray-600'>
              Book your first appointment to get started.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {appointments.map((appt) => (
              <div
                key={appt.appointment_id}
                className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover-lift'
              >
                <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-lg font-semibold text-gray-900 truncate'>
                      {appt.service_name}
                    </h3>
                    <div className='mt-2 space-y-1 text-sm text-gray-600'>
                      <p className='flex items-center'>
                        <svg
                          className='w-4 h-4 mr-2 text-gray-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                            clipRule='evenodd'
                          />
                        </svg>
                        {new Date(appt.created_at).toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                      <div className='flex items-center justify-between'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            appt.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : appt.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-row sm:flex-col gap-2 sm:w-auto w-full'>
                    <button
                      onClick={() => cancelAppointment(appt.appointment_id)}
                      className='flex-1 sm:flex-none btn btn-secondary text-sm px-4 py-2 touch-target'
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        setRescheduleModal({ open: true, appointment: appt })
                      }
                      className='flex-1 sm:flex-none btn btn-outline text-sm px-4 py-2 touch-target'
                    >
                      Reschedule
                    </button>
                  </div>
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

      <RescheduleModal
        isOpen={rescheduleModal.open}
        onClose={() => setRescheduleModal({ open: false, appointment: null })}
        onSubmit={handleReschedule}
        initialDate={rescheduleModal.appointment?.created_at}
      />
    </div>
  );
};

export default UserDashboard;
