//validator/appointment.js
import Joi from 'joi'

/**
 * Used when booking a new appointment
 */
export const appointmentSchema = Joi.object({
  timeslotId: Joi.string().uuid().required().messages({
    'string.uuid': 'Time slot ID must be a valid UUID',
    'any.required': 'Time slot ID is required',
  }),
  appointment_date: Joi.date().required().messages({
    'date.base': 'Appointment date must be valid',
    'any.required': 'Appointment date is required',
  }),
  appointment_time: Joi.string()
    .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'Appointment time must be in HH:MM format',
      'any.required': 'Appointment time is required',
    }),
})
/**
 * Used when canceling an existing appointment
 */
export const cancelAppointmentSchema = Joi.object({
  appointmentId: Joi.string().uuid().required().messages({
    'string.uuid': 'Appointment ID must be a valid UUID',
    'any.required': 'Appointment ID is required',
  }),
})

/**
 * Middleware to validate appointment creation payload
 */
export const appointmentValidator = (req, res, next) => {
  const { error } = appointmentSchema.validate(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
  next()
}
