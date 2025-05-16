// src/routes/service.js
import express from "express";
import * as ServiceController from "../controllers/service-controller.js";
import { validate } from "../middlewares/validate-middleware.js"; // Validation middleware
import authMiddleware from "../middlewares/auth-middleware.js"; // Auth middleware
import { serviceSchema } from "../validators/service-validator.js"; // Validation schema

const router = express.Router();
/**
 * @swagger
 * /services/create:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, durationMinutes]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               durationMinutes:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Service created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden — must be provider
 */
router.post(
  "/create",
  authMiddleware,
  validate(serviceSchema),
  ServiceController.create
);

export default router;
