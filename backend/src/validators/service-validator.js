// src/validators/service-validator.js
import Joi from "joi";

export const serviceSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Service name is required",
    "string.min": "Name should have at least 3 characters",
    "any.required": "Service name is required"
  }),

  description: Joi.string().optional().allow(""),

  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a positive number",
    "number.positive": "Price must be greater than 0",
    "any.required": "Price is required"
  }),

  durationMinutes: Joi.number().integer().positive().required().messages({
    "number.base": "Duration must be a positive integer",
    "number.positive": "Duration must be greater than 0",
    "any.required": "Duration is required"
  }),

  category: Joi.string().optional().allow(""),

  location: Joi.string().min(2).required().messages({
    "string.empty": "Location is required",
    "string.min": "Location must be at least 2 characters",
    "any.required": "Location is required"
  }),

  additionalDescription: Joi.string().optional().allow(""),

  imageUrl: Joi.string().uri().optional().allow("").messages({
    "string.uri": "Image URL must be a valid URL"
  })
});
