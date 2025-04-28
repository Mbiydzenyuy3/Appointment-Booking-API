import ProviderModel from "../models/provider-model.js";
import { logError } from "../utils/logger.js";

export async function create(req, res, next) {
  try {
    const providerData = req.body; // assuming you're passing data in the request body
    const newProvider = await ProviderModel.create(providerData); // assuming a create function in the model
    return res.status(201).json({
      success: true,
      message: "Provider created successfully",
      data: newProvider,
    });
  } catch (err) {
    logError("Error creating provider", err);
    next(err); // pass the error to the next middleware (e.g., global error handler)
  }
}
