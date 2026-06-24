import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { socketHandler } from "./socket-handler.js";
import { logInfo, logError } from "../utils/logger.js";

let io;

export const initSocket = (server) => {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: [
        "https://appointment-booking-api-1-7zro.onrender.com",
        "http://localhost:5173"
      ],
      credentials: true
    },
    transports: ["polling", "websocket"],
    allowEIO3: true
  });

  io.use((socket, next) => {
    // Primary: explicit token (for future clients that pass it)
    let token = socket.handshake.auth?.token;

    // Fallback: parse JWT from httpOnly cookie sent with polling handshake
    if (!token) {
      const cookieStr = socket.handshake.headers.cookie || "";
      for (const part of cookieStr.split(";")) {
        const [k, ...v] = part.trim().split("=");
        if (k?.trim() === "token") {
          token = decodeURIComponent(v.join("="));
          break;
        }
      }
    }

    if (!token) return next(new Error("Unauthorized"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      logError("Socket auth error", err);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    logInfo(`🛜 Client connected: ${socket.id}`);
    socketHandler(socket);

    socket.on("disconnect", (reason) => {
      logInfo(`🔌 Client disconnected: ${reason}`);
    });
  });

  return io;
};

export const getSocket = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

// Emit helpers
export const emitAppointmentBooked = (appointment) => {
  if (io) io.emit("appointmentBooked", appointment);
};

export const emitAppointmentCancelled = (appointment) => {
  if (io) io.emit("appointmentCancelled", appointment);
};
