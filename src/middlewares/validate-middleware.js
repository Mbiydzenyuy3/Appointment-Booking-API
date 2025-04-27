//middleware/validate-middleware.js
import { ValidationError } from "joi";
import { logError } from "../utils/logger.js";


// Validation middleware to catch validation errors and send a response
export const validate = (schema) => async (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    logError("Validation error", error.details);
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
