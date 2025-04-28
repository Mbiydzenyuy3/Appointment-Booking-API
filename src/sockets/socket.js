// src/sockets/socket.js
import { Server } from "socket.io";
import { socketHandler } from "../sockets/socket-handler.js"; // Import your detailed socket event handlers
import { logInfo } from "../utils/logger.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    logInfo("🛜 Client connected:", socket.id);
    socketHandler(socket); // Handle custom events per client
  });
};

// Emitting appointment events
export const emitAppointmentBooked = (appointment) => {
  io.emit("appointmentBooked", appointment);
};

export const emitAppointmentCancelled = (appointment) => {
  io.emit("appointmentCancelled", appointment); // 🛠️ fixed typo here
};
