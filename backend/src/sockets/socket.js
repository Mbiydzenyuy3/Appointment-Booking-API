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
      ],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    logInfo("🛜 Client connected:", socket.id);
    socketHandler(socket); // Handle custom events per client
  });
};

// Emitting appointment events
export const emitAppointmentBooked = (appointment) => {
  if (!io) return console.warn("Socket not initialized");
  io.emit("appointmentBooked", appointment);
};

export const emitAppointmentCancelled = (appointment) => {
  if (!io) return console.warn("Socket not initialized");
  io.emit("appointmentCancelled", appointment);
};
