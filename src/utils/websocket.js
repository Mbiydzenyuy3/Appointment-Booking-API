// src/utils/websocket.js
import { Server } from "socket.io";

let io;

//Initialize the WebSocket server
 
export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" }, // Adjust in production!
  });
  return io;
};

//Get the initialized io instance safely

export const getSocket = () => {
  if (!io) {
    throw new Error(
      "Socket.io not initialized. Call initSocket(server) first."
    );
  }
  return io;
};
