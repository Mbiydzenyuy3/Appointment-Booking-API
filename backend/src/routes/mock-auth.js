// Mock auth routes for development testing
import express from "express";
import * as MockAuthController from "../controllers/mock-auth-controller.js";
import mockAuthMiddleware from "../middlewares/mock-auth-middleware.js";

const router = express.Router();

// User profile routes (protected with mock auth)
router.get("/profile", mockAuthMiddleware, MockAuthController.getUserProfile);
router.put(
  "/profile",
  mockAuthMiddleware,
  MockAuthController.updateUserProfile
);

export default router;
