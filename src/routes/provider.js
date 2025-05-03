// src/routes/provider.js
import express from "express";
import * as ProviderController from "../controllers/provider-controller.js";
import { requireRole } from "../middlewares/role-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";
// import { providerSchema } from "../validators/provider-validator.js";
import { providerValidatorMiddleware } from "../validators/provider-validator.js";

const router = express.Router();

// Create a new provider profile
router.post(
  "/",
  authMiddleware,
  requireRole("provider"),
  providerValidatorMiddleware,
  ProviderController.createProvider
);

// Update an existing provider profile
router.put(
  "/",
  authMiddleware,
  requireRole("provider"),
  providerValidatorMiddleware,
  ProviderController.updateProvider
);


// List all providers
router.get("/providers", ProviderController.getAllProviders);

export default router;
