import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import * as AuthService from "../services/auth-service.js";
import { sendPasswordResetEmail } from "../services/email-service.js";
import { logError, logInfo } from "../utils/logger.js";
import { query } from "../config/db.js";

// Controller function for user registration
export async function register(req, res, next) {
  const { name, email, password, user_type, bio } = req.body;

  if (!name || !email || !password || !user_type) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields."
    });
  }

  if (!["client", "provider"].includes(user_type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user_type. Must be 'client' or 'provider'."
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
        message: "Email already in use."
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
        provider_id: providerId
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
        user_type
      }
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
      message: "Please provide both email and password."
    });
  }

  try {
    const user = await AuthService.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please check your email and password."
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
          message: "Provider profile not found for this user."
        });
      }

      providerId = providerResult.rows[0].provider_id;
    }

    const tokenPayload = {
      sub: user.user_id,
      email: user.email,
      user_type: user.user_type,
      provider_id: providerId
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
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
        user_type: user.user_type
      }
    });
  } catch (err) {
    logError("Error logging in user", err);
    next(err);
  }
}

// Controller function for forgot password
export async function forgotPassword(req, res, next) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required."
    });
  }

  try {
    const user = await AuthService.getUserByEmail(email);

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, we've sent a password reset link."
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3",
      [resetToken, resetTokenExpiry, email]
    );

    // Send password reset email
    let emailSent = false;
    try {
      await sendPasswordResetEmail(email, resetToken);
      logInfo(`Password reset email sent successfully to ${email}`);
      emailSent = true;
    } catch (emailError) {
      logError("Failed to send password reset email", emailError);
      // In development, fail the request so we know email isn't working
      if (process.env.NODE_ENV === "development") {
        return res.status(500).json({
          success: false,
          message:
            "Failed to send password reset email. Check email configuration.",
          error: emailError.message
        });
      }
      // In production, don't fail the request for security
    }

    res.status(200).json({
      success: true,
      message: emailSent
        ? "Password reset email sent successfully."
        : "If an account with that email exists, we've sent a password reset link.",
      // In development, you might want to include the token for testing
      ...(process.env.NODE_ENV === "development" && { resetToken, emailSent })
    });
  } catch (err) {
    logError("Error in forgot password", err);
    next(err);
  }
}

