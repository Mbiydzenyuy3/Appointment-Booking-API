import express from "express";
import * as AppointmentController from "../controllers/appointment-controller.js";
import { appointmentValidator } from "../validators/appointment-validator.js";

const router = express.Router();

// Book a new appointment
router.post("/", appointmentValidator, AppointmentController.bookAppointment);

// Cancel an appointment
router.delete("/:appointmentId", AppointmentController.cancelAppointment);

// List all appointments for logged-in user
router.get("/", AppointmentController.listAppointments);

export default router;
