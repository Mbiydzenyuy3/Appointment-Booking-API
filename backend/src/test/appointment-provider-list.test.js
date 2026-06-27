// test: provider appointment list returns correct appointments (not empty due to UUID mismatch)
import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../../app.js";

const ts = Date.now();
const providerEmail = `provider${ts}@example.com`;
const clientEmail = `client${ts}@example.com`;

test("provider list returns at least one appointment after booking", async () => {
  // Step 1: Register provider
  const providerReg = await request(app).post("/auth/register").send({
    name: "Test Provider",
    email: providerEmail,
    password: "Test123!",
    user_type: "provider"
  });
  assert.strictEqual(
    providerReg.statusCode,
    201,
    `register provider failed: ${JSON.stringify(providerReg.body)}`
  );
  const providerCookies = providerReg.headers["set-cookie"];

  // Step 2: Create service for provider
  const serviceRes = await request(app)
    .post("/services/create")
    .set("Cookie", providerCookies)
    .send({
      name: "Test Service",
      description: "A test service",
      price: 50,
      durationMinutes: 30,
      category: "Testing"
    });
  assert.strictEqual(
    serviceRes.statusCode,
    201,
    `create service failed: ${JSON.stringify(serviceRes.body)}`
  );
  const serviceId = serviceRes.body.data.service_id;

  // Step 3: Create time slot (next week to avoid any date validation)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const slotDay = futureDate.toISOString().split("T")[0];
  const slotStart = "09:00";
  const slotEnd = "10:00";

  const slotRes = await request(app)
    .post("/slots/create")
    .set("Cookie", providerCookies)
    .send({
      day: slotDay,
      startTime: slotStart,
      endTime: slotEnd,
      serviceId
    });
  assert.strictEqual(
    slotRes.statusCode,
    201,
    `create slot failed: ${JSON.stringify(slotRes.body)}`
  );
  const slotId = slotRes.body.data.timeslot_id;

  // Step 4: Register client
  const clientReg = await request(app).post("/auth/register").send({
    name: "Test Client",
    email: clientEmail,
    password: "Test123!",
    user_type: "client"
  });
  assert.strictEqual(
    clientReg.statusCode,
    201,
    `register client failed: ${JSON.stringify(clientReg.body)}`
  );
  const clientCookies = clientReg.headers["set-cookie"];

  // Step 5: Client books the slot
  const bookRes = await request(app)
    .post("/appointments/book")
    .set("Cookie", clientCookies)
    .send({
      timeslotId: slotId,
      appointment_date: slotDay,
      appointment_time: slotStart
    });
  assert.strictEqual(
    bookRes.statusCode,
    201,
    `book appointment failed: ${JSON.stringify(bookRes.body)}`
  );

  // Step 6: Provider lists appointments — THIS IS THE BUG CHECK
  const listRes = await request(app)
    .get("/appointments/list")
    .set("Cookie", providerCookies);

  assert.strictEqual(
    listRes.statusCode,
    200,
    `list appointments failed: ${JSON.stringify(listRes.body)}`
  );
  assert.ok(
    Array.isArray(listRes.body.data),
    `expected data to be an array, got: ${JSON.stringify(listRes.body)}`
  );
  assert.ok(
    listRes.body.data.length >= 1,
    `expected at least 1 appointment, got ${listRes.body.data.length}`
  );
});
