import request from "supertest";
import { app } from "../../app.js";
import { describe, it, expect, beforeAll } from "vitest";

describe("🔐 Authentication Flow", () => {
  const userPayload = {
    name: "Test User",
    email: `test_${Date.now()}@example.com`,
    password: "TestPass123",
  };

  let authToken;

  beforeAll(async () => {
    const res = await request(app).post("/api/auth/register").send(userPayload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe(userPayload.email);
  });

  it("✅ Logs in a registered user and returns a JWT", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: userPayload.email, password: userPayload.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");

    authToken = res.body.token;
  });
});
