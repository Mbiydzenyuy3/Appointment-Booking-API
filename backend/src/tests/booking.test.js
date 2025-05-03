import request from "supertest";
import { app } from "../../app.js";
import { describe, it, expect } from "vitest";

describe("📅 Booking Appointments", () => {
  const token = "Bearer your_valid_jwt_here"; // Replace with actual token
  const payload = {
    timeslotId: "valid-timeslot-uuid",
    appointmentDate: "2025-05-05",
    appointmentTime: "10:00",
    serviceId: "valid-service-uuid",
  };

  it("✅ Should allow an authenticated user to book an appointment", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", token)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("appointmentDate", payload.appointmentDate);
  });
});
