// src/middlewares/error-handler.js
export function ErrorHandler(err, req, res, next) {
  console.error(err); // Log the error details

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
}
