// src/components/Appointments/Appointments.jsx
import axios from "axios";
export const createAppointments = (AppointmentData) =>
  axios.post("/Appointments/book", AppointmentData);
export const getAppointments = () => axios.get(`/appointments/list`);
export const deleteAppointments = (appointmentId) =>
  axios.delete("/:appointmentId", appointmentId);
