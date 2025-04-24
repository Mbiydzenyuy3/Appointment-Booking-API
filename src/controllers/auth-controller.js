import * as AuthService from "../services/auth-service.js";
import { logInfo } from "../utils/logger.js";

// Controller function for user registration
export async function register(req, res, next) {
  try {
    const user = await AuthService.createUser(req.body);
    logInfo("New user registered", user.email);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

// Controller function for user login
export async function login(req, res, next) {
  try {
    const { user, token } = await AuthService.login(req.body);
    logInfo("User logged in", user.email);
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
}
