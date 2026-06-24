// src/routes/appointment.js
import express from "express";
import {
  CreateAppointment,
  CreateGuestAppointment,
  cancelAppointment,
  listAppointments,
  hasBookedWithProvider,
  completeAppointment
} from "../controllers/appointment-controller.js";
import {
  appointmentSchema,
  guestAppointmentSchema,
  cancelAppointmentSchema
} from "../validators/appointment-validator.js";
import { validate } from "../middlewares/validate-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { idempotencyGuard } from "../middlewares/idempotency-middleware.js";

const router = express.Router();

// Guest booking route (no auth required)
router.post(
  "/guest-book",
  validate(guestAppointmentSchema),
  idempotencyGuard(),
  CreateGuestAppointment
);

router.use(authMiddleware);

/**
 * @swagger
 * /appointments/book:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentCreateInput'
 *     responses:
 *       201:
 *         description: Appointment successfully booked
 *       400:
 *         description: Validation error or missing fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – only clients allowed
 */

router.post("/book", validate(appointmentSchema), idempotencyGuard(), CreateAppointment);

/**
 * @swagger
 * /appointments/:appointmentId:
 *   delete:
 *     summary: Cancel an appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the appointment to cancel
 *     responses:
 *       200:
 *         description: Appointment cancelled
 *       404:
 *         description: Appointment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – only clients allowed
 */
router.delete(
  "/:appointmentId",
  validate(cancelAppointmentSchema, "params"),
  cancelAppointment
);

/**
 * @swagger
 * /appointments/list:
 *   get:
 *     summary: Get all appointments for the logged-in client
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [booked, cancelled, completed, no-show]
 *         description: Filter by appointment status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments on or after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments on or before this date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of appointments
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – only clients allowed
 */

router.get("/list", listAppointments);

// Check if current client has any booking with a provider (used to gate contacts/messaging)
router.get("/has-booked", hasBookedWithProvider);

// Provider marks an appointment as completed — unlocks client review
router.put("/:appointmentId/complete", completeAppointment);

export default router;
