// src/controllers/service-controller.js
import * as ServiceService from "../services/services-service.js";
import { logError, logDebug } from "../utils/logger.js";
import ProviderModel from "../models/provider-model.js";

export async function create(req, res, next) {
  try {
    const userId = req.user?.id;
    const { name, description, price, durationMinutes } = req.body;

    if (!userId || !name || !description || !price || !durationMinutes) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔍 Look up provider_id from providers table
    const provider = await ProviderModel.findByUserId(userId);

    if (!provider || !provider.provider_id) {
      return res
        .status(403)
        .json({ message: "You must have a provider profile first." });
    }

    const providerId = provider.provider_id;

    logDebug("createService: input", {
      providerId,
      name,
      description,
      price,
      durationMinutes,
    });

    const service = await ServiceService.createService({
      providerId,
      name,
      description,
      price,
      durationMinutes,
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (err) {
    logError("createService controller error", err);
    next(err);
  }
}
