import React from "react";
import { useEffect, useState } from "react";
import api from "../services/api.js";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { useLocation } from "react-router-dom";

export default function AppointmentPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClientView, setIsClientView] = useState(false);

  useEffect(() => {
    setIsClientView(location.pathname === "/my-appointments");
  }, [location.pathname]);

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to view appointments");
      setIsLoading(false);
      return;
    }
  }, [user]);

  useEffect(() => {
    async function fetchAppointments() {
      if (!user) return;

      try {
        const response = await api.get("/appointments/list");
        setAppointments(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch appointments"
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchAppointments();
  }, [isClientView, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    try {
      await api.delete(`/appointments/${appointmentId}`);
      toast.success("Appointment cancelled successfully");
      const response = await api.get("/appointments/list");
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast.error(
        error.response?.data?.message || "Failed to cancel appointment"
      );
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-gray-50'>
        <div className='text-center'>
          <div className='loading-spinner mx-auto mb-4 w-8 h-8'></div>
          <p className='text-gray-600'>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='mb-6 sm:mb-8'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
          {isClientView ? "My Appointments" : "Appointment Requests"}
        </h1>
        <p className='text-gray-600 mt-1'>
          {isClientView
            ? "View and manage your booked appointments"
            : "Manage your booked appointments and client bookings"}
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className='text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100'>
          <div className='text-4xl mb-4'>📅</div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No appointments yet
          </h3>
          <p className='text-gray-600'>
            {isClientView
              ? "You haven't booked any appointments yet."
              : "You haven't received any appointment bookings yet."}
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover-lift'
            >
              <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between mb-3'>
                    <h3 className='text-lg font-semibold text-gray-900 truncate'>
                      {appointment.service_name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600'>
                    <div className='flex items-center'>
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
                      {new Date(
                        appointment.date || appointment.slot?.time
                      ).toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>

                    {!isClientView && (
                      <div className='flex items-center'>
                        <svg
                          className='w-4 h-4 mr-2 text-gray-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                            clipRule='evenodd'
                          />
                        </svg>
                        Client: {appointment.client_name || "N/A"}
                      </div>
                    )}

                    {isClientView && appointment.provider && (
                      <div className='flex items-center'>
                        <svg
                          className='w-4 h-4 mr-2 text-gray-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                            clipRule='evenodd'
                          />
                        </svg>
                        Provider: {appointment.provider_name || "N/A"}
                      </div>
                    )}

                    {appointment.duration_minutes && (
                      <div className='flex items-center'>
                        <svg
                          className='w-4 h-4 mr-2 text-gray-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                            clipRule='evenodd'
                          />
                        </svg>
                        {appointment.duration_minutes} minutes
                      </div>
                    )}

                    {appointment.price && (
                      <div className='flex items-center'>
                        <svg
                          className='w-4 h-4 mr-2 text-gray-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path d='M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z' />
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z'
                            clipRule='evenodd'
                          />
                        </svg>
                        {formatPrice(appointment.price)}
                      </div>
                    )}
                  </div>

                  {appointment.notes && (
                    <div className='mt-3 p-3 bg-gray-50 rounded-lg'>
                      <p className='text-sm text-gray-600'>
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className='flex flex-row lg:flex-col gap-2 lg:w-auto w-full lg:min-w-[120px]'>
                  {!isClientView && appointment.status === "pending" && (
                    <>
                      <button className='flex-1 lg:flex-none btn btn-primary text-sm px-4 py-2 touch-target'>
                        Confirm
                      </button>
                      <button className='flex-1 lg:flex-none btn btn-secondary text-sm px-4 py-2 touch-target'>
                        Decline
                      </button>
                    </>
                  )}
                  {!isClientView && appointment.status === "confirmed" && (
                    <button className='flex-1 lg:flex-none btn btn-outline text-sm px-4 py-2 touch-target'>
                      Reschedule
                    </button>
                  )}
                  {isClientView && appointment.status === "confirmed" && (
                    <>
                      <button className='flex-1 lg:flex-none btn btn-outline text-sm px-4 py-2 touch-target'>
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(appointment.appointment_id)}
                        className='flex-1 lg:flex-none btn btn-secondary text-sm px-4 py-2 touch-target'
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {!isClientView && appointment.status === "confirmed" && (
                    <>
                      <button className='flex-1 lg:flex-none btn btn-outline text-sm px-4 py-2 touch-target'>
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(appointment.appointment_id)}
                        className='flex-1 lg:flex-none btn btn-secondary text-sm px-4 py-2 touch-target'
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
