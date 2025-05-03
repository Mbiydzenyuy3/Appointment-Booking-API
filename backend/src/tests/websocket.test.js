import { Server } from "socket.io";
import { createServer } from "http";
import Client from "socket.io-client";
import { describe, it, beforeAll, afterAll, expect } from "vitest";

describe("WebSocket Connection", () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);

    // Ensure the HTTP server starts listening before creating the client
    httpServer.listen(() => {
      const port = httpServer.address().port;

      // Establish the client connection
      clientSocket = Client(`http://localhost:${port}`);

      // Wait for server connection
      io.on("connection", (socket) => {
        serverSocket = socket; // Assign the server socket only when the client connects
        done(); // Notify that the connection has been made
      });
    });
  });

  afterAll(() => {
    if (io) io.close();
    if (clientSocket) clientSocket.close();
  });

  it("should connect to WebSocket server", () => {
    // Ensure that the client is connected before making assertions
    expect(clientSocket.connected).toBe(true);
  });

  it("should emit and receive an event", (done) => {
    // Ensure serverSocket is properly assigned before handling events
    if (!serverSocket) {
      done(new Error("serverSocket not connected"));
      return;
    }

    serverSocket.on("hello", (msg) => {
      expect(msg).toBe("world");
      done();
    });

    // Emit an event from the client to the server
    clientSocket.emit("hello", "world");
  });
});
