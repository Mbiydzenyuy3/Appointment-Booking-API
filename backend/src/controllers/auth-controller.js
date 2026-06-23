import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { logError, logInfo } from "../utils/logger.js";
import { query, withTransaction } from "../config/db.js";
import ProviderModel from "../models/provider-model.js";
import { sendPasswordResetEmail } from "../services/email-service.js";

/* ---------------------------------------
   AUTH HELPERS
---------------------------------------- */
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (matches JWT expiry)
};

function setCookieToken(res, token) {
  res.cookie("token", token, COOKIE_OPTS);
}

const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user.user_id,
      email: user.email,
      user_type: user.user_type,
      provider_id: user.provider_id || null,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* ---------------------------------------
   REGISTER
---------------------------------------- */
export async function register(req, res, next) {
  const { name, email, password, user_type } = req.body;

  if (!name || !email || !password || !user_type) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  if (!["client", "provider"].includes(user_type)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid account type." });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters."
    });
  }

  try {
    const result = await withTransaction(async (client) => {
      const exists = await client.query(
        "SELECT 1 FROM users WHERE email = $1",
        [email]
      );
      if (exists.rowCount > 0) throw new Error("EMAIL_EXISTS");

      const hashedPassword = await bcrypt.hash(password, 10);

      const userResult = await client.query(
        `INSERT INTO users (name, email, password, user_type)
         VALUES ($1,$2,$3,$4)
         RETURNING user_id, name, email, user_type`,
        [name, email, hashedPassword, user_type]
      );

      const user = userResult.rows[0];

      let provider = null;
      if (user_type === "provider") {
        provider = await ProviderModel.create(
          { user_id: user.user_id },
          client
        );
      }

      return { ...user, provider_id: provider?.provider_id || null };
    });

    const token = generateToken(result);
    setCookieToken(res, token);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      data: result
    });
  } catch (err) {
    if (err.message === "EMAIL_EXISTS") {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered." });
    }

    logError("Registration failed:", err);
    next(err);
  }
}

/* ---------------------------------------
   LOGIN
---------------------------------------- */
export async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password required." });
  }

  try {
    const { rows } = await query("SELECT * FROM users WHERE email = $1", [
      email
    ]);
    if (rows.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });

    // Include provider info if applicable
    let providerId = null;
    if (user.user_type === "provider") {
      const provider = await ProviderModel.findByUserId(user.user_id);
      providerId = provider?.provider_id || null;
    }

    const token = generateToken({ ...user, provider_id: providerId });
    setCookieToken(res, token);

    logInfo("User logged in:", user.email);

    const { password: _p, reset_password_token: _rpt, reset_password_expires: _rpe, ...safeUser } = user;
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { ...safeUser, provider_id: providerId }
    });
  } catch (err) {
    logError("Login error:", err);
    next(err);
  }
}

/* ---------------------------------------
   GET USER PROFILE
---------------------------------------- */
export async function getUserProfile(req, res, next) {
  const userId = req.user.user_id;

  try {
    const { rows } = await query(
      "SELECT user_id, name, email, user_type, created_at, updated_at FROM users WHERE user_id = $1",
      [userId]
    );

    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    const user = rows[0];

    let providerInfo = null;
    if (user.user_type === "provider") {
      const providerRows = await query(
        "SELECT provider_id, bio, phone, hourly_rate, referral_code, booking_slug FROM providers WHERE user_id = $1",
        [userId]
      );
      providerInfo = providerRows.rows[0] || null;
    }

    res
      .status(200)
      .json({ success: true, data: { ...user, provider_info: providerInfo } });
  } catch (err) {
    logError("Get profile error:", err);
    next(err);
  }
}

/* ---------------------------------------
   UPDATE USER PROFILE
---------------------------------------- */
export async function updateUserProfile(req, res, next) {
  const userId = req.user.user_id;
  const { name } = req.body;

  if (!name || !name.trim())
    return res
      .status(400)
      .json({ success: false, message: "Name cannot be empty." });

  try {
    const { rows } = await query(
      "UPDATE users SET name=$1, updated_at=NOW() WHERE user_id=$2 RETURNING user_id, name, email, user_type, updated_at",
      [name.trim(), userId]
    );

    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: rows[0]
    });
  } catch (err) {
    logError("Update profile error:", err);
    next(err);
  }
}

/* ---------------------------------------
   UPDATE PROVIDER PROFILE
---------------------------------------- */
export async function updateProviderProfile(req, res, next) {
  const userId = req.user.user_id;
  const { bio, phone, hourly_rate, referral_code } = req.body;

  try {
    const provider = await ProviderModel.updateByUserId(userId, {
      bio,
      phone,
      hourly_rate,
      referral_code
    });
    if (!provider)
      return res
        .status(404)
        .json({ success: false, message: "Provider profile not found." });

    res.status(200).json({
      success: true,
      message: "Provider profile updated.",
      data: provider
    });
  } catch (err) {
    logError("Update provider error:", err);
    next(err);
  }
}

/* ---------------------------------------
   FORGOT PASSWORD
---------------------------------------- */
export async function forgotPassword(req, res, next) {
  const { email } = req.body;

  if (!email)
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });

  try {
    const { rows } = await query("SELECT user_id FROM users WHERE email=$1", [
      email
    ]);

    if (!rows.length) {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent."
      });
    }

    const userId = rows[0].user_id;
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

    await query(
      "UPDATE users SET reset_password_token=$1, reset_password_expires=$2 WHERE user_id=$3",
      [resetToken, expires, userId]
    );

    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent."
    });
  } catch (err) {
    logError("Forgot password error:", err);
    next(err);
  }
}

