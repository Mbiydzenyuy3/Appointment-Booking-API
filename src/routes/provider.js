// src/routes/provider.js
import express from "express";
import * as ProviderController from "../controllers/provider-controller.js";
import { validate } from "../middlewares/validate-middleware.js";
// import { providerSchema } from "../validators/provider-validator.js";
import {
  providerSchema,
  providerValidatorMiddleware,
} from "../validators/provider-validator.js";

const router = express.Router();

// Route for listing all providers
// This route accepts GET requests to '/providers'
// and retrieves the list of all providers from the database.
router.post(
  "/",
  validate(providerSchema),
  providerValidatorMiddleware,
  ProviderController.create
);

export default router;
