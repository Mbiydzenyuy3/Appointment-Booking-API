//services/notification.js
import { getSocket } from "../utils/websocket.js";
import { logInfo, logError } from "../utils/logger.js";

export const emitAppointmentBooked = (appointment) => {
  try {
    getSocket().emit("appointmentBooked", appointment);
    logInfo("Appointment booked event emitted.");
  } catch (error) {
    logError("Failed to emit appointment booked event", error);
  }
};

export const emitAppointmentCancelled = (appointment) => {
  try {
    getSocket().emit("appointmentCancelled", appointment);
    logInfo("Appointment cancelled event emitted.");
  } catch (error) {
    logError("Failed to emit appointment cancelled event", error);
  }
};
