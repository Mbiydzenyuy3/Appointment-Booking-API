import {
  emitAppointmentBooked,
  emitAppointmentCancelled,
} from "../sockets/socket.js";

//after booking
emitAppointmentBooked(appointment);

//after appointment is cancelled
emitAppointmentCancelled(appointment);
