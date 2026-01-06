// src/routes/whatsapp.js
import express from "express";
import * as WhatsAppController from "../controllers/whatsapp-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { requireProvider } from "../middlewares/role-middleware.js";

const router = express.Router();

/**
 * @swagger
 * /whatsapp/broadcast-slots:
 *   post:
 *     summary: Broadcast available slots to contacts via WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                     start_time:
 *                       type: string
 *                     end_time:
 *                       type: string
 *     responses:
 *       200:
 *         description: Broadcast sent successfully
 */
router.post(
  "/broadcast-slots",
  authMiddleware,
  requireProvider,
  WhatsAppController.broadcastSlots
);

/**
 * @swagger
 * /whatsapp/send-confirmation:
 *   post:
 *     summary: Send booking confirmation to client via WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_phone:
 *                 type: string
 *               appointment_details:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                   time:
 *                     type: string
 *                   service:
 *                     type: string
 *                   price:
 *                     type: number
 *     responses:
 *       200:
 *         description: Confirmation sent successfully
 */
router.post(
  "/send-confirmation",
  authMiddleware,
  requireProvider,
  WhatsAppController.sendConfirmation
);

/**
 * @swagger
 * /whatsapp/notify-provider:
 *   post:
 *     summary: Send booking notification to provider via WhatsApp
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider_phone:
 *                 type: string
 *               client_name:
 *                 type: string
 *               appointment_details:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                   time:
 *                     type: string
 *                   service:
 *                     type: string
 *                   price:
 *                     type: number
 *     responses:
 *       200:
 *         description: Provider notification sent successfully
 */
router.post("/notify-provider", WhatsAppController.notifyProvider);

export default router;
