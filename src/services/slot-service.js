import { createSlot, getSlotsByProviderId } from "../models/slot-model.js";
import { logError, logInfo } from "../utils/logger.js";

export async function create({
  providerId,
  day,
  startTime,
  endTime,
  serviceId,
}) {
  try {
    const slot = await createSlot({
      provider_id: providerId,
      day,
      start_time: startTime,
      end_time: endTime,
      service_id: serviceId,
    });
    logInfo("Slot created", slot.id);
    return slot;
  } catch (err) {
    logError("Slot service failed to create slot", err);
    throw new Error("Unable to create slot");
  }
}

export async function getSlotsByProvider(providerId) {
  try {
    return await getSlotsByProviderId(providerId);
  } catch (err) {
    logError("Failed to fetch provider's slots", err);
    throw new Error("Unable to fetch slots");
  }
}
