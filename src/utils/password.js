//utils/password.js
import bcrypt from "bcryptjs";

// Function to hash the password
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Function to verify the password
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
