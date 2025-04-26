// tests/password.test.js

import { test } from "node:test";
import assert from "node:assert"; // <-- Missing before!
import { hashPassword, verifyPassword } from "../utils/password.js"; // <-- use correct function names!

test("hashPassword returns a hashed string", async () => {
  const plainPassword = "mySecret123";
  const hash = await hashPassword(plainPassword);

  // Check if the returned hash matches bcrypt's pattern
  assert.match(hash, /^\$2[aby]\$.{56}$/);
});

test("verifyPassword returns true for matching passwords", async () => {
  const plainPassword = "mySecret123";
  const hash = await hashPassword(plainPassword);

  const result = await verifyPassword(plainPassword, hash);
  assert.strictEqual(result, true);
});

test("verifyPassword returns false for non-matching passwords", async () => {
  const plainPassword = "mySecret123";
  const hash = await hashPassword(plainPassword);

  const result = await verifyPassword("wrongPassword", hash);
  assert.strictEqual(result, false);
});
