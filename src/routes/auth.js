// src/routes/auth.js
import express from "express";
import {
  registerValidatorMiddleware,
  loginValidator,
} from "../validators/auth-validator.js";
import * as AuthController from "../controllers/auth-controller.js";

const router = express.Router();

// Route for user registration
// This route accepts POST requests to '/auth/register'
// with validation middleware for user input.
router.post("/register", registerValidatorMiddleware, AuthController.register);

// Route for user login
// This route accepts POST requests to '/auth/login'
// with validation middleware for user input.
router.post("/login", loginValidator, AuthController.login);

export default router;
