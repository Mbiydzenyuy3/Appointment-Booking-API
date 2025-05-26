// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import RescheduleModal from "../components/Appointments/ResheduleModal.jsx";
import api from "../services/api.js";
import { toast } from "react-toastify";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rescheduleModal, setRescheduleModal] = useState({
    open: false,
    appointment: null,
  });

  const handleReschedule = async (newDate) => {
    const appt = rescheduleModal.appointment;
    try {
      await api.delete(`/appointments/${appt._id}`);
      const res = await api.post("/appointments/book", {
        serviceId: appt.serviceId,
        providerId: appt.providerId,
        date: newDate,
      });
      toast.success("Appointment rescheduled");
      setAppointments((prev) =>
        prev.map((a) => (a._id === appt._id ? res.data : a))
      );
    } catch (error) {
      toast.error("Failed to reschedule");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unauthorized. Please log in.");
        logout();
        return;
      }

      try {
        const servicesRes = await api.get("/services");
        const appointmentsRes = await api.get("/appointments/list");

        const fetchedServices = servicesRes?.data?.data;
        const fetchedAppointments = appointmentsRes?.data?.data;

        setServices(Array.isArray(fetchedServices) ? fetchedServices : []);
        setAppointments(
          Array.isArray(fetchedAppointments) ? fetchedAppointments : []
        );
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [logout]);

  const cancelAppointment = async (appointmentId) => {
    try {
      await api.delete(`/appointments/${appointmentId}`);
      setAppointments((prev) =>
        prev.filter((appt) => appt._id !== appointmentId)
      );
      toast.success("Appointment cancelled");
    } catch (error) {
      toast.error("Failed to cancel appointment");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Client Dashboard</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Available Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(services) &&
            services.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">
                  {service.service_name}
                </h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <p className="text-gray-600 mb-4">{service.price}</p>
                <p className="text-gray-600 mb-4">{service.duration_minutes}</p>
                <a
                  href={`/book/${service._id}`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Book Appointment
                </a>
              </div>
            ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">My Appointments</h2>
        {appointments.length === 0 ? (
          <p className="text-gray-600">You have no appointments.</p>
        ) : (
          <ul className="space-y-4">
            {appointments.map((appt) => (
              <li
                key={appt._id}
                className="bg-white p-4 shadow rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">{appt.serviceName}</p>
                  <p className="text-gray-600">
                    {new Date(appt.date).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-gray-500">Status: {appt.status}</p>
                </div>
                <div className="flex">
                  <button
                    onClick={() => cancelAppointment(appt._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      setRescheduleModal({ open: true, appointment: appt })
                    }
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Reschedule
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <RescheduleModal
        isOpen={rescheduleModal.open}
        onClose={() => setRescheduleModal({ open: false, appointment: null })}
        onSubmit={handleReschedule}
        initialDate={rescheduleModal.appointment?.date}
      />
    </div>
  );
};

export default UserDashboard;
