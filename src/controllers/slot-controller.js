import * as SlotService from "../services/slot-service.js";
import { logError } from "../utils/logger.js";

export async function create(req, res, next) {
  try {
    const providerId = req.user.id;
    const { day, startTime, endTime, serviceId } = req.body;

    const slot = await SlotService.create({
      providerId,
      day,
      startTime,
      endTime,
      serviceId,
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

export async function list(req, res, next) {
  try {
    const { providerId } = req.params;
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
