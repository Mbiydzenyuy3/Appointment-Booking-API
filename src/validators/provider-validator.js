import Joi from "joi";

export const providerValidator = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
});
