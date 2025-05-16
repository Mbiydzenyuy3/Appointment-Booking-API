import express from "express";
import * as ProviderAvailabilityController from "../controllers/provider-availability-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { requireProvider } from "../middlewares/role-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { availabilitySchema } from "../validators/provider-validator.js";

const router = express.Router();



router.post(
  "/",
  authMiddleware,
  requireProvider,
  validate(availabilitySchema),
  ProviderAvailabilityController.create
);

router.get("/:providerId", authMiddleware, ProviderAvailabilityController.list);

router.put(
  "/:id",
  authMiddleware,
  requireProvider,
  validate(availabilitySchema),
  ProviderAvailabilityController.update
);

router.delete(
  "/:id",
  authMiddleware,
  requireProvider,
  ProviderAvailabilityController.remove
);

export default router;
