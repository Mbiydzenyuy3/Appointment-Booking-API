// tests/appointment.test.js
import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "../../app.js";

test("Booking appointment fails for fake slot", async () => {
  const fakeToken = "Bearer invalidtoken";

  const res = await request(app)
    .post("/appointments/book")
    .set("Authorization", fakeToken)
    .send({
      timeslotId: "non-existent-id",
      appointmentDate: "2025-05-23",
      appointmentTime: "10:00",
      serviceId: "non-existent-service",
    });

  assert.ok(res.statusCode >= 400);
});
