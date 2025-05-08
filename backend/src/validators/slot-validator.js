import Joi from "joi";

/**
 * Validator for creating a time slot
 */
export const slotSchema = Joi.object({
  day: Joi.date().required().messages({
    "date.base": "Day must be a valid date",
    "any.required": "Day is required",
  }),
  startTime: Joi.string()
    .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "string.pattern.base": "Start time must be in HH:MM format",
      "any.required": "Start time is required",
    }),
  endTime: Joi.string()
    .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "string.pattern.base": "End time must be in HH:MM format",
      "any.required": "End time is required",
    }),
  serviceId: Joi.string().uuid().required().messages({
    "string.guid": "Service ID must be a valid UUID",
    "any.required": "Service ID is required",
  }),
}).custom((value, helpers) => {
  const [startH, startM] = value.startTime.split(":").map(Number);
  const [endH, endM] = value.endTime.split(":").map(Number);
  if (startH * 60 + startM >= endH * 60 + endM) {
    return helpers.message("End time must be after start time");
  }
  return value;
});
