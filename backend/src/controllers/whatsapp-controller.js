// src/controllers/whatsapp-controller.js
import {
  broadcastAvailableSlots,
  sendBookingConfirmation,
  sendProviderNotification
} from "../services/whatsapp-service.js";
import { logError, logInfo } from "../utils/logger.js";

export async function broadcastSlots(req, res, next) {
  try {
    const { slots } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Slots array is required" });
    }

    // Get provider ID from user
    const { query } = await import("../config/db.js");
    const { rows } = await query(
      "SELECT provider_id FROM providers WHERE user_id = $1",
      [user_id]
    );
    if (!rows[0]) {
      return res
        .status(404)
        .json({ success: false, message: "Provider profile not found" });
    }

    const providerId = rows[0].provider_id;

    const result = await broadcastAvailableSlots(providerId, slots);

    if (result.success) {
      return res.json({
        success: true,
        message: `Broadcast sent to ${result.sent} out of ${result.total} contacts`,
        data: result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send broadcast",
        error: result.error
      });
    }
  } catch (err) {
    logError("broadcastSlots error", err);
    next(err);
  }
}

export async function sendConfirmation(req, res, next) {
  try {
    const { client_phone, appointment_details } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!client_phone || !appointment_details) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Client phone and appointment details are required"
        });
    }

    // Get provider ID from user
    const { query } = await import("../config/db.js");
    const { rows } = await query(
      "SELECT provider_id FROM providers WHERE user_id = $1",
      [user_id]
    );
    if (!rows[0]) {
      return res
        .status(404)
        .json({ success: false, message: "Provider profile not found" });
    }

    const providerId = rows[0].provider_id;

    const result = await sendBookingConfirmation(
      providerId,
      client_phone,
      appointment_details
    );

    if (result.success) {
      return res.json({
        success: true,
        message: "Confirmation sent successfully",
        data: result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send confirmation",
        error: result.error
      });
    }
  } catch (err) {
    logError("sendConfirmation error", err);
    next(err);
  }
}

export async function notifyProvider(req, res, next) {
  try {
    const { provider_phone, client_name, appointment_details } = req.body;

    if (!provider_phone || !client_name || !appointment_details) {
      return res.status(400).json({
        success: false,
        message:
          "Provider phone, client name, and appointment details are required"
      });
    }

    const result = await sendProviderNotification(
      provider_phone,
      client_name,
      appointment_details
    );

    if (result.success) {
      return res.json({
        success: true,
        message: "Provider notification sent successfully",
        data: result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send provider notification",
        error: result.error
      });
    }
  } catch (err) {
    logError("notifyProvider error", err);
    next(err);
  }
}
