// tests/websocket.test.js
import test from "node:test";
import assert from "node:assert";
import { Server } from "socket.io";
import { createServer } from "http";
import Client from "socket.io-client";

test("WebSocket connects and communicates", async (t) => {
  const httpServer = createServer();
  const io = new Server(httpServer);

  await new Promise((resolve) => httpServer.listen(resolve));
  const port = httpServer.address().port;
  const clientSocket = Client(`http://localhost:${port}`);

  await new Promise((resolve) => {
    io.on("connection", (socket) => {
      socket.on("hello", (msg) => {
        assert.strictEqual(msg, "world");
        resolve();
      });
    });

    clientSocket.emit("hello", "world");
  });

  clientSocket.close();
  io.close();
});