/* ---------------------------------------
   RESET PASSWORD
---------------------------------------- */
export async function resetPassword(req, res, next) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return res
      .status(400)
      .json({
        success: false,
        message: "Token and new password are required."
      });
  if (newPassword.length < 8)
    return res
      .status(400)
      .json({
        success: false,
        message: "Password must be at least 8 characters long."
      });

  try {
    const { rows } = await query(
      "SELECT user_id, reset_password_expires FROM users WHERE reset_password_token=$1",
      [token]
    );

    if (!rows.length)
      return res
        .status(400)
        .json({ success: false, message: "Invalid reset token." });

    const user = rows[0];
    if (new Date(user.reset_password_expires) < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Reset token has expired." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await query(
      "UPDATE users SET password=$1, reset_password_token=NULL, reset_password_expires=NULL, updated_at=NOW() WHERE user_id=$2",
      [hashed, user.user_id]
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Password has been reset successfully."
      });
  } catch (err) {
    logError("Reset password error:", err);
    next(err);
  }
}

/* ---------------------------------------
   CHANGE PASSWORD
---------------------------------------- */
export async function changePassword(req, res, next) {
  const userId = req.user.user_id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res
      .status(400)
      .json({ success: false, message: "Both passwords required." });
  if (newPassword.length < 8)
    return res
      .status(400)
      .json({ success: false, message: "Password too short." });

  try {
    const { rows } = await query(
      "SELECT password FROM users WHERE user_id=$1",
      [userId]
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid)
      return res
        .status(400)
        .json({ success: false, message: "Current password incorrect." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await query(
      "UPDATE users SET password=$1, updated_at=NOW() WHERE user_id=$2",
      [hashed, userId]
    );

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    logError("Change password error:", err);
    next(err);
  }
}

/* ---------------------------------------
   DELETE ACCOUNT
---------------------------------------- */
export async function deleteAccount(req, res, next) {
  const userId = req.user.user_id;

  try {
    await query("DELETE FROM users WHERE user_id=$1", [userId]);
    res
      .status(200)
      .json({ success: true, message: "Account deleted successfully." });
  } catch (err) {
    logError("Delete account error:", err);
    next(err);
  }
}

/* ---------------------------------------
   UPDATE USER TYPE
---------------------------------------- */
export async function updateUserType(req, res, next) {
  const userId = req.user.user_id;
  const { user_type } = req.body;

  if (!["client", "provider"].includes(user_type)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user type." });
  }

  try {
    const { rows } = await query(
      "UPDATE users SET user_type=$1, updated_at=NOW() WHERE user_id=$2 RETURNING user_id, name, email, user_type",
      [user_type, userId]
    );
    res
      .status(200)
      .json({ success: true, message: "User type updated.", data: rows[0] });
  } catch (err) {
    logError("Update user type error:", err);
    next(err);
  }
}

/* ---------------------------------------
   CONVERT GUEST TO REGISTERED USER
---------------------------------------- */
export async function convertGuestToUser(req, res, next) {
  const { guest_email, name, password } = req.body;

  if (!guest_email || !name || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields required." });
  }

  try {
    const existing = await query("SELECT 1 FROM users WHERE email=$1", [
      guest_email
    ]);
    if (existing.rowCount > 0)
      return res
        .status(400)
        .json({ success: false, message: "Email already exists." });

    const hashed = await bcrypt.hash(password, 10);

    const { rows } = await query(
      "INSERT INTO users (name,email,password,user_type) VALUES ($1,$2,$3,'client') RETURNING user_id,name,email,user_type",
      [name, guest_email, hashed]
    );

    const token = generateToken(rows[0]);
    setCookieToken(res, token);

    res.status(201).json({
      success: true,
      message: "Guest converted to user.",
      data: rows[0]
    });
  } catch (err) {
    logError("Convert guest error:", err);
    next(err);
  }
}

/* ---------------------------------------
   GOOGLE OAUTH CALLBACK
---------------------------------------- */
export async function googleAuthCallback(req, res, next) {
  try {
    const { email, name } = req.user; // Assuming passport middleware sets req.user

    let user = await query("SELECT * FROM users WHERE email=$1", [email]);

    if (!user.rows.length) {
      const { rows } = await query(
        "INSERT INTO users (name,email,user_type) VALUES ($1,$2,'client') RETURNING user_id,name,email,user_type",
        [name, email]
      );
      user = rows[0];
    } else {
      user = user.rows[0];
    }

    const token = generateToken(user);
    setCookieToken(res, token);
    const { password: _p, reset_password_token: _rpt, reset_password_expires: _rpe, ...safeUser } = user;
    res
      .status(200)
      .json({ success: true, message: "Login successful.", data: safeUser });
  } catch (err) {
    logError("Google auth callback error:", err);
    next(err);
  }
}

/* ---------------------------------------
   LOGOUT
---------------------------------------- */
export async function logout(req, res) {
  res.clearCookie("token", COOKIE_OPTS);
  res.json({ success: true, message: "Logged out." });
}
