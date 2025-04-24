import express from "express";
import * as AuthController from "../controllers/auth-controller.js";

const router = express.Router();

// Route for user registration
router.post("/register", AuthController.register);

// Route for user login
router.post("/login", AuthController.login);

export default router;
