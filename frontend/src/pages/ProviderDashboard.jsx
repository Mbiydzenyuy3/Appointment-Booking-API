import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import ServiceForm from "../components/Providers/ServiceForm.jsx";
import ServiceList from "../components/Providers/ServiceList.jsx";
import TimeslotForm from "../components/Providers/TimeSlotForm.jsx";
import TimeslotList from "../components/Providers/TimeSlotList.jsx";
// import Appointments from "../components/Appointments/Appointments.jsx";
// import AuthDebugger from "../components/Providers/AuthDebugger.jsx";
import api from "../services/api.js";
import toast from "react-hot-toast";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("services");
  const [appointments, setAppointments] = useState([]);
  const [bookingLink, setBookingLink] = useState("");

  useEffect(() => {
    if (!user?.provider_id) return;

    const fetchData = async (providerId) => {
      try {
        const [servicesRes, slotsRes, appointmentsRes, linkRes] =
          await Promise.all([
            api.get(`/services/provider/${providerId}`),
            api.get(`/slots/provider/${providerId}`),
            api.get("/appointments/list"),
            api.get(`/providers/${providerId}/booking-link`)
          ]);

        setServices(servicesRes.data.data);
        setTimeSlots(slotsRes.data.data);
        setAppointments(appointmentsRes.data.data || []);
        setBookingLink(linkRes.data.data.booking_link);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData(user.provider_id);
  }, [user]);

  const handleCreateService = async (newService) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not logged in. Please log in again.");
      return;
    }

    try {
      const res = await api.post("/services/create", newService);
      setServices((prev) => [...prev, res.data.data]);
      toast.success(
        "Great! Your service has been created and is now available for booking."
      );
    } catch (error) {
      console.error("Create service error:", error);

      if (error.response?.status === 401) {
        toast.error("Sign in failed. Please try again.");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to create services.");
      } else if (
        error.response?.status === 400 &&
        error.response?.data?.errors
      ) {
        const validationErrors = error.response.data.errors;
        if (validationErrors.length > 0) {
          toast.error(`Validation error: ${validationErrors.join(", ")}`);
        } else {
          toast.error(error.response?.data?.message || "Invalid service data");
        }
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await api.delete(`/services/${serviceId}`);
      setServices((prev) => prev.filter((s) => s.service_id !== serviceId));
      toast.success("Service removed successfully. Your changes are saved.");
    } catch (error) {
      console.error("Delete service error:", error);
      toast.error("Something went wrong");
    }
  };

  const handleCreateTimeSlot = async (slot) => {
    try {
      const res = await api.post("/slots/create", slot);
      setTimeSlots((prev) => [...prev, res.data.data]);
      toast.success(
        "Perfect! Your time slot has been added and is ready for bookings."
      );
    } catch (error) {
      console.error("Create timeslot error:", error);
      toast.error("Something went wrong");
    }
  };

  const handleDeleteTimeSlot = async (slotId) => {
    try {
      await api.delete(`/slots/${slotId}`);
      setTimeSlots((prev) => prev.filter((s) => s.timeslot_id !== slotId));
      toast.success("Time slot removed. Your schedule has been updated.");
    } catch (error) {
      console.error("Delete timeslot error:", error);
      toast.error("Something went wrong");
    }
  };

  if (!user) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='text-center'>
          <div className='text-4xl mb-4'>🔒</div>
          <p className='text-lg text-gray-600 mb-4'>
            You must be logged in to view this page.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className='btn btn-primary touch-target'
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen max-w-7xl mx-auto'>
      <div className='mb-6 sm:mb-8'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
          Business Dashboard
        </h1>
        <p className='text-gray-600 mt-1'>
          Welcome, {user?.email || "Business Owner"}! Manage your services and
          schedule.
        </p>
      </div>

      {loading ? (
        <div className='flex justify-center items-center py-12'>
          <div className='text-center'>
            <div className='loading-spinner mx-auto mb-4 w-8 h-8'></div>
            <p className='text-gray-600'>Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* <AuthDebugger /> */}
          <div className='mb-6 sm:hidden'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-2'>
              <div className='grid grid-cols-3 gap-2'>
                <button
                  onClick={() => setActiveTab("services")}
                  className={`py-3 px-4 rounded-lg font-medium text-sm touch-target transition-all duration-200 ${
                    activeTab === "services"
                      ? "bg-green-600 text-white"
                      : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                  }`}
                >
                  <div className='flex items-center justify-center'>
                    <svg
                      className='w-4 h-4 mr-2'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    Services ({services.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("availability")}
                  className={`py-3 px-4 rounded-lg font-medium text-sm touch-target transition-all duration-200 ${
                    activeTab === "availability"
                      ? "bg-green-600 text-white"
                      : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                  }`}
                >
                  <div className='flex items-center justify-center'>
                    <svg
                      className='w-4 h-4 mr-2'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                        clipRule='evenodd'
                      />
                    </svg>
                    Availability ({timeSlots.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`py-3 px-4 rounded-lg font-medium text-sm touch-target transition-all duration-200 ${
                    activeTab === "bookings"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <div className='flex items-center justify-center'>
                    <svg
                      className='w-4 h-4 mr-2'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    Bookings ({appointments.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("marketing")}
                  className={`py-3 px-4 rounded-lg font-medium text-sm touch-target transition-all duration-200 ${
                    activeTab === "marketing"
                      ? "bg-purple-600 text-white"
                      : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  <div className='flex items-center justify-center'>
                    <svg
                      className='w-4 h-4 mr-2'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h1.49c.83 0 1.5.67 1.5 1.5S14.33 17 13.5 17h-3C9.67 17 9 16.33 9 15.5v-1.379c.234-.121.406-.312.523-.531.472-.722 1.264-1.09 2.475-1.09z' />
                    </svg>
                    Marketing
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className='hidden sm:block'>
            <div className='mb-6'>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-1'>
                <div className='flex space-x-1'>
                  <button
                    onClick={() => setActiveTab("services")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === "services"
                        ? "bg-green-600 text-white"
                        : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                    }`}
                  >
                    Services
                  </button>
                  <button
                    onClick={() => setActiveTab("availability")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === "availability"
                        ? "bg-green-600 text-white"
                        : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                    }`}
                  >
                    Availability
                  </button>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === "bookings"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    Bookings
                  </button>
                </div>
              </div>
            </div>

            {activeTab === "services" && (
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                <div className='p-4 sm:p-6 border-b border-gray-100'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
                      <svg
                        className='w-5 h-5 mr-2 text-green-600'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      Your Services
                    </h2>
                    <span className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                      {services.length}
                    </span>
                  </div>
                </div>
                <div className='p-4 sm:p-6'>
                  <ServiceForm onCreate={handleCreateService} />
                  {services.length === 0 ? (
                    <div className='text-center py-8'>
                      <div className='text-3xl mb-2'>📋</div>
                      <p className='text-gray-500 mb-4'>No services yet.</p>
                      <p className='text-sm text-gray-400'>
                        Create your first service to get started.
                      </p>
                    </div>
                  ) : (
                    <ServiceList
                      services={services}
                      onDelete={handleDeleteService}
                    />
                  )}
                </div>
              </div>
            )}

            {activeTab === "availability" && (
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                <div className='p-4 sm:p-6 border-b border-gray-100'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
                      <svg
                        className='w-5 h-5 mr-2 text-green-600'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                          clipRule='evenodd'
                        />
                      </svg>
                      Your Availability
                    </h2>
                    <span className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                      {timeSlots.length}
                    </span>
                  </div>
                </div>
                <div className='p-4 sm:p-6'>
                  <TimeslotForm
                    onCreate={handleCreateTimeSlot}
                    services={services}
                    providerId={user.provider_id}
                  />
                  {timeSlots.length === 0 ? (
                    <div className='text-center py-8'>
                      <div className='text-3xl mb-2'>⏰</div>
                      <p className='text-gray-500 mb-4'>
                        No availability set yet.
                      </p>
                      <p className='text-sm text-gray-400'>
                        Set your available times for bookings.
                      </p>
                    </div>
                  ) : (
                    <TimeslotList
                      timeslots={timeSlots}
                      onDelete={handleDeleteTimeSlot}
                    />
                  )}
                </div>
              </div>
            )}

            {activeTab === "bookings" && (
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                <div className='p-4 sm:p-6 border-b border-gray-100'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
                      <svg
                        className='w-5 h-5 mr-2 text-blue-600'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      Your Bookings
                    </h2>
                    <span className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                      {appointments.length}
                    </span>
                  </div>
                </div>
                <div className='p-4 sm:p-6'>
                  {appointments.length === 0 ? (
                    <div className='text-center py-8'>
                      <div className='text-3xl mb-2'>📅</div>
                      <p className='text-gray-500 mb-4'>No bookings yet.</p>
                      <p className='text-sm text-gray-400'>
                        Share your booking link to start receiving appointments.
                      </p>
                    </div>
                  ) : (
                    <Appointments appointments={appointments} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Content */}
          <div className='sm:hidden'>
            {activeTab === "services" && (
              <div className='space-y-6'>
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                  <div className='p-4 border-b border-gray-100'>
                    <h2 className='text-lg font-semibold text-gray-900'>
                      Create Service
                    </h2>
                  </div>
                  <div className='p-4'>
                    <ServiceForm onCreate={handleCreateService} />
                  </div>
                </div>
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                  <div className='p-4 border-b border-gray-100'>
                    <h2 className='text-lg font-semibold text-gray-900'>
                      Your Services ({services.length})
                    </h2>
                  </div>
                  <div className='p-4'>
                    {services.length === 0 ? (
                      <div className='text-center py-8'>
                        <div className='text-3xl mb-2'>📋</div>
                        <p className='text-gray-500 mb-4'>No services yet.</p>
                        <p className='text-sm text-gray-400'>
                          Create your first service to get started.
                        </p>
                      </div>
                    ) : (
                      <ServiceList
                        services={services}
                        onDelete={handleDeleteService}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "availability" && (
              <div className='space-y-6'>
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                  <div className='p-4 border-b border-gray-100'>
                    <h2 className='text-lg font-semibold text-gray-900'>
                      Set Availability
                    </h2>
                  </div>
                  <div className='p-4'>
                    <TimeslotForm
                      onCreate={handleCreateTimeSlot}
                      services={services}
                      providerId={user.provider_id}
                    />
                  </div>
                </div>
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                  <div className='p-4 border-b border-gray-100'>
                    <h2 className='text-lg font-semibold text-gray-900'>
                      Your Availability ({timeSlots.length})
                    </h2>
                  </div>
                  <div className='p-4'>
                    {timeSlots.length === 0 ? (
                      <div className='text-center py-8'>
                        <div className='text-3xl mb-2'>⏰</div>
                        <p className='text-gray-500 mb-4'>
                          No availability set yet.
                        </p>
                        <p className='text-sm text-gray-400'>
                          Set your available times for bookings.
                        </p>
                      </div>
                    ) : (
                      <TimeslotList
                        timeslots={timeSlots}
                        onDelete={handleDeleteTimeSlot}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "bookings" && (
              <div className='space-y-6'>
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                  <div className='p-4 border-b border-gray-100'>
                    <h2 className='text-lg font-semibold text-gray-900'>
                      Your Bookings ({appointments.length})
                    </h2>
                  </div>
                  <div className='p-4'>
                    {appointments.length === 0 ? (
                      <div className='text-center py-8'>
                        <div className='text-3xl mb-2'>📅</div>
                        <p className='text-gray-500 mb-4'>No bookings yet.</p>
                        <p className='text-sm text-gray-400'>
                          Share your booking link to start receiving
                          appointments.
                        </p>
                      </div>
                    ) : (
                      <Appointments appointments={appointments} />
                    )}
                  </div>
                </div>

                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                  <div className='p-4 border-b border-gray-100'>
                    <h2 className='text-lg font-semibold text-gray-900'>
                      Booking Link
                    </h2>
                  </div>
                  <div className='p-4'>
                    <p className='text-gray-600 mb-3'>
                      Share this link with clients to book directly:
                    </p>
                    <div className='flex flex-col space-y-2'>
                      <input
                        type='text'
                        value={bookingLink}
                        readOnly
                        className='px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm'
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(bookingLink);
                          toast.success(
                            "Link copied! Share it with your clients to start getting bookings."
                          );
                        }}
                        className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium'
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
