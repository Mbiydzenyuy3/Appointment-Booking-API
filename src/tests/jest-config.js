import {
  verify as comparePassword,
  hash as hashPassword,
} from "../utils/password.js";

const hash = await hashPassword("secret");

expect(await comparePassword("secret", hash)).toBe(true);
expect(await comparePassword("wrong", hash)).toBe(false);
