// src/controllers/slot-controller.js
import * as SlotService from "../services/slot-service.js";
import { logError } from "../utils/logger.js";

export async function create(req, res, next) {
  try {
    const { day, startTime, endTime, serviceId } = req.body;
    const providerId = req.user?.provider_id;

    const slot = await SlotService.create({
      day,
      startTime,
      endTime,
      serviceId,
      providerId,
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
    // if (req.user.provider_id === providerId) return res.status(200).json();

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

export async function update(req, res, next) {
  try {
    const providerId = req.user?.provider_id;
    const slotId = req.params.slotId;
    const updated = await SlotService.update(slotId, req.body, providerId);

    return res.json({ success: true, message: "Slot updated", data: updated });
  } catch (err) {
    if (err.message === "Slot overlaps with an existing slot") {
      return res.status(409).json({
        success: false,
        message: err.message,
      });
    }
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const providerId = req.user?.provider_id;
    const slotId = req.params.slotId;
    const deleted = await SlotService.remove(slotId, providerId);

    return res.json({ success: true, message: "Slot deleted", data: deleted });
  } catch (err) {
    logError("Slot deletion error", err);
    next(err);
  }
}

export async function search(req, res, next) {
  try {
    const filters = {
      providerId: req.query.providerId,
      serviceId: req.query.serviceId,
      day: req.query.day, // expected as 'YYYY-MM-DD'
      limit: parseInt(req.query.limit, 10) || 10,
      offset: parseInt(req.query.offset, 10) || 0,
    };

    const slots = await SlotService.search(filters);

    return res.status(200).json({
      success: true,
      message: "Available slots fetched successfully",
      data: slots,
    });
  } catch (err) {
    logError("Error searching slots", err);
    next(err);
  }
}
