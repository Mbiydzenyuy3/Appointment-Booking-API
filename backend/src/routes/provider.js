// src/routes/provider-routes.js
import express from "express";
import * as ProviderController from "../controllers/provider-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { requireProvider } from "../middlewares/role-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { providerSchema } from "../validators/provider-validator.js"; // Optional if you want request validation

const router = express.Router();

// Create provider profile (only authenticated users)
router.post(
  "/create",
  authMiddleware,
  validate(providerSchema), // Optional: add this if you want to validate bio/rating
  ProviderController.createProvider
);

// Update provider profile (authenticated & provider-only)
router.put(
  "/update",
  authMiddleware,
  requireProvider,
  validate(providerSchema),
  ProviderController.updateProvider
);

// Get current provider profile (authenticated user)
router.get(
  "/me",
  authMiddleware,
  requireProvider,
  ProviderController.getCurrentProvider
);

// Get all providers (optional pagination)
router.get("/", authMiddleware, ProviderController.getAllProviders);

export default router;
