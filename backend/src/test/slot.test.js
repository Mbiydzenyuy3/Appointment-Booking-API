// tests/slot.test.js
import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "../../app.js";

let providerToken = "";
let serviceId = "";

test("Register provider", async () => {
  const res = await request(app)
    .post("/auth/register")
    .send({
      name: "Provider",
      email: `provider${Date.now()}@mail.com`,
      password: "pass123",
      confirmPassword: "pass123",
      user_type: "provider",
    });

  providerToken = res.body.token;
  assert.ok(providerToken);
});

test("Create service", async () => {
  const res = await request(app)
    .post("/services/create")
    .set("Authorization", `Bearer ${providerToken}`)
    .send({
      name: "Consultation",
      description: "Short consultation session", // optional
      price: 50, // required
      durationMinutes: 30, // required (not 'duration')
    });

  console.log("Service creation response:", res.body); // helpful for debugging
  assert.strictEqual(res.statusCode, 201);
  serviceId = res.body.data?.service_id;
});

test("Create slot with token", async () => {
  const now = new Date();
  const hour = String((now.getHours() + 1) % 24).padStart(2, "0"); // +1 hour ahead
  const startTime = `${hour}:00`;
  const endTime = `${hour}:30`;

  const res = await request(app)
    .post("/slots/create")
    .set("Authorization", `Bearer ${providerToken}`)
    .send({
      day: now.toISOString().split("T")[0], // e.g., "2025-05-16"
      startTime,
      endTime,
      serviceId,
    });

  // For debugging:
  if (![200, 201].includes(res.statusCode)) {
    console.error("Response body:", res.body);
  }

  assert.ok([200, 201].includes(res.statusCode));
});
