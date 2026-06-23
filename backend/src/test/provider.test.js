// tests/provider.test.js
import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../../app.js";

let providerToken;
let providerId;
let bookingSlug;

test("Register provider for profile", async () => {
  const uniqueEmail = `profileprovider${Date.now()}@example.com`;

  const res = await request(app).post("/auth/register").send({
    name: "Salon Owner",
    email: uniqueEmail,
    password: "Test1234!",
    user_type: "provider"
  });

  assert.strictEqual(res.statusCode, 201);
  assert.ok(res.headers["set-cookie"]);
  const cookieHeader = (res.headers["set-cookie"] || []).find((c) => c.startsWith("token=")) || "";
  providerToken = cookieHeader.split(";")[0].replace("token=", "");
  assert.ok(providerToken);
  providerId = res.body.data?.user_id;
});

test("Create provider profile", async () => {
  const res = await request(app)
    .post("/providers/create")
    .set("Authorization", `Bearer ${providerToken}`)
    .send({
      bio: "Professional salon offering haircuts and beauty services",
      phone: "+1234567890"
    });

  assert.strictEqual(res.statusCode, 201);
  assert.ok(res.body.data);
  bookingSlug = res.body.data.booking_slug;
});

test("Get all providers", async () => {
  const res = await request(app).get("/providers");

  assert.strictEqual(res.statusCode, 200);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length > 0);
});

test("Get provider profile by slug", async () => {
  const res = await request(app).get(`/providers/profile/${bookingSlug}`);

  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.data);
  assert.ok(res.body.data.services); // Should include services
});
