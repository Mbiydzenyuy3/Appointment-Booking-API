// src/services/slot-service.js
import { createSlot, getSlotsByProviderId } from "../models/slot-model.js";
import { logError, logInfo } from "../utils/logger.js";

export async function create({ providerId, day, startTime, endTime }) {
  try {
    const slot = await createSlot({ providerId, day, startTime, endTime });
    logInfo("Slot created", slot.id);
    return slot;
  } catch (err) {
    logError("Slot service failed to create slot", err);
    throw err;
  }
}

export async function getSlotsByProvider(providerId) {
  try {
    return await getSlotsByProvider(providerId);
  } catch (err) {
    logError("Failed to fetch provider's slots", err);
    throw err;
  }
}
