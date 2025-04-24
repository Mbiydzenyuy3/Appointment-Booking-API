import bcrypt from "bcryptjs";

export const hash = plain = bcrypt.hash(plain, 10);
export const verify = (plain, hash) => bcrypt.compare(plain, hash);import bcrypt from "bcryptjs";

// Function to hash the password
export const hashPassword = (plainPassword) => bcrypt.hash(plainPassword, 10);

// Function to verify the password
export const verifyPassword = (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);