// Controller function for reset password
export async function resetPassword(req, res, next) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Token and new password are required."
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long."
    });
  }

  try {
    // Find user with valid reset token
    const userResult = await query(
      "SELECT user_id, email FROM users WHERE reset_token = $1 AND reset_token_expiry > $2",
      [token, new Date()]
    );

    if (userResult.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token."
      });
    }

    const user = userResult.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = $2",
      [hashedPassword, user.user_id]
    );

    logInfo(`Password reset successful for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully."
    });
  } catch (err) {
    logError("Error in reset password", err);
    next(err);
  }
}

// Controller function to update user type (for new Google users)
export async function updateUserType(req, res, next) {
  const userId = req.user.sub;
  const { user_type } = req.body;

  if (!user_type || !["client", "provider"].includes(user_type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user type. Must be 'client' or 'provider'."
    });
  }

  const client = await query("BEGIN");

  try {
    // Update user type
    await query(
      "UPDATE users SET user_type = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2",
      [user_type, userId]
    );

    let providerId = null;

    // Create provider record if user is becoming a provider
    if (user_type === "provider") {
      // Check if provider record already exists
      const existingProvider = await query(
        "SELECT provider_id FROM providers WHERE user_id = $1",
        [userId]
      );

      if (existingProvider.rowCount === 0) {
        const providerInsertResult = await query(
          `INSERT INTO providers (user_id, bio)
           VALUES ($1, $2)
           RETURNING provider_id`,
          [userId, ""]
        );
        providerId = providerInsertResult.rows[0].provider_id;
      } else {
        providerId = existingProvider.rows[0].provider_id;
      }
    }

    await query("COMMIT");

    logInfo(`User type updated to ${user_type} for user ID: ${userId}`);

    // Generate new token with updated user type
    const user = await query(
      "SELECT email, name FROM users WHERE user_id = $1",
      [userId]
    );
    const userData = user.rows[0];

    const tokenPayload = {
      sub: userId,
      email: userData.email,
      user_type: user_type,
      provider_id: providerId
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(200).json({
      success: true,
      message: "User type updated successfully",
      token,
      data: {
        user_id: userId,
        provider_id: providerId,
        email: userData.email,
        user_type: user_type,
        name: userData.name
      }
    });
  } catch (err) {
    await query("ROLLBACK");
    logError("Error updating user type", err);
    next(err);
  }
}

// Controller function for Google OAuth callback
export async function googleAuthCallback(req, res, next) {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        message: "Google token is required."
      });
    }

    // Import Google OAuth2 client
    const { OAuth2Client } = await import("google-auth-library");

    const googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId, email_verified } = payload;

    logInfo(`Google OAuth callback for email: ${email}`);

    // Check if user exists by Google ID
    let user = await AuthService.getUserByGoogleId(googleId);
    let isNewUser = false;

    if (!user) {
      // Check if user exists by email (linking Google account to existing user)
      const existingUser = await AuthService.getUserByEmail(email);

      if (existingUser) {
        // Link Google account to existing user
        user = await AuthService.updateUserWithGoogleId(
          existingUser.user_id,
          googleId,
          { picture, email_verified }
        );
        logInfo(`Linked Google account to existing user: ${email}`);
      } else {
        // Create new user with Google OAuth data
        const userData = {
          name,
          email,
          password: null,
          user_type: null, // Set to null so user can choose later
          google_id: googleId,
          profile_picture: picture,
          email_verified: email_verified || true
        };

        user = await AuthService.createGoogleUser(userData);
        isNewUser = true;
        logInfo(`Created new Google user: ${email}`);
      }
    }

    // Get provider ID if user is a provider
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

    // Generate JWT token
    const token = AuthService.generateToken(user, providerId);

    logInfo(`Google authentication successful for user: ${email}`);

    res.status(200).json({
      success: true,
      token,
      message: "Google authentication successful",
      data: {
        user_id: user.user_id,
        provider_id: providerId,
        email: user.email,
        user_type: user.user_type, // This will be null for new users
        name: user.name,
        profile_picture: user.profile_picture,
        is_new_user: isNewUser
      }
    });
  } catch (err) {
    logError("Error in Google OAuth", err);

    // Handle specific Google OAuth errors
    if (err.message && err.message.includes("Invalid token")) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google token."
      });
    }

    if (err.message && err.message.includes("Token used too late")) {
      return res.status(401).json({
        success: false,
        message: "Google token has expired."
      });
    }

    if (err.message && err.message.includes("Wrong number of segments")) {
      return res.status(401).json({
        success: false,
        message: "Malformed Google token."
      });
    }

    res.status(500).json({
      success: false,
      message: "Google authentication failed. Please try again."
    });
  }
}

// Controller function to get user profile
export async function getUserProfile(req, res, next) {
  try {
    const userId = req.user.sub;

    const userResult = await query(
      `SELECT user_id, name, email, user_type, phone, address, bio, profile_picture, created_at 
       FROM users WHERE user_id = $1`,
      [userId]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const user = userResult.rows[0];

    // Get additional provider info if user is a provider
    let providerInfo = null;
    if (user.user_type === "provider") {
      const providerResult = await query(
        "SELECT provider_id, bio, hourly_rate, service_types FROM providers WHERE user_id = $1",
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

// Controller function to update user profile
export async function updateUserProfile(req, res, next) {
  const userId = req.user.sub;
  const { name, phone, address, bio, profile_picture } = req.body;

  try {
    // Update user profile
    await query(
      `UPDATE users SET 
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        address = COALESCE($3, address),
        bio = COALESCE($4, bio),
        profile_picture = COALESCE($5, profile_picture),
        updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6`,
      [name, phone, address, bio, profile_picture, userId]
    );

    logInfo(`User profile updated for user ID: ${userId}`);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully."
    });
  } catch (err) {
    logError("Error updating user profile", err);
    next(err);
  }
}

// Controller function to update provider profile
export async function updateProviderProfile(req, res, next) {
  const userId = req.user.sub;
  const { bio, hourly_rate, service_types } = req.body;

  try {
    // First, get the provider_id for this user
    const providerResult = await query(
      "SELECT provider_id FROM providers WHERE user_id = $1",
      [userId]
    );

    if (providerResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found."
      });
    }

    const providerId = providerResult.rows[0].provider_id;

    // Update provider profile
    await query(
      `UPDATE providers SET 
        bio = COALESCE($1, bio),
        hourly_rate = COALESCE($2, hourly_rate),
        service_types = COALESCE($3, service_types),
        updated_at = CURRENT_TIMESTAMP
       WHERE provider_id = $4`,
      [bio, hourly_rate, service_types, providerId]
    );

    logInfo(`Provider profile updated for user ID: ${userId}`);

    res.status(200).json({
      success: true,
      message: "Provider profile updated successfully."
    });
  } catch (err) {
    logError("Error updating provider profile", err);
    next(err);
  }
}

// Controller function to change password
export async function changePassword(req, res, next) {
  const userId = req.user.sub;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required."
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters long."
    });
  }

  try {
    // Get current user with password
    const userResult = await query(
      "SELECT password FROM users WHERE user_id = $1",
      [userId]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const user = userResult.rows[0];

    // If user has a password (not OAuth-only), verify current password
    if (user.password) {
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect."
        });
      }
    } else {
      // User doesn't have a password (OAuth-only), they can set one
      logInfo(`Setting password for OAuth user: ${userId}`);
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await query(
      "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2",
      [hashedNewPassword, userId]
    );

    logInfo(`Password changed successfully for user ID: ${userId}`);

    res.status(200).json({
      success: true,
      message: "Password changed successfully."
    });
  } catch (err) {
    logError("Error changing password", err);
    next(err);
  }
}

// Controller function to delete user account
export async function deleteAccount(req, res, next) {
  const userId = req.user.sub;
  const { confirmationText } = req.body;

  // Require confirmation to prevent accidental deletions
  if (confirmationText !== "DELETE") {
    return res.status(400).json({
      success: false,
      message: "Please type 'DELETE' to confirm account deletion."
    });
  }

  const client = await query("BEGIN");

  try {
    // Get user info before deletion for logging
    const userResult = await query(
      "SELECT email, user_type FROM users WHERE user_id = $1",
      [userId]
    );

    if (userResult.rowCount === 0) {
      await query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const user = userResult.rows[0];

    // Delete all related data (cascade will handle most, but we ensure cleanup)

    // Cancel any upcoming appointments
    await query(
      `UPDATE appointments 
       SET status = 'canceled', updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND status = 'booked'`,
      [userId]
    );

    // If user is a provider, handle their appointments and services
    if (user.user_type === "provider") {
      // Get provider_id
      const providerResult = await query(
        "SELECT provider_id FROM providers WHERE user_id = $1",
        [userId]
      );

      if (providerResult.rowCount > 0) {
        const providerId = providerResult.rows[0].provider_id;

        // Cancel provider's appointments
        await query(
          `UPDATE appointments 
           SET status = 'canceled', updated_at = CURRENT_TIMESTAMP 
           WHERE provider_id = $1 AND status = 'booked'`,
          [providerId]
        );

        // Delete time slots
        await query("DELETE FROM time_slots WHERE provider_id = $1", [
          providerId
        ]);

        // Delete services
        await query("DELETE FROM services WHERE provider_id = $1", [
          providerId
        ]);

        // Delete provider record
        await query("DELETE FROM providers WHERE provider_id = $1", [
          providerId
        ]);
      }
    }

    // Delete user (this will cascade to appointments and other related records)
    await query("DELETE FROM users WHERE user_id = $1", [userId]);

    await query("COMMIT");

    logInfo(
      `Account deleted successfully for user: ${user.email} (${user.user_type})`
    );

    res.status(200).json({
      success: true,
      message: "Account deleted successfully. You have been logged out."
    });
  } catch (err) {
    await query("ROLLBACK");
    logError("Error deleting account", err);
    next(err);
  }
}
