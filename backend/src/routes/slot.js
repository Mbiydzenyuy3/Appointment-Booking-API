import express from "express";
import * as SlotController from "../controllers/slot-controller.js";
import { requireProvider } from "../middlewares/role-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { slotSchema, slotSearchSchema } from "../validators/slot-validator.js";

const router = express.Router();

/**
 * @swagger
 * /slots/create:
 *   post:
 *     summary: Create a new time slot
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SlotInput'
 *     responses:
 *       201:
 *         description: Slot created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden – only providers allowed
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/create",
  authMiddleware,
  requireProvider,
  validate(slotSchema),
  SlotController.create
);

/**
 * @swagger
 * /slots/{providerId}:
 *   get:
 *     summary: Get all time slots for a provider
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the provider
 *     responses:
 *       200:
 *         description: List of slots
 *       401:
 *         description: Unauthorized
 */
router.get("/:providerId", authMiddleware, SlotController.list);

/**
 * @swagger
 * /slots/{slotId}:
 *   put:
 *     summary: Update an existing time slot
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the slot to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SlotInput'
 *     responses:
 *       200:
 *         description: Slot updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/:slotId",
  authMiddleware,
  requireProvider,
  validate(slotSchema),
  SlotController.update
);

/**
 * @swagger
 * /slots/{slotId}:
 *   delete:
 *     summary: Delete a time slot
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         schema:
 *           type: string
 *         required: true
 *         description: Slot ID to delete
 *     responses:
 *       200:
 *         description: Slot deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:slotId",
  authMiddleware,
  requireProvider,
  SlotController.remove
);

/**
 * @swagger
 * /slots/search/available:
 *   get:
 *     summary: Search available time slots
 *     tags: [Slots]
 *     parameters:
 *       - in: query
 *         name: providerId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by provider ID
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by service ID
 *       - in: query
 *         name: day
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter by day (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: List of available slots
 */
router.get(
  "/search/available",
  validate(slotSearchSchema, "query"),
  SlotController.search
);

export default router;
