import ProviderAvailabilityModel from "../models/provider-availability-model.js";
import { logError, logInfo } from "../utils/logger.js";

export async function createAvailability(data) {
  try {
    // Could add checks, e.g. overlapping time here
    const availability = await ProviderAvailabilityModel.create(data);
    logInfo(`Availability created with id ${availability.id}`);
    return availability;
  } catch (err) {
    logError("Error creating availability", err);
    throw err;
  }
}

export async function getAvailabilityByProvider(providerId) {
  try {
    return await ProviderAvailabilityModel.getByProvider(providerId);
  } catch (err) {
    logError("Error fetching availability", err);
    throw err;
  }
}

export async function updateAvailability(id, data) {
  try {
    return await ProviderAvailabilityModel.update(id, data);
  } catch (err) {
    logError("Error updating availability", err);
    throw err;
  }
}

export async function deleteAvailability(id) {
  try {
    return await ProviderAvailabilityModel.delete(id);
  } catch (err) {
    logError("Error deleting availability", err);
    throw err;
  }
}
