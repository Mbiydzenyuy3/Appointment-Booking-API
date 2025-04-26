//validators/auth-validator.js
import Joi from "joi";

const registerValidator = Joi.object({
  email: Joi.string().email({ maxDomainSegments: 2 }).required(),
  name: Joi.string().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  confirmPassword: Joi.ref("password"),
  // confirmPassword: Joi.string().valid(Joi.ref("password")).required().options({ stripUnknown: true}),
})

export const registerValidatorMiddleware = (req, res, next) => {
  const { error } = registerValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const loginSchema = Joi.object({
  email: Joi.string().email({ maxDomainSegments: 2 }).required(),
  password: Joi.string().required(),
});

export const loginValidator = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
