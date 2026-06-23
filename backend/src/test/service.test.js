// tests/service.test.js
import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../../app.js";

let providerToken;
let serviceId;

test("Register provider", async () => {
  const uniqueEmail = `provider${Date.now()}@example.com`;

  const res = await request(app).post("/auth/register").send({
    name: "Provider User",
    email: uniqueEmail,
    password: "Test1234!",
    user_type: "provider"
  });

  assert.strictEqual(res.statusCode, 201);
  assert.ok(res.headers["set-cookie"]);
  const cookieHeader = (res.headers["set-cookie"] || []).find((c) => c.startsWith("token=")) || "";
  providerToken = cookieHeader.split(";")[0].replace("token=", "");
  assert.ok(providerToken);
});

test("Create service", async () => {
  const res = await request(app)
    .post("/services/create")
    .set("Authorization", `Bearer ${providerToken}`)
    .send({
      name: "Haircut Service",
      description: "Professional haircut",
      price: 50,
      duration: 60,
      category: "Beauty"
    });

  assert.strictEqual(res.statusCode, 201);
  assert.ok(res.body.service);
  serviceId = res.body.service.id;
});

test("Fetch services", async () => {
  const res = await request(app).get("/services");

  assert.strictEqual(res.statusCode, 200);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length > 0);
});

test("Search services", async () => {
  const res = await request(app).get("/services/search?q=Haircut");

  assert.strictEqual(res.statusCode, 200);
  assert.ok(Array.isArray(res.body.services));
});
