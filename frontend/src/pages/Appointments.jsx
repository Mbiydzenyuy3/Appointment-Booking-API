import React from "react";
import { useEffect, useState } from "react";
import api from "../services/api.js";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { useLocation } from "react-router-dom";
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/solid";

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

  // Status display removed as status column was dropped in MVP simplification

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
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600'>
                    <div className='flex items-center'>
                      <CalendarIcon className='w-4 h-4 mr-2 text-gray-400' />
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
                        <UserIcon className='w-4 h-4 mr-2 text-gray-400' />
                        Client: {appointment.client_name || "N/A"}
                      </div>
                    )}

                    {isClientView && appointment.provider && (
                      <div className='flex items-center'>
                        <UserIcon className='w-4 h-4 mr-2 text-gray-400' />
                        Provider: {appointment.provider_name || "N/A"}
                      </div>
                    )}

                    {appointment.duration_minutes && (
                      <div className='flex items-center'>
                        <ClockIcon className='w-4 h-4 mr-2 text-gray-400' />
                        {appointment.duration_minutes} minutes
                      </div>
                    )}

                    {appointment.price && (
                      <div className='flex items-center'>
                        <CurrencyDollarIcon className='w-4 h-4 mr-2 text-gray-400' />
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
