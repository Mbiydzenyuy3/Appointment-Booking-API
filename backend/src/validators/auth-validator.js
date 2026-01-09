//validator/auth-validator.js
import Joi from "joi";

// Registration schema for registration endpoint
export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.min": "Name should have at least 3 characters",
    "string.max": "Name should have at most 30 characters",
    "any.required": "Name is required"
  }),
  email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required"
  }),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?\":{}|<>_\\-+=\\[\\]\\\\';/]).*$"
      )
    )
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password must be no more than 30 characters long",
      "string.pattern.base":
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
      "any.required": "Password is required"
    }),
  user_type: Joi.string().valid("client", "provider").default("client")
});

// Login schema for login endpoint
export const loginSchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required"
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required"
  })
});
