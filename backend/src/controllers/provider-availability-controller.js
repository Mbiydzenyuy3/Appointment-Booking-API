import * as ProviderAvailabilityService from "../services/provider-availability-service.js";
import { logError } from "../utils/logger.js";

export async function create(req, res, next) {
  try {
    const providerId = req.user.provider_id;
    const { dayOfWeek, startTime, endTime } = req.body;
    const availability = await ProviderAvailabilityService.createAvailability({
      providerId,
      dayOfWeek,
      startTime,
      endTime,
    });
    res.status(201).json({ success: true, data: availability });
  } catch (err) {
    logError("Error creating provider availability", err);
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const providerId = req.params.providerId;
    const availabilities =
      await ProviderAvailabilityService.getAvailabilityByProvider(providerId);
    res.status(200).json({ success: true, data: availabilities });
  } catch (err) {
    logError("Error listing provider availability", err);
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const id = req.params.id;
    const { dayOfWeek, startTime, endTime } = req.body;
    const availability = await ProviderAvailabilityService.updateAvailability(
      id,
      {
        dayOfWeek,
        startTime,
        endTime,
      }
    );
    res.status(200).json({ success: true, data: availability });
  } catch (err) {
    logError("Error updating provider availability", err);
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const id = req.params.id;
    await ProviderAvailabilityService.deleteAvailability(id);
    res.status(204).send();
  } catch (err) {
    logError("Error deleting provider availability", err);
    next(err);
  }
}
