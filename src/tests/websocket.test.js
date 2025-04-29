import { Server } from "socket.io";
import { createServer } from "node:http";
import Client from "socket.io-client";
import { describe, before, after, it } from "node:test";

describe("WebSocket Connection", () => {
  let io, serverSocket, clientSocket;

  before((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = Client(`http://localhost:${port}`);

      io.on("connection", (socket) => {
        serverSocket = socket;
      });

      clientSocket.on("connect", done);
    });
  });

  after(() => {
    io.close();
    clientSocket.close();
  });

  it("should connect to WebSocket server", () => {
    expect(clientSocket.connected).toBe(true);
  });

  it("should emit and receive an event", (done) => {
    serverSocket.on("hello", (arg) => {
      expect(arg).toBe("world");
      done();
    });
    clientSocket.emit("hello", "world");
  });
});
