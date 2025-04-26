// tests/booking.test.js

import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../../app.js";

import { query, pool, connectToDb, initializeDbSchema } from "../config/db.js";

let clientId;
let providerId;

describe("Appointment Booking API (/appointments)", () => {
  before(async () => {
    console.log("--- Setting up test users and provider ---");
    await connectToDb();
    await initializeDbSchema();

    // Insert test client and provider
    const userRes = await query(
      `
      INSERT INTO users (name, email, password)
      VALUES 
        ('Client Test', 'client@example.com', 'password'),
        ('Provider Test', 'provider@example.com', 'password')
      RETURNING id
      `
    );

    clientId = userRes.rows[0].id;
    const providerUserId = userRes.rows[1].id;

    // Insert service provider
    const providerRes = await query(
      `
      INSERT INTO service_provider (user_id, service)
      VALUES ($1, 'Haircut')
      RETURNING id
      `,
      [providerUserId]
    );

    providerId = providerRes.rows[0].id;
  });

  after(async () => {
    console.log("--- Cleaning up test data ---");
    await query("DELETE FROM appointment");
    await query("DELETE FROM service_provider");
    await query("DELETE FROM users");
    await pool.end();
  });

  it("should create an appointment successfully", async () => {
    const res = await request(app)
      .post("/appointments")
      .send({
        client_id: clientId,
        service_provider_id: providerId,
      })
      .expect("Content-Type", /json/)
      .expect(201); // 201 Created

    assert.ok(res.body);
    assert.strictEqual(res.body.client_id, clientId);
    assert.strictEqual(res.body.service_provider_id, providerId);
  });
});
