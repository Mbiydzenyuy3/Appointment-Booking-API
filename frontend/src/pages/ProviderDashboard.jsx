import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import ServiceForm from "../components/Providers/ServiceForm.jsx";
import ServiceList from "../components/Providers/ServiceList.jsx";
import TimeslotForm from "../components/Providers/TimeSlotForm.jsx";
import TimeslotList from "../components/Providers/TimeSlotList.jsx";
import CalendarSync from "../components/Providers/CalendarSync.jsx";
import api from "../services/api.js";
import toast from "react-hot-toast";
import {
  CheckCircleIcon,
  ClockIcon,
  LightBulbIcon,
  CalendarDaysIcon,
  LinkIcon
} from "@heroicons/react/24/outline";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("services");
  const [appointments, setAppointments] = useState([]);
  const [bookingLink, setBookingLink] = useState("");
  const [profileComplete, setProfileComplete] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    if (!user?.provider_id) {
      setLoading(false);
      return;
    }

    const fetchData = async (providerId) => {
      try {
        const [servicesRes, slotsRes, appointmentsRes, linkRes, profileRes] =
          await Promise.all([
            api.get(`/services/provider/${providerId}`),
            api.get(`/slots/provider/${providerId}`),
            api.get("/appointments/list"),
            api.get(`/providers/${providerId}/booking-link`),
            api.get("/providers/me")
          ]);

        setServices(servicesRes.data.data);
        setTimeSlots(slotsRes.data.data);
        setAppointments(appointmentsRes.data.data || []);
        setBookingLink(linkRes.data.data.booking_link);

        // Check if profile is complete (has bio and phone)
        const profile = profileRes.data.data;
        setProfileComplete(profile.bio && profile.phone);
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
    try {
      const res = await api.post("/services/create", newService);
      setServices((prev) => [...prev, res.data.data]);
      toast.success(
        "Great! Your service has been created and is now available for booking."
      );
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to create services.");
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

  const handleUpdateService = async (serviceId, serviceData) => {
    try {
      const res = await api.put(`/services/${serviceId}`, serviceData);
      setServices((prev) =>
        prev.map((s) => (s.service_id === serviceId ? res.data.data : s))
      );
      setEditingService(null);
      toast.success("Service updated successfully!");
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to update this service.");
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
  };

  const handleCancelEdit = () => {
    setEditingService(null);
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

      {/* Onboarding Progress */}
      {!profileComplete && (
        <div className='mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-sm font-medium text-blue-900'>
                Complete Your Business Profile
              </h3>
              <p className='text-sm text-blue-700 mt-1'>
                Add your business description and contact information to attract
                more clients.
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/provider/profile")}
              className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700'
            >
              Complete Profile
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className='flex justify-center items-center py-12'>
          <div className='text-center'>
            <div className='loading-spinner mx-auto mb-4 w-8 h-8'></div>
            <p className='text-gray-600'>Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <>
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
                    <CheckCircleIcon className='w-4 h-4 mr-2' />
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
                    <ClockIcon className='w-4 h-4 mr-2' />
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
                    <CheckCircleIcon className='w-4 h-4 mr-2' />
                    Bookings ({appointments.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`py-3 px-4 rounded-lg font-medium text-sm touch-target transition-all duration-200 ${
                    activeTab === "calendar"
                      ? "bg-purple-600 text-white"
                      : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  <div className='flex items-center justify-center'>
                    <CalendarDaysIcon className='w-4 h-4 mr-2' />
                    Calendar
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
                    <LightBulbIcon className='w-4 h-4 mr-2' />
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
                  <button
                    onClick={() => setActiveTab("calendar")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === "calendar"
                        ? "bg-purple-600 text-white"
                        : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    Calendar
                  </button>
                </div>
              </div>
            </div>

            {activeTab === "services" && (
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                <div className='p-4 sm:p-6 border-b border-gray-100'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
                      <CheckCircleIcon className='w-5 h-5 mr-2 text-green-600' />
                      Your Services
                    </h2>
                    <span className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                      {services.length}
                    </span>
                  </div>
                </div>
                <div className='p-4 sm:p-6'>
                  <ServiceForm
                    onCreate={handleCreateService}
                    onUpdate={handleUpdateService}
                    editingService={editingService}
                    onCancelEdit={handleCancelEdit}
                  />
                  {services.length === 0 ? (
                    <div className='text-center py-8'>
                      <div className='text-3xl mb-2'>📋</div>
                      <p className='text-gray-500 mb-4'>No services yet.</p>
                      <p className='text-sm text-gray-400'>
                        Create your first service to get started.
                      </p>
                    </div>
                  ) : (
                    <div className='mt-16'>
                      <ServiceList
                        services={services}
                        onDelete={handleDeleteService}
                        onEdit={handleEditService}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "availability" && (
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                <div className='p-4 sm:p-6 border-b border-gray-100'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
                      <ClockIcon className='w-5 h-5 mr-2 text-green-600' />
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
              <>
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                  <div className='p-4 sm:p-6 border-b border-gray-100'>
                    <div className='flex items-center justify-between'>
                      <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
                        <CheckCircleIcon className='w-5 h-5 mr-2 text-blue-600' />
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
                          Share your booking link to start receiving
                          appointments.
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
                                    <CalendarDaysIcon className='w-4 h-4 mr-2 text-gray-400' />
                                    {new Date(appt.created_at).toLocaleString(
                                      "en-US",
                                      {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      }
                                    )}
                                  </p>
                                  <p>Client: {appt.client_name}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Link Section */}
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                  <div className='p-4 sm:p-6 border-b border-gray-100'>
                    <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
                      <LinkIcon className='w-5 h-5 mr-2 text-purple-600' />
                      Your Booking Link
                    </h2>
                  </div>
                  <div className='p-4 sm:p-6'>
                    <p className='text-gray-600 mb-4'>
                      Share this link with clients to let them book your
                      services directly and easily.
                    </p>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
                      <input
                        type='text'
                        value={bookingLink}
                        readOnly
                        className='flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono text-gray-700'
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(bookingLink);
                          toast.success(
                            "Booking link copied! Share it with your clients to start getting bookings."
                          );
                        }}
                        className='px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors duration-200 whitespace-nowrap'
                      >
                        Copy Link
                      </button>
                    </div>
                    <p className='text-xs text-gray-500 mt-3'>
                      This link directs clients to your profile where they can
                      view your services and book appointments instantly.
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeTab === "calendar" && <CalendarSync />}
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
                      <div className='mt-16'>
                        <ServiceList
                          services={services}
                          onDelete={handleDeleteService}
                        />
                      </div>
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
                      <div className='space-y-4'>
                        {appointments.map((appt) => (
                          <div
                            key={appt.appointment_id}
                            className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover-lift'
                          >
                            <div className='flex flex-col gap-4'>
                              <div className='min-w-0'>
                                <h3 className='text-lg font-semibold text-gray-900 truncate'>
                                  {appt.service_name}
                                </h3>
                                <div className='mt-2 space-y-1 text-sm text-gray-600'>
                                  <p className='flex items-center'>
                                    <CalendarDaysIcon className='w-4 h-4 mr-2 text-gray-400' />
                                    {new Date(appt.created_at).toLocaleString(
                                      "en-US",
                                      {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      }
                                    )}
                                  </p>
                                  <p>Client: {appt.client_name}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
