import express from "express";
import {
  registerValidatorMiddleware,
  loginValidator,
} from "../validators/auth-validator.js";
import * as AuthController from "../controllers/auth-controller.js";

const router = express.Router();

// Route for user registration
router.post("/register", registerValidatorMiddleware, AuthController.register);

// Route for user login
router.post("/login", loginValidator, AuthController.login);

export default router;
