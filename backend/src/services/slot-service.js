// src/services/slot-service.js
import { createSlot, getSlotsByProviderId } from "../models/slot-model.js";
import { searchAvailableSlots } from "../models/slot-model.js";
import { logError, logInfo } from "../utils/logger.js";

export async function create({
  day,
  startTime,
  endTime,
  serviceId,
  providerId,
}) {
  try {
    const slot = await createSlot({
      day,
      startTime,
      endTime,
      serviceId,
      providerId,
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

export async function update(slotId, data, providerId) {
  try {
    const slot = await updateSlot(slotId, { ...data, providerId });
    logInfo("Slot updated", slot.id);
    return slot;
  } catch (err) {
    logError("Slot update failed", err);
    throw new Error("Unable to update slot");
  }
}

export async function remove(slotId, providerId) {
  try {
    const deleted = await deleteSlot(slotId, providerId);
    logInfo("Slot deleted", deleted.id);
    return deleted;
  } catch (err) {
    logError("Slot deletion failed", err);
    throw new Error("error occurred while trying to delete slot");
  }
}

export async function search(filters) {
  try {
    return await searchAvailableSlots(filters);
  } catch (err) {
    logError("Failed to search available slots", err);
    throw new Error("Unable to fetch available slots");
  }
}