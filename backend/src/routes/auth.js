// src/routes/auth.js
import express from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../middlewares/validate-middleware.js";
import { registerSchema, loginSchema } from "../validators/auth-validator.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import * as AuthController from "../controllers/auth-controller.js";

const router = express.Router();

// Strict limiter for mutation endpoints (login, register, password reset)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (client or provider)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *               - user_type
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               user_type:
 *                 type: string
 *                 enum: [client, provider]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or duplicate email
 */

router.post("/register", authLimiter, validate(registerSchema), AuthController.register);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (client or provider)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *               - user_type
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               user_type:
 *                 type: string
 *                 enum: [client, provider]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or duplicate email
 */

router.post("/login", authLimiter, validate(loginSchema), AuthController.login);

router.post("/forgot-password", authLimiter, AuthController.forgotPassword);
router.post("/reset-password", authLimiter, AuthController.resetPassword);

// Google OAuth routes
router.post("/google-auth", AuthController.googleAuthCallback);

// User profile routes (protected)
router.get("/profile", authMiddleware, AuthController.getUserProfile);
router.put("/profile", authMiddleware, AuthController.updateUserProfile);

// Provider profile routes (protected)
router.put(
  "/provider-profile",
  authMiddleware,
  AuthController.updateProviderProfile
);

// Password management routes (protected)
router.put("/change-password", authMiddleware, AuthController.changePassword);

// Account management routes (protected)
router.delete("/delete-account", authMiddleware, AuthController.deleteAccount);

// User type update route (for new Google users)
router.put("/update-user-type", authMiddleware, AuthController.updateUserType);

// Guest conversion route (public)
router.post("/convert-guest", AuthController.convertGuestToUser);

export default router;
