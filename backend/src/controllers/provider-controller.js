// src/controllers/provider-controller.js
import ProviderModel from "../models/provider-model.js";
import ReviewModel from "../models/review-model.js";
import { updateProviderRating } from "../models/provider-metrics-model.js";
import { logProviderActivity } from "../models/provider-activity-model.js";

import {
  getProviderByBookingSlug,
  listProviders
} from "../services/provider-service.js";

import { generateReferralCode } from "../utils/referral.js";
import { logError } from "../utils/logger.js";
import { query } from "../config/db.js";

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "https://appointment-booking-api-1-7zro.onrender.com";

/* ============================================================
   PROVIDER PROFILE
   ============================================================ */

export async function createProvider(req, res, next) {
  try {
    const user_id = req.user?.user_id;
    const user_type = req.user?.user_type;
    const { bio = "", phone = null, hourly_rate = null } = req.body;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error_code: "UNAUTHORIZED"
      });
    }

    if (user_type !== "provider") {
      return res.status(403).json({
        success: false,
        error_code: "FORBIDDEN",
        message: "Only provider users can create business profiles."
      });
    }

    const existing = await ProviderModel.findByUserId(user_id);
    if (existing) {
      return res.status(409).json({
        success: false,
        error_code: "PROVIDER_ALREADY_EXISTS",
        message: "Business profile already exists."
      });
    }

    const provider = await ProviderModel.create({
      user_id,
      bio,
      phone,
      hourly_rate,
      referral_code: generateReferralCode()
    });

    await logProviderActivity(provider.provider_id, "provider_created");

    res.status(201).json({
      success: true,
      data: {
        ...provider,
        booking_link: `${FRONTEND_URL}/book/${provider.booking_slug}`
      }
    });
  } catch (err) {
    logError("Create provider failed", err);
    next(err);
  }
}

export async function updateProvider(req, res, next) {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error_code: "UNAUTHORIZED"
      });
    }

    const provider = await ProviderModel.findByUserId(user_id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        error_code: "PROVIDER_NOT_FOUND"
      });
    }

    const updated = await ProviderModel.updateByUserId(user_id, req.body);

    await logProviderActivity(provider.provider_id, "provider_updated", {
      fields: Object.keys(req.body)
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    logError("Update provider failed", err);
    next(err);
  }
}

export async function getCurrentProvider(req, res, next) {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error_code: "UNAUTHORIZED"
      });
    }

    const provider = await ProviderModel.findByUserId(user_id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        error_code: "PROVIDER_NOT_FOUND",
        message: "Business profile not found."
      });
    }

    res.json({ success: true, data: provider });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   PUBLIC PROVIDER
   ============================================================ */

export async function getProviderProfile(req, res, next) {
  try {
    const provider = await getProviderByBookingSlug(req.params.bookingSlug);

    const { rows: services } = await query(
      `
      SELECT service_id, service_name, description, duration_minutes, price
      FROM services
      WHERE provider_id = $1
      ORDER BY service_name
      `,
      [provider.provider_id]
    );

    res.json({
      success: true,
      data: { ...provider, services }
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   REVIEWS
   ============================================================ */

export async function addReview(req, res, next) {
  try {
    const reviewer_user_id = req.user?.user_id;
    const { provider_id, booking_id, rating, comment } = req.body;

    if (!provider_id || !booking_id || rating == null) {
      return res.status(400).json({
        success: false,
        error_code: "INVALID_INPUT"
      });
    }

    // 🔒 Clamp rating defensively
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error_code: "INVALID_RATING",
        message: "Rating must be between 1 and 5."
      });
    }

    // 🔒 Verify booking ownership & completion
    const booking = await query(
      `
      SELECT booking_id
      FROM bookings
      WHERE booking_id = $1
        AND user_id = $2
        AND status = 'completed'
      `,
      [booking_id, reviewer_user_id]
    );

    if (!booking.rowCount) {
      return res.status(403).json({
        success: false,
        error_code: "REVIEW_NOT_ALLOWED"
      });
    }

    // 🔒 Prevent duplicate reviews
    const existingReview = await ReviewModel.findByBooking(booking_id);
    if (existingReview) {
      return res.status(409).json({
        success: false,
        error_code: "REVIEW_ALREADY_EXISTS"
      });
    }

    const review = await ReviewModel.create({
      provider_id,
      booking_id,
      reviewer_user_id,
      rating,
      comment
    });

    await updateProviderRating(provider_id);
    await logProviderActivity(provider_id, "review_added", { rating });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    logError("Add review failed", err);
    next(err);
  }
}

export async function getReviews(req, res, next) {
  try {
    const reviews = await ReviewModel.findByProvider(req.params.provider_id);
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   DISCOVERY
   ============================================================ */

export async function getAllProviders(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const providers = await listProviders({ limit, offset });

    res.json({
      success: true,
      data: providers,
      pagination: { limit, offset }
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================================
   STUB IMPLEMENTATIONS
   ============================================================ */

export async function getReferralCode(req, res, next) {
  res.status(501).json({
    success: false,
    message: "Referral code functionality not implemented yet"
  });
}

export async function useReferralCode(req, res, next) {
  res.status(501).json({
    success: false,
    message: "Use referral code functionality not implemented yet"
  });
}

export async function logActivity(req, res, next) {
  res.status(501).json({
    success: false,
    message: "Log provider activity functionality not implemented yet"
  });
}

export async function updateCredibilityMetrics(req, res, next) {
  res.status(501).json({
    success: false,
    message: "Update credibility metrics functionality not implemented yet"
  });
}

export async function updateReview(req, res, next) {
  res.status(501).json({
    success: false,
    message: "Update review functionality not implemented yet"
  });
}

export async function deleteReview(req, res, next) {
  res.status(501).json({
    success: false,
    message: "Delete review functionality not implemented yet"
  });
}

export async function getBookingLink(req, res, next) {
  res.status(501).json({
    success: false,
    message: "Get booking link functionality not implemented yet"
  });
}
