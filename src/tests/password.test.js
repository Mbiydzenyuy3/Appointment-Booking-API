import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../utils/password.js";

describe("Password Utils", () => {
  it("hashPassword returns a hashed string", async () => {
    const plainPassword = "mySecret123";
    const hash = await hashPassword(plainPassword);
    expect(hash).toMatch(/^\$2[aby]\$.{56}$/);
  });

  it("verifyPassword returns true for matching passwords", async () => {
    const plainPassword = "mySecret123";
    const hash = await hashPassword(plainPassword);
    const result = await verifyPassword(plainPassword, hash);
    expect(result).toBe(true);
  });

  it("verifyPassword returns false for non-matching passwords", async () => {
    const plainPassword = "mySecret123";
    const hash = await hashPassword(plainPassword);
    const result = await verifyPassword("wrongPassword", hash);
    expect(result).toBe(false);
  });
});
