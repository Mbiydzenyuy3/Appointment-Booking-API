// src/services/provider-service.js
import ProviderModel from "../models/provider-model.js";
import { logError } from "../utils/logger.js";

export async function createProvider({ user_id, bio, rating }) {
  try {
    if (!user_id || typeof bio !== "string" || (rating && isNaN(rating))) {
      throw new Error("Invalid input for provider creation");
    }

    const existing = await ProviderModel.findByUserId(user_id);
    if (existing) {
      throw new Error("Provider already exists for this user.");
    }

    return await ProviderModel.create({ user_id, bio, rating });
  } catch (err) {
    logError("Service error - creating provider", err);
    throw new Error(err.message || "Unable to create provider.");
  }
}

export async function listProviders({limit, offset}) {
  try {
    return await ProviderModel.listAll({limit, offset});
  } catch (err) {
    logError("Service error - listing providers", err);
    throw new Error("Unable to fetch providers.");
  }
}
