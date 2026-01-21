import axios from "axios";
export const createAppointments = (AppointmentData) =>
  axios.post("/appointments/book", AppointmentData);
export const getAppointments = () => axios.get(`/appointments/list`);
export const deleteAppointments = (appointmentId) =>
  axios.delete(`/appointments/${appointmentId}`);
