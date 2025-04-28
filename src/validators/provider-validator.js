//validators/provider-validator.js
import Joi from "joi";

export const providerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
    "string.min": "Name should have at least 3 characters",
    "any.required": "Name is required",
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
});

// Middleware to validate provider creation
export const providerValidatorMiddleware = (req, res, next) => {
  const { error } = providerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
