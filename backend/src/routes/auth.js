// src/routes/auth.js
import express from "express";
import { validate } from "../middlewares/validate-middleware.js";
import { registerSchema, loginSchema } from "../validators/auth-validator.js";
import * as AuthController from "../controllers/auth-controller.js";

const router = express.Router();

// Route for user registration
// This route accepts POST requests to '/auth/register'
// with validation middleware for user input.
router.post("/register", validate(registerSchema), AuthController.register);

// Route for user login
// This route accepts POST requests to '/auth/login'
// with validation middleware for user input.
router.post("/login", validate(loginSchema), AuthController.login);

export default router;
