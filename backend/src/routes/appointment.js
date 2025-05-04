// src/routes/appointment.js
import express from "express";
import {
  CreateAppointment,
  cancelAppointment,
  listAppointments,
} from "../controllers/appointment-controller.js";
import {
  appointmentSchema,
  cancelAppointmentSchema,
} from "../validators/appointment-validator.js";
import { validate } from "../middlewares/validate-middleware.js"
import authMiddleware from "../middlewares/auth-middleware.js"; 

const router = express.Router();

router.use(authMiddleware); 

// POST /appointments
router.post("/create-appointment", validate(appointmentSchema), CreateAppointment);

// DELETE /appointments/:appointmentId
router.delete("/:appointmentId", validate(cancelAppointmentSchema),cancelAppointment); // optional path param validation

// GET /appointments
router.get("/list", listAppointments);

export default router;

