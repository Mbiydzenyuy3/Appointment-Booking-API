import ProviderModel from "../models/provider-model.js";
import { logError } from "../utils/logger.js";

//list all providers
export async function listProviders(req, res, next) {
  try {
    const providers = await ProviderModel.listAll();
    return res.status(200).json({
      success: true,
      message: "Providers fetched successfully",
      data: providers,
    });
  } catch (err) {
    logError("Error fetching providers", err);
    next(err); 
  }
}
