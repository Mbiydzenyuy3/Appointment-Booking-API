import request from "supertest";
import { app } from "../../app.js";
import { describe, it, expect } from "vitest";

describe("Booking Appointments", () => {
  it("should allow a user to book an appointment", async () => {
    const res = await request(app).post("/api/appointments").send({
      client_id: "some-client-uuid",
      service_provider_id: "some-provider-uuid",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("client_id");
    expect(res.body).toHaveProperty("service_provider_id");
  });
});
