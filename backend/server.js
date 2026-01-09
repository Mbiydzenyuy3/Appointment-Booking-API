import http from "http";
import app from "./app.js";
import { initSocket } from "./src/sockets/socket.js";

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// ✅ INIT SOCKET ONCE
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
