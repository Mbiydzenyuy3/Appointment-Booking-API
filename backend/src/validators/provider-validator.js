// validators/provider-validator.js
import Joi from "joi";

export const providerSchema = Joi.object({
  bio: Joi.string().max(500).required(),
  rating: Joi.number().min(0).max(5),
});

export const availabilitySchema = Joi.object({
  dayOfWeek: Joi.number().integer().min(0).max(6).required(),
  startTime: Joi.string()
    .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .required(),
  endTime: Joi.string()
    .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .required(),
}).custom((value, helpers) => {
  const [startH, startM] = value.startTime.split(":").map(Number);
  const [endH, endM] = value.endTime.split(":").map(Number);
  if (startH * 60 + startM >= endH * 60 + endM) {
    return helpers.message("End time must be after start time");
  }
  return value;
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
