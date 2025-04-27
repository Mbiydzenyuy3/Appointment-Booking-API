//controller/slot-controller.js

import * as SlotService from "../services/slot-service.js";
import { logError } from "../utils/logger.js";

// Create a new slot
export async function create(req, res, next) {
  try {
    const providerId = req.user.id; 
    const { startTime, endTime } = req.body;
    const slot = await SlotService.createSlot({
      providerId,
      startTime,
      endTime,
    });
    return res.status(201).json({
      success: true,
      message: "Slot created successfully",
      data: slot,
    });
  } catch (err) {
    logError("Error creating slot", err);
    next(err);
  }
}

// List all slots for a given provider
export async function list(req, res, next) {
  try {
    const { providerId } = req.params; // Get providerId from route param
    const slots = await SlotService.getSlotsByProvider(providerId);
    return res.status(200).json({
      success: true,
      message: "Slots fetched successfully",
      data: slots,
    });
  } catch (err) {
    logError("Error fetching slots", err);
    next(err);
  }
}
