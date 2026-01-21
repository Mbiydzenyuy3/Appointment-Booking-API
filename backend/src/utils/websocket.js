import { Server } from "socket.io";

let io = null;

export const initSocket = (server) => {
  if (io) {
    console.warn("Socket.io already initialized");
    return io;
  }

  io = new Server(server, {
    cors: {
      origin: "https://appointment-booking-api-1-7zro.onrender.com",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket", "polling"] // Render-safe
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getSocket = () => {
  if (!io) {
    throw new Error(
      "Socket.io not initialized. Call initSocket(server) first."
    );
  }
  return io;
};
