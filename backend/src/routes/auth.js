// src/routes/auth.js
import express from "express";
import { validate } from "../middlewares/validate-middleware.js";
import { registerSchema, loginSchema } from "../validators/auth-validator.js";
import * as AuthController from "../controllers/auth-controller.js";

const router = express.Router();

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

router.post("/register", validate(registerSchema), AuthController.register);

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

router.post("/login", validate(loginSchema), AuthController.login);

export default router;
