import { hashPassword, comparePassword } from "../utils/password.js";
import {  test } from "node:test";

test("hashPassword returns a hashed string", async () => {
  const plainPassword = "mySecret123";
  const hash = await hashPassword(plainPassword);
  // Regular expression to check bcrypt hash format
  assert.match(hash, /^\$2[aby]\$.{56}$/);
});

test("comparePassword returns true for matching passwords", async () => {
  const plainPassword = "mySecret123";
  const hash = await hashPassword(plainPassword);
  const result = await comparePassword(plainPassword, hash);
  assert.strictEqual(result, true);
});

test("comparePassword returns false for non-matching passwords", async () => {
  const plainPassword = "mySecret123";
  const hash = await hashPassword(plainPassword);
  const result = await comparePassword("wrongPassword", hash);
  assert.strictEqual(result, false);
});
