// tests/auth.test.js
import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../../app.js";

const uniqueEmail = `testuser${Date.now()}@example.com`;

test("Register new client", async () => {
  const res = await request(app).post("/auth/register").send({
    name: "Test User",
    email: uniqueEmail,
    password: "Test123!",
    user_type: "client"
  });

  assert.strictEqual(res.statusCode, 201);
  assert.ok(res.headers["set-cookie"]);
});

test("Login with wrong password fails", async () => {
  const res = await request(app).post("/auth/login").send({
    email: uniqueEmail,
    password: "wrongpass"
  });

  assert.strictEqual(res.statusCode, 401);
});

test("Login with correct password succeeds", async () => {
  const res = await request(app).post("/auth/login").send({
    email: uniqueEmail,
    password: "Test123!"
  });

  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.headers["set-cookie"]);
});
