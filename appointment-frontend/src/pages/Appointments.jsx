// src/pages/AppointmentPage.jsx
import { useEffect, useState } from "react";
import api from "../services/api.js";
import { toast } from "react-toastify";

export default function AppointmentPage() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const response = await api.get("/appointments/me");
        setAppointments(response.data);
      } catch (error) {
        toast.error("Failed to fetch appointments");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Appointments</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt._id} className="p-4 bg-white shadow rounded">
              <p>
                <strong>Date:</strong>{" "}
                {new Date(appt.slot?.time).toLocaleString()}
              </p>
              <p>
                <strong>Provider:</strong> {appt.provider?.name}
              </p>
              <p>
                <strong>Status:</strong> {appt.status}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No appointments found.</p>
      )}
    </div>
  );
}
