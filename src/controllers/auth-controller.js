//controller/auth-controller.js
import bcrypt from "bcryptjs"; // To hash and compare passwords securely
import jwt from "jsonwebtoken"; // To generate JWT tokens
import * as AuthService from "../services/auth-service.js";
import { logError, logInfo } from "../utils/logger.js";
import { query } from "../config/db.js";

// Controller function for user registration
export async function register(req, res, next) {
  const { name, email, password, user_type, bio } = req.body;

  if (!name || !email || !password || !user_type) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields.",
    });
  }

  if (!["client", "provider"].includes(user_type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user_type. Must be 'client' or 'provider'.",
    });
  }

  const client = await query("BEGIN");

  try {
    const existingUser = await query("SELECT 1 FROM users WHERE email = $1", [
      email,
    ]);

    if (existingUser.rowCount > 0) {
      await query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Email already in use.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userInsertResult = await query(
      `INSERT INTO users (name, email, password, user_type)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id`,
      [name, email, hashedPassword, user_type]
    );

    const userId = userInsertResult.rows[0].user_id;

    let providerId = null;

    if (user_type === "provider") {
      const providerInsertResult = await query(
        `INSERT INTO providers (user_id, bio)
         VALUES ($1, $2)
         RETURNING provider_id`,
        [userId, bio || ""]
      );

      providerId = providerInsertResult.rows[0].provider_id;
    }

    await query("COMMIT");

    const token = jwt.sign(
      {
        sub: userId,
        email,
        user_type,
        provider_id: providerId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
      data: {
        user_id: userId,
        provider_id: providerId,
        email,
        user_type,
      },
    });
  } catch (err) {
    await query("ROLLBACK");
    logError("❌ Error during registration:", err);
    next(err);
  }
}
// Controller function for user login
export async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both email and password.",
    });
  }

  try {
    const user = await AuthService.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please check your email and password.",
      });
    }

    let providerId = null;

    if (user.user_type === "provider") {
      const providerResult = await query(
        "SELECT provider_id FROM providers WHERE user_id = $1",
        [user.user_id]
      );

      if (providerResult.rowCount === 0) {
        return res.status(400).json({
          success: false,
          message: "Provider profile not found for this user.",
        });
      }

      providerId = providerResult.rows[0].provider_id;
    }

    const tokenPayload = {
      sub: user.user_id,
      email: user.email,
      user_type: user.user_type,
      provider_id: providerId,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });

    logInfo("User logged in", user.email);

    return res.status(200).json({
      success: true,
      token: token,
      message: "User logged in successfully",
      data: {
        user_id: user.user_id,
        provider_id: providerId,
        email: user.email,
        user_type: user.user_type,
      },
    });
  } catch (err) {
    logError("Error logging in user", err);
    next(err);
  }
}
