import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import ServiceForm from "../components/Providers/ServiceForm.jsx";
import ServiceList from "../components/Providers/ServiceList.jsx";
import TimeslotForm from "../components/Providers/TimeSlotForm.jsx";
import TimeslotList from "../components/Providers/TimeSlotList.jsx";
import AuthDebugger from "../components/Providers/AuthDebugger.jsx";
import api from "../services/api.js";
import toast from "react-hot-toast";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("services");

  useEffect(() => {
    if (!user?.provider_id) return;

    const fetchData = async (providerId) => {
      try {
        const [servicesRes, slotsRes] = await Promise.all([
          api.get(`/services/provider/${providerId}`),
          api.get(`/slots/provider/${providerId}`)
        ]);

        setServices(servicesRes.data.data);
        setTimeSlots(slotsRes.data.data);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData(user.provider_id);
  }, [user]);

  const handleCreateService = async (newService) => {
    console.log("Creating service with data:", newService);
    console.log("Current user:", user);

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not logged in. Please log in again.");
      return;
    }

    try {
      const res = await api.post("/services/create", newService);
      setServices((prev) => [...prev, res.data.data]);
      toast.success("Service created");
    } catch (error) {
      console.error("Create service error:", error);

      // More specific error handling
      if (error.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
        // Optionally redirect to login or trigger logout
        // window.location.href = "/login";
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to create services.");
      } else if (
        error.response?.status === 400 &&
        error.response?.data?.errors
      ) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        if (validationErrors.length > 0) {
          toast.error(`Validation error: ${validationErrors.join(", ")}`);
        } else {
          toast.error(error.response?.data?.message || "Invalid service data");
        }
      } else {
        toast.error(
          error.response?.data?.message || "Failed to create service"
        );
      }
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await api.delete(`/services/${serviceId}`);
      setServices((prev) => prev.filter((s) => s.service_id !== serviceId));
      toast.success("Service deleted");
    } catch (error) {
      console.error("Delete service error:", error);
      toast.error("Failed to delete service");
    }
  };

  const handleCreateTimeSlot = async (slot) => {
    try {
      const res = await api.post("/slots/create", slot);
      setTimeSlots((prev) => [...prev, res.data.data]);
      toast.success("Timeslot created");
    } catch (error) {
      console.error("Create timeslot error:", error);
      toast.error("Failed to create timeslot");
    }
  };

  const handleDeleteTimeSlot = async (slotId) => {
    try {
      await api.delete(`/slots/${slotId}`);
      setTimeSlots((prev) => prev.filter((s) => s.timeslot_id !== slotId));
      toast.success("Timeslot deleted");
    } catch (error) {
      console.error("Delete timeslot error:", error);
      toast.error("Failed to delete timeslot");
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
      {/* Page title section */}
      <div className='mb-6 sm:mb-8'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
          Provider Dashboard
        </h1>
        <p className='text-gray-600 mt-1'>
          Welcome, {user?.email || "Provider"}! Manage your services and
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
          {/* Authentication Debugger - Remove in production */}
          <AuthDebugger />

          {/* Mobile Tab Navigation */}
          <div className='mb-6 sm:hidden'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-2'>
              <div className='flex space-x-2'>
                <button
                  onClick={() => setActiveTab("services")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm touch-target transition-all duration-200 ${
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
                  onClick={() => setActiveTab("timeslots")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm touch-target transition-all duration-200 ${
                    activeTab === "timeslots"
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
                    Timeslots ({timeSlots.length})
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className='hidden sm:block'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Services Section */}
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

              {/* Timeslots Section */}
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
                      Your Timeslots
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
                      <p className='text-gray-500 mb-4'>No timeslots yet.</p>
                      <p className='text-sm text-gray-400'>
                        Create timeslots for your services.
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

            {activeTab === "timeslots" && (
              <div className='space-y-6'>
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                  <div className='p-4 border-b border-gray-100'>
                    <h2 className='text-lg font-semibold text-gray-900'>
                      Create Timeslot
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
                      Your Timeslots ({timeSlots.length})
                    </h2>
                  </div>
                  <div className='p-4'>
                    {timeSlots.length === 0 ? (
                      <div className='text-center py-8'>
                        <div className='text-3xl mb-2'>⏰</div>
                        <p className='text-gray-500 mb-4'>No timeslots yet.</p>
                        <p className='text-sm text-gray-400'>
                          Create timeslots for your services.
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
          </div>
        </>
      )}
    </div>
  );
}
