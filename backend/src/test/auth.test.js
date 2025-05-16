// tests/auth.test.js
import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "../../app.js";

const uniqueEmail = `testuser${Date.now()}@example.com`;

test("Register new client", async () => {
  const res = await request(app).post("/auth/register").send({
    name: "Test User",
    email: uniqueEmail,
    password: "test123",
    confirmPassword: "test123",
    user_type: "client",
  });

  assert.strictEqual(res.statusCode, 201);
  assert.ok(res.body.token);
});

test("Login with wrong password fails", async () => {
  const res = await request(app).post("/auth/login").send({
    email: uniqueEmail,
    password: "wrongpass",
  });

  assert.strictEqual(res.statusCode, 401);
});
