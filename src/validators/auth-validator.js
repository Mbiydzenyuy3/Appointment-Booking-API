import Joi from "joi";

// Common middleware for any schema
export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Registration schema
export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email({ maxDomainSegments: 2 }).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  confirmPassword: Joi.valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords must match" }),
  role: Joi.string().valid("user", "provider").default("user"),
});

// Login schema
export const loginSchema = Joi.object({
  email: Joi.string().email({ maxDomainSegments: 2 }).required(),
  password: Joi.string().required(),
});
