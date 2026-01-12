// src/controllers/slot-controller.js
import * as SlotService from "../services/slot-service.js";
import { logError } from "../utils/logger.js";
import { query } from "../config/db.js";

export async function create(req, res, next) {
  try {
    const { day, startTime, endTime, serviceId } = req.body;
    const userId = req.user?.sub;

    if (!day || !startTime || !endTime || !serviceId) {
      return res.status(400).json({
        success: false,
        message: "Please provide date, start time, end time, and service."
      });
    }

    // Get provider_id from user
    let providerResult = await query(
      "SELECT provider_id FROM providers WHERE user_id = $1",
      [userId]
    );
    let providerId;
    if (providerResult.rowCount === 0) {
      // If user is a provider but profile doesn't exist, create it
      if (req.user.user_type === "provider") {
        try {
          const ProviderModel = (await import("../models/provider-model.js"))
            .default;
          const provider = await ProviderModel.create({
            user_id: userId,
            bio: ""
          });
          providerId = provider.provider_id;
        } catch (createError) {
          logError(
            "Error creating provider profile during slot creation:",
            createError
          );
          return res.status(500).json({
            success: false,
            message: "Failed to create provider profile. Please try again."
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: "Please create a business profile first."
        });
      }
    } else {
      providerId = providerResult.rows[0].provider_id;
    }

    // Verify service belongs to provider
    const serviceCheck = await query(
      "SELECT 1 FROM services WHERE service_id = $1 AND provider_id = $2",
      [serviceId, providerId]
    );
    if (serviceCheck.rowCount === 0) {
      return res.status(403).json({
        success: false,
        message: "You can only create time slots for your own services."
      });
    }

    const slot = await SlotService.create({
      day,
      startTime,
      endTime,
      serviceId,
      providerId
    });

    return res.status(201).json({
      success: true,
      message: "Your availability has been added successfully!",
      data: slot
    });
  } catch (err) {
    logError("Error creating time slot", err);
    if (err.message.includes("overlap")) {
      return res.status(409).json({
        success: false,
        message: "This time slot overlaps with an existing one."
      });
    }
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { providerId } = req.params;

    const slots = await SlotService.getSlotsByProvider(providerId);

    return res.status(200).json({
      success: true,
      data: slots
    });
  } catch (err) {
    logError("Error fetching time slots", err);
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const userId = req.user?.user_id;
    const slotId = req.params.slotId;

    // Get provider_id
    let providerResult = await query(
      "SELECT provider_id FROM providers WHERE user_id = $1",
      [userId]
    );
    let providerId;
    if (providerResult.rowCount === 0) {
      // If user is a provider but profile doesn't exist, create it
      if (req.user.user_type === "provider") {
        try {
          const ProviderModel = (await import("../models/provider-model.js"))
            .default;
          const provider = await ProviderModel.create({
            user_id: userId,
            bio: ""
          });
          providerId = provider.provider_id;
        } catch (createError) {
          logError(
            "Error creating provider profile during slot update:",
            createError
          );
          return res.status(500).json({
            success: false,
            message: "Failed to create provider profile. Please try again."
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: "Please create a business profile first."
        });
      }
    } else {
      providerId = providerResult.rows[0].provider_id;
    }

    const updated = await SlotService.update(slotId, req.body, providerId);

    return res.json({
      success: true,
      message: "Your availability has been updated successfully!",
      data: updated
    });
  } catch (err) {
    if (err.message === "Slot overlaps with an existing slot") {
      return res.status(409).json({
        success: false,
        message: "This time slot overlaps with an existing one."
      });
    }
    logError("Error updating time slot", err);
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const userId = req.user?.user_id;
    const slotId = req.params.slotId;

    // Get provider_id
    let providerResult = await query(
      "SELECT provider_id FROM providers WHERE user_id = $1",
      [userId]
    );
    let providerId;
    if (providerResult.rowCount === 0) {
      // If user is a provider but profile doesn't exist, create it
      if (req.user.user_type === "provider") {
        try {
          const ProviderModel = (await import("../models/provider-model.js"))
            .default;
          const provider = await ProviderModel.create({
            user_id: userId,
            bio: ""
          });
          providerId = provider.provider_id;
        } catch (createError) {
          logError(
            "Error creating provider profile during slot delete:",
            createError
          );
          return res.status(500).json({
            success: false,
            message: "Failed to create provider profile. Please try again."
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: "Please create a business profile first."
        });
      }
    } else {
      providerId = providerResult.rows[0].provider_id;
    }

    const deleted = await SlotService.remove(slotId, providerId);

    return res.json({
      success: true,
      message: "Your availability has been deleted successfully.",
      data: deleted
    });
  } catch (err) {
    logError("Error deleting time slot", err);
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const { slotId } = req.params;
    const slot = await SlotService.get(slotId);

    return res.status(200).json({
      success: true,
      data: slot
    });
  } catch (err) {
    if (err.message === "Slot not found") {
      return res.status(404).json({
        success: false,
        message: "Time slot not found."
      });
    }
    logError("Error fetching time slot", err);
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
      offset: parseInt(req.query.offset, 10) || 0
    };

    const slots = await SlotService.search(filters);

    return res.status(200).json({
      success: true,
      data: slots
    });
  } catch (err) {
    logError("Error searching time slots", err);
    next(err);
  }
}
