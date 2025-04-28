//validator/appointment-validator.js
import Joi from "joi";

export const cancelAppointmentSchema = Joi.object({
  appointmentId: Joi.string().uuid().required().messages({
    "string.uuid": "Appointment ID must be a valid UUID",
    "any.required": "Appointment ID is required",
  }),
});

export const appointmentSchema = Joi.object({
  providerId: Joi.number().integer().required(),
  slotId: Joi.number().integer().required(),
  appointmentDate: Joi.date().required(),
  appointmentTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
});

// Middleware for booking an appointment
export const appointmentValidator = (req, res, next) => {
  const { error } = appointmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
