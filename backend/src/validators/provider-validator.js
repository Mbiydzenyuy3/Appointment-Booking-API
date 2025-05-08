// validators/provider-validator.js
import Joi from "joi";

export const providerSchema = Joi.object({
  bio: Joi.string().max(500).required(),
  rating: Joi.number().min(0).max(5),
});

export function providerValidatorMiddleware(req, res, next) {
  const { error } = providerSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }

   return next(); // ✅ Only called if no validation errors
}
