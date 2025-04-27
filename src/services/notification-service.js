//services/notification.js
import { io } from "../utils/websocket.js";
import { logInfo, logError } from "../utils/logger.js";

export const emitAppointmentBooked = (appointment) => {
  try {
    io.emit("appointmentBooked", appointment);
    logInfo("Appointment booked event emitted.");
  } catch (error) {
    logError("Failed to emit appointment booked event", error);
  }
};

export const emitAppointmentCancelled = (appointment) => {
  try {
    io.emit("appointmentCancelled", appointment);
    logInfo("Appointment cancelled event emitted.");
  } catch (error) {
    logError("Failed to emit appointment cancelled event", error);
  }
};
