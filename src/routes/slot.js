// src/routes/slot.js
import express from "express";
import * as SlotController from "../controllers/slot-controller.js";
import { requireProvider } from "../middlewares/role-middleware.js"; // Middleware to restrict slot creation to providers
import authMiddleware from "../middlewares/auth-middleware.js";
import { validate } from "../middlewares/validate-middleware.js"; // Validation middleware
import { slotSchema } from "../validators/slot-validator.js"; // Joi schema for slot data validation

const router = express.Router();

// Route to create a new slot
// Only a provider can create a slot. The request body is validated against 'slotSchema'.
// This route accepts POST requests to '/slots' and creates a time slot for a provider.
router.post("/", authMiddleware, validate(slotSchema), requireProvider, SlotController.create);

// Route to list all slots for a particular provider
// The 'providerId' parameter is used to fetch the slots for that specific provider.
router.get("/:providerId", authMiddleware, SlotController.list);

export default router;
