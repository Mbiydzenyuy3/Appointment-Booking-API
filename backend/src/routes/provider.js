// src/routes/provider-routes.js
import express from "express";
import * as ProviderController from "../controllers/provider-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { requireProvider } from "../middlewares/role-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { providerSchema } from "../validators/provider-validator.js"; // Optional if you want request validation

const router = express.Router();

/**
 * @swagger
 * /providers/create:
 *   post:
 *     summary: Create a provider profile
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       201:
 *         description: Provider profile created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

router.post(
  "/create",
  authMiddleware,
  validate(providerSchema), // Optional: add this if you want to validate bio/rating
  ProviderController.createProvider
);

/**
 * @swagger
 * /providers/update:
 *   put:
 *     summary: Update the current provider's profile
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (only providers)
 */

router.put(
  "/update",
  authMiddleware,
  requireProvider,
  validate(providerSchema),
  ProviderController.updateProvider
);

/**
 * @swagger
 * /providers/me:
 *   get:
 *     summary: Get current provider profile
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provider profile
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only providers allowed
 */

router.get(
  "/me",
  authMiddleware,
  requireProvider,
  ProviderController.getCurrentProvider
);

/**
 * @swagger
 * /providers:
 *   get:
 *     summary: List all providers
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of provider profiles
 */

router.get("/", authMiddleware, ProviderController.getAllProviders);

export default router;
