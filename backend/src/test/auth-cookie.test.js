// auth-cookie.test.js — TDD: write failing tests first
import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app.js";

const uniqueEmail = `cookietest${Date.now()}@example.com`;

// Test A — Login sets httpOnly cookie, not token in body
test("Login sets httpOnly cookie and does not return token in body", async () => {
  // First register the user
  await request(app).post("/auth/register").send({
    name: "Cookie Test User",
    email: uniqueEmail,
    password: "Test123!",
    user_type: "client"
  });

  const res = await request(app).post("/auth/login").send({
    email: uniqueEmail,
    password: "Test123!"
  });

  assert.strictEqual(res.statusCode, 200);

  // Cookie should be set
  const cookies = res.headers["set-cookie"];
  assert.ok(cookies, "expected set-cookie header to be present");

  const tokenCookie = cookies.find((c) => c.startsWith("token="));
  assert.ok(tokenCookie, "expected a cookie named 'token'");

  // Cookie should be httpOnly
  assert.ok(
    tokenCookie.includes("HttpOnly"),
    "expected token cookie to be HttpOnly"
  );

  // Response body should NOT contain a top-level 'token' field
  assert.strictEqual(
    res.body.token,
    undefined,
    "expected body.token to be absent"
  );

  // Response body SHOULD contain data with user info
  assert.ok(res.body.data, "expected body.data to be present");
  assert.ok(res.body.data.name, "expected body.data.name");
  assert.ok(res.body.data.email, "expected body.data.email");
  assert.ok(res.body.data.user_type, "expected body.data.user_type");
});

// Test B — Auth middleware accepts cookie (no Authorization header)
test("Auth middleware accepts cookie without Authorization header", async () => {
  // Generate a valid JWT directly for testing
  const token = jwt.sign(
    { sub: "00000000-0000-0000-0000-000000000000", email: "x@x.com", user_type: "client", provider_id: null, name: "X" },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "7d" }
  );

  // First we need a real user — use the one registered in Test A
  // Instead, let's do a full login to get a real cookie then use it
  const loginRes = await request(app).post("/auth/login").send({
    email: uniqueEmail,
    password: "Test123!"
  });

  assert.strictEqual(loginRes.statusCode, 200);
  const cookies = loginRes.headers["set-cookie"];
  assert.ok(cookies, "login should have set cookies");

  // Now call /auth/profile using only the cookie (no Authorization header)
  const profileRes = await request(app)
    .get("/auth/profile")
    .set("Cookie", cookies);

  assert.strictEqual(
    profileRes.statusCode,
    200,
    `expected 200, got ${profileRes.statusCode}: ${JSON.stringify(profileRes.body)}`
  );
  assert.ok(profileRes.body.data, "expected profile data");
});

// Test C — Logout clears the cookie
test("POST /auth/logout clears the token cookie", async () => {
  const res = await request(app).post("/auth/logout");

  assert.strictEqual(res.statusCode, 200);
  assert.deepStrictEqual(res.body, { success: true, message: "Logged out." });

  // Response should set a cookie that clears the token
  const cookies = res.headers["set-cookie"];
  assert.ok(cookies, "expected set-cookie header on logout");

  const tokenCookie = cookies.find((c) => c.startsWith("token="));
  assert.ok(tokenCookie, "expected token cookie to be cleared");

  // Cookie should expire in the past (maxAge=0 or Expires in the past)
  const hasMaxAge0 = tokenCookie.includes("Max-Age=0");
  const hasExpired =
    tokenCookie.includes("Expires=") &&
    new Date(tokenCookie.split("Expires=")[1].split(";")[0]) <= new Date();

  assert.ok(
    hasMaxAge0 || hasExpired,
    `expected token cookie to be expired/cleared, got: ${tokenCookie}`
  );
});
