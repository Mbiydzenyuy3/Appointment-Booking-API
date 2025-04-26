//controller/slot-controller.js

import * as SlotService from "../services/slot-service.js";

export async function create(req, res, next) {
  try {
    const providerId = res.user.sub;
    const { startTime, endTime } = req.body;
    const slot = await SlotService.createSlot({
      providerId,
      startTime,
      endTime,
    });
    res.status(201).json(slot);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { providerId } = req.params;
    const slots = await SlotService.getSlotsByProvider(providerId);
    res.json(slots);
  } catch (err) {
    next(err);
  }
}
