
// src/controllers/provider-controller.js

// src/controllers/provider-controller.js
import ProviderModel from "../models/provider-model.js";
import { logError, logDebug } from "../utils/logger.js";

export async function createProvider(req, res, next) {
  try {
    logDebug("createProvider: called");

    const { bio, rating } = req.body;
    const user_id = req.user?.id; // Make sure you're using `id` not `user_id`

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

export const getAllProviders = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM providers");
    return res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching providers" });
  }
};
