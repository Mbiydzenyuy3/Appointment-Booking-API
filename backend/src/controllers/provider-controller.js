// src/controllers/provider-controller.js
import ProviderModel from "../models/provider-model.js";
import { logError, logDebug } from "../utils/logger.js";

export async function createProvider(req, res, next) {
  try {
    logDebug("createProvider: called");

    const { bio, rating } = req.body;
    const user_id = req.user?.user_id;

    logDebug("createProvider: extracted from req", {
      bio,
      rating,
      user_id,
      fullUser: req.user,
    });

    if (!user_id) {
      logError("createProvider: Missing user ID");
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user ID missing in request",
      });
    }

    const existing = await ProviderModel.findByUserId(user_id);
    logDebug("createProvider: existing provider check", { exists: !!existing });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Provider profile already exists",
      });
    }

    const newProvider = await ProviderModel.create({
      user_id,
      bio,
      rating,
    });

    logDebug("createProvider: new provider created", newProvider);

    return res.status(201).json({
      success: true,
      message: "Provider profile created successfully",
      data: newProvider,
    });
  } catch (err) {
    logError("createProvider: unexpected error", err);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }

    next(err);
  }
}

export async function updateProvider(req, res, next) {
  try {
    logDebug("updateProvider: called");

    const { bio, rating } = req.body;
    const user_id = req.user?.user_id; // fixed from `id`

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user ID missing in request",
      });
    }

    const existing = await ProviderModel.findByUserId(user_id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    const updated = await ProviderModel.updateByUserId(user_id, {
      bio,
      rating,
    });

    return res.json({
      success: true,
      message: "Provider profile updated successfully",
      data: updated,
    });
  } catch (err) {
    logError("updateProvider: unexpected error", err);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
    next(err);
  }
}

export async function getCurrentProvider(req, res, next) {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const provider = await ProviderModel.findByUserId(user_id);
    if (!provider) {
      return res
        .status(404)
        .json({ success: false, message: "Provider profile not found" });
    }

    return res.json({ success: true, data: provider });
  } catch (err) {
    logError("getCurrentProvider error", err);
    next(err);
  }
}

export async function getAllProviders(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const providers = await ProviderModel.listAll({ limit, offset });

    return res.json({
      success: true,
      data: providers,
      meta:
        total !== undefined
          ? {
              total,
              limit,
              offset,
              totalPages: Math.ceil(total / limit),
            }
          : undefined,
    });
  } catch (err) {
    logError("getAllProviders error", err);
    next(err);
  }
}
