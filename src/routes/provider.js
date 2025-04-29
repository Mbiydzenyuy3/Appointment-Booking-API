// src/routes/provider.js
import express from "express";
import * as ProviderController from "../controllers/provider-controller.js";
import { validate } from "../middlewares/validate-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import {
  providerSchema
} from "../validators/provider-validator.js";

const router = express.Router();

//create a new provider
router.post(
  "/",
  validate(providerSchema),authMiddleware,
  ProviderController.create
);

// Get list of all providers
router.get("/", ProviderController.list);
export default router;
