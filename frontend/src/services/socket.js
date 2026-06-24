import { io } from "socket.io-client";

let socket = null;

export function connectSocket() {
  if (socket?.connected) return socket;

  // No explicit token — httpOnly cookie is sent automatically with polling handshake
  socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    transports: ["polling", "websocket"]
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}
