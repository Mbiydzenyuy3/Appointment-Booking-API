import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL;
    if (!backendUrl) return;

    const socketInstance = io(backendUrl, {
      // Start with polling so Render's free tier works; upgrade to WS if available.
      transports: ["polling", "websocket"],
      timeout: 5000,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000
    });

    socketInstance.on("connect", () => setIsConnected(true));
    socketInstance.on("disconnect", () => setIsConnected(false));
    socketInstance.on("connect_error", () => setIsConnected(false));

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const value = {
    socket,
    isConnected
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
