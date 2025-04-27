//services/slot-service.js
import { logError } from "../utils/logger.js";
import SlotModel from "../models/slot-model.js";

export async function createSlot({ providerId, startTime, endTime }) {
  try {
    return await SlotModel.create({ providerId, startTime, endTime });
  } catch (err) {
    logError("Error creating slot", err);
    throw new Error("Unable to create slot.");
  }
}

export async function getSlotsByProvider(providerId) {
  try {
    return await SlotModel.getByProvider(providerId);
  } catch (err) {
    logError("Error fetching slots", err);
    throw new Error("Unable to fetch slots for provider.");
  }
}
