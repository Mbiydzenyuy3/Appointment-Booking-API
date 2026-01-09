// src/services/slot-service.js
import {
  createSlot,
  getSlotsByProviderId,
  getSlotById,
  searchAvailableSlots,
  updateSlot,
  deleteSlot,
  advanceSlots
} from "../models/slot-model.js";

import { logError, logInfo } from "../utils/logger.js";

export async function create({
  day,
  startTime,
  endTime,
  serviceId,
  providerId
}) {
  try {
    console.log("Slot service create called with:", {
      day,
      startTime,
      endTime,
      serviceId,
      providerId
    });
    const slot = await createSlot({
      day,
      startTime,
      endTime,
      serviceId,
      providerId
    });

    logInfo("Slot created", slot.timeslot_id);
    return slot;
  } catch (err) {
    console.log("Slot service create error:", err);
    logError("Slot service failed to create slot", err);
    console.error("Detailed slot creation error:", err.message);
    throw new Error(
      "We're having trouble scheduling this slot right now. Please try again."
    );
  }
}

export async function getSlotsByProvider(providerId) {
  try {
    return await getSlotsByProviderId(providerId);
  } catch (err) {
    logError("Failed to fetch provider's slots", err);
    throw new Error(
      "We're having trouble loading your available slots. Please refresh and try again."
    );
  }
}

export async function get(slotId) {
  try {
    const slot = await getSlotById(slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }
    return slot;
  } catch (err) {
    logError("Failed to fetch slot", err);
    throw new Error(
      "We're having trouble loading this slot. Please try again."
    );
  }
}

export async function update(slotId, data, providerId) {
  try {
    const slot = await updateSlot(slotId, { ...data, providerId });
    logInfo("Slot updated", slot.timeslot_id);
    return slot;
  } catch (err) {
    logError("Slot update failed", err);
    throw new Error(
      "We're having trouble updating this slot. Please try again."
    );
  }
}

export async function remove(slotId, providerId) {
  try {
    const deleted = await deleteSlot(slotId, providerId);
    logInfo("Slot deleted", deleted.timeslot_id);
    return deleted;
  } catch (err) {
    logError("Slot deletion failed", err);
    throw new Error(
      "We're having trouble deleting this slot. Please try again."
    );
  }
}

export async function search(filters) {
  try {
    return await searchAvailableSlots(filters);
  } catch (err) {
    logError("Failed to search available slots", err);
    throw new Error(
      "We're having trouble finding available slots. Please try again."
    );
  }
}

export async function advanceSlotsService() {
  try {
    const result = await advanceSlots();
    logInfo(`Advanced ${result.updated} slots`);
    return result;
  } catch (err) {
    logError("Failed to advance slots", err);
    throw new Error(
      "We're having trouble updating slot availability. Please try again later."
    );
  }
}
