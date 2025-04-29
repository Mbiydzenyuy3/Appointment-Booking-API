import request from "supertest";
import { app } from "../../app.js"; // Import your Express app
import { describe, it, expect } from "vitest";

describe("Authentication Flow", () => {
  const userData = {
    name: "Test User",
    email: `test_${Date.now()}@example.com`,
    password: "TestPass123",
  };

  it("should register a user", async () => {
    const res = await request(app).post("/api/auth/register").send(userData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email", userData.email);
  });

  it("should login the user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
