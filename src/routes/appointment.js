// src/routes/appointment.js
import express from "express";
import * as AppointmentController from "../controllers/appointment-controller.js";
import { appointmentValidator } from "../validators/appointment-validator.js"; // Validator for appointment data

const router = express.Router();

// Route to book a new appointment
// This route accepts POST requests to '/appointments' and creates an appointment.
// The request body is validated using the 'appointmentValidator'.
router.post("/", appointmentValidator, AppointmentController.bookAppointment);

// Route to cancel an existing appointment
// This route accepts DELETE requests to '/appointments/:appointmentId' to cancel a specific appointment by its ID.
router.delete("/:appointmentId", AppointmentController.cancelAppointment);

// Route to list all appointments for the logged-in user
// This route will fetch and return a list of all appointments associated with the current user.
router.get("/", AppointmentController.listAppointments);

export default router;
