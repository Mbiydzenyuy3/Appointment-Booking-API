import Joi from "joi";

export const slotSchema = Joi.object({
  startTime: Joi.string().isoDate().required(),
  endTime: Joi.string().isoDate().required(),
});
