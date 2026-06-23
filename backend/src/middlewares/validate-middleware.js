//middleware/validate-middleware.js
export function validate(schema, source = "body") {
  return (req, res, next) => {
    const data = source === "params" ? req.params : req.body;
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }
    next();
  };
}
