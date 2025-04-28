//validator/slot-validator.js
import Joi from "joi";

export const slotSchema = Joi.object({
  day: Joi.date()
    .required()
    .messages({ "date.base": "Day must be a valid date" }),

  startTime: Joi.string()
    .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({ "string.pattern.base": "Start time must be in HH:MM format" }),

  endTime: Joi.string()
    .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({ "string.pattern.base": "End time must be in HH:MM format" }),
});
