// src/validators/service-validator.js
import Joi from "joi";

export const serviceSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
    "string.min": "Name should have at least 3 characters",
    "any.required": "Name is required",
  }),

  description: Joi.string().optional(),

  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a positive number",
    "any.required": "Price is required",
  }),

  durationMinutes: Joi.number().integer().positive().required().messages({
    "number.base": "Duration must be a positive integer",
    "any.required": "Duration is required",
  }),
});
