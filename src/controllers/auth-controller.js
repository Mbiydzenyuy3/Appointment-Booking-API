//controller/auth-controller.js
import { token } from "morgan";
import * as AuthService from "../services/auth-service.js";
import { logError, logInfo } from "../utils/logger.js";

// Controller function for user registration
export async function register(req, res, next) {
  console.log(req.body);
  try {
    const user = await AuthService.createUser(req.body);
    logInfo("New user registered", user.email);

    // Send response on successful user creation
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (err) {
    // Handling errors
    if (err.name === "AuthError") {
      // Handle AuthError specifically
      logError(`Authentication error during registration: ${err.message}`, err);
      return res.status(400).json({
        success: false,
        message: err.message, // Specific AuthError message
      });
    }

    // Handle unexpected errors
    logError("Unexpected error during registration:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
}

// Controller function for user login
export async function login(req, res, next) {
  try {
    const { user, token } = await AuthService.login(req.body);
    logInfo("User logged in", user.email);
    res.status(201).json({
      success: true,
      token: token,
      message: "User LoggedIn successfully",
      data: user,
    });
  } catch (err) {
    logError("Error registering user", err);
    next(err);
  }
}
