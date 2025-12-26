// src/sockets/socket.js
import { Server } from "socket.io";
import { socketHandler } from "./socket-handler.js"; // Import your detailed socket event handlers
import { logInfo } from "../utils/logger.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(",") || [
        "https://appointment-booking-api-1-7zro.onrender.com",
        "http://localhost:5173",
        "http://localhost:5174"
      ]
    }
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
