import { io } from "../utils/websocket.js";

export const emitAppointmentBooked = (appointment) => {
  io.emit("appointmentBooked", appointment);
};

export const emitAppointmentCancelled = (appointment) => {
  io.emit("appointmentCancelled", appointment);
};
