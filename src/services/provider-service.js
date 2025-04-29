//services/provider-service.js
import ProviderModel from "../models/provider-model.js";
import { logError } from "../utils/logger.js";

export async function createProvider(providerData) {
  try {
    return await ProviderModel.create(providerData);
  } catch (err) {
    logError("Service error - creating provider", err);
    throw new Error("Unable to create provider.");
  }
}

export async function listProviders() {
  try {
    return await ProviderModel.listAll();
  } catch (err) {
    logError("Service error - listing providers", err);
    throw new Error("Unable to fetch providers.");
  }
}
