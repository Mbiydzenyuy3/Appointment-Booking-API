import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logError, logInfo } from "../utils/logger.js";
import { query } from "../config/db.js";
import ProviderModel from "../models/provider-model.js";

// Controller function for user registration
export async function register(req, res, next) {
  const { name, email, password, user_type } = req.body;

  if (!name || !email || !password || !user_type) {
    return res.status(400).json({
      success: false,
      message: "Please provide your name, email, password, and account type."
    });
  }

  if (!["client", "provider"].includes(user_type)) {
    return res.status(400).json({
      success: false,
      message: "Account type must be 'client' or 'provider'."
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long."
    });
  }

  const client = await query("BEGIN");

  try {
    const existingUser = await query("SELECT 1 FROM users WHERE email = $1", [
      email
    ]);

    if (existingUser.rowCount > 0) {
      await query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message:
          "This email is already registered. Please try logging in instead."
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

    // Create provider profile if user_type is provider
    if (user_type === "provider") {
      try {
        const provider = await ProviderModel.create({
          user_id: userId,
          bio: "",
          phone: null
        });
        providerId = provider.provider_id;
      } catch (providerError) {
        logError(
          "Error creating provider profile during registration:",
          providerError
        );
        await query("ROLLBACK");
        return res.status(500).json({
          success: false,
          message: "Failed to create provider profile. Please try again."
        });
      }
    }

    await query("COMMIT");

    const token = jwt.sign(
      {
        sub: userId,
        email,
        user_type,
        provider_id: providerId
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Welcome! Your account has been created successfully.",
      token,
      data: {
        user_id: userId,
        provider_id: providerId,
        email,
        user_type,
        name
      }
    });
  } catch (err) {
    await query("ROLLBACK");
    logError("Error during registration:", err);
    next(err);
  }
}

// Controller function for user login
export async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter your email and password."
    });
  }

  try {
    const userResult = await query("SELECT * FROM users WHERE email = $1", [
      email
    ]);

    if (userResult.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const user = userResult.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    let providerId = null;

    if (user.user_type === "provider") {
      const providerResult = await query(
        "SELECT provider_id FROM providers WHERE user_id = $1",
        [user.user_id]
      );

      if (providerResult.rowCount > 0) {
        providerId = providerResult.rows[0].provider_id;
      }
    }

    const token = jwt.sign(
      {
        sub: user.user_id,
        email: user.email,
        user_type: user.user_type,
        provider_id: providerId
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    logInfo("User logged in", user.email);

    return res.status(200).json({
      success: true,
      token,
      message: "Login successful!",
      data: {
        user_id: user.user_id,
        provider_id: providerId,
        email: user.email,
        user_type: user.user_type,
        name: user.name
      }
    });
  } catch (err) {
    logError("Error logging in user", err);
    next(err);
  }
}

// Controller function to get user profile
export async function getUserProfile(req, res, next) {
  try {
    const userId = req.user.sub;

    const userResult = await query(
      `SELECT user_id, name, email, user_type, created_at
       FROM users WHERE user_id = $1`,
      [userId]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found."
      });
    }

    const user = userResult.rows[0];

    // Get provider info if applicable
    let providerInfo = null;
    if (user.user_type === "provider") {
      const providerResult = await query(
        "SELECT provider_id, bio, booking_slug FROM providers WHERE user_id = $1",
        [userId]
      );

      if (providerResult.rowCount > 0) {
        providerInfo = providerResult.rows[0];
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...user,
        provider_info: providerInfo
      }
    });
  } catch (err) {
    logError("Error getting user profile", err);
    next(err);
  }
}

// Stub implementations for missing auth functions
export async function forgotPassword(req, res, next) {
  // TODO: Implement forgot password functionality
  res.status(501).json({
    success: false,
    message: "Forgot password functionality not implemented yet"
  });
}

export async function resetPassword(req, res, next) {
  // TODO: Implement reset password functionality
  res.status(501).json({
    success: false,
    message: "Reset password functionality not implemented yet"
  });
}

export async function updateUserProfile(req, res, next) {
  // TODO: Implement update user profile functionality
  res.status(501).json({
    success: false,
    message: "Update user profile functionality not implemented yet"
  });
}

export async function updateProviderProfile(req, res, next) {
  // TODO: Implement update provider profile functionality
  res.status(501).json({
    success: false,
    message: "Update provider profile functionality not implemented yet"
  });
}

export async function changePassword(req, res, next) {
  // TODO: Implement change password functionality
  res.status(501).json({
    success: false,
    message: "Change password functionality not implemented yet"
  });
}

export async function deleteAccount(req, res, next) {
  // TODO: Implement delete account functionality
  res.status(501).json({
    success: false,
    message: "Delete account functionality not implemented yet"
  });
}

export async function updateUserType(req, res, next) {
  // TODO: Implement update user type functionality
  res.status(501).json({
    success: false,
    message: "Update user type functionality not implemented yet"
  });
}

export async function convertGuestToUser(req, res, next) {
  // TODO: Implement convert guest to user functionality
  res.status(501).json({
    success: false,
    message: "Convert guest to user functionality not implemented yet"
  });
}

export async function googleAuthCallback(req, res, next) {
  // TODO: Implement Google OAuth callback functionality
  res.status(501).json({
    success: false,
    message: "Google OAuth callback functionality not implemented yet"
  });
}
