// src/routes/service.js
import express from "express";
import * as ServiceController from "../controllers/service-controller.js";
import { validate } from "../middlewares/validate-middleware.js"; // Validation middleware
import authMiddleware from "../middlewares/auth-middleware.js"; // Auth middleware
import { serviceSchema } from "../validators/service-validator.js"; // Validation schema

const router = express.Router();

// Create a new service
router.post(
  "/create",
  authMiddleware,
  validate(serviceSchema),
  ServiceController.create
);

export default router;
