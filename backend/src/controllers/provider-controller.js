// src/controllers/provider-controller.js
import ProviderModel from "../models/provider-model.js";
import ReviewModel from "../models/review-model.js";
import {
  updateProviderRating,
  updateCredibilityMetrics as updateMetrics
} from "../models/provider-metrics-model.js";
import {
  logProviderActivity,
  getProviderActivities
} from "../models/provider-activity-model.js";

import {
  getProviderByBookingSlug,
  listProviders
} from "../services/provider-service.js";

import { generateReferralCode } from "../utils/referral.js";
import { logError } from "../utils/logger.js";
import { query } from "../config/db.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "https://yourdomain.com";

/* ============================================================
   PROVIDER PROFILE
   ============================================================ */

export async function createProvider(req, res, next) {
  try {
    const user_id = req.user?.user_id;
    const user_type = req.user?.user_type;
    const { bio = "", phone = null, hourly_rate = null } = req.body;

    if (!user_id)
      return res
        .status(401)
        .json({ success: false, error_code: "UNAUTHORIZED" });
    if (user_type !== "provider")
      return res.status(403).json({
        success: false,
        error_code: "FORBIDDEN",
        message: "Only provider users can create business profiles."
      });

    const existing = await ProviderModel.findByUserId(user_id);
    if (existing)
      return res.status(409).json({
        success: false,
        error_code: "PROVIDER_ALREADY_EXISTS",
        message: "Business profile already exists."
      });

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
        booking_link: `${FRONTEND_URL}/provider/${provider.booking_slug}`
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
    if (!user_id)
      return res
        .status(401)
        .json({ success: false, error_code: "UNAUTHORIZED" });

    const provider = await ProviderModel.findByUserId(user_id);
    if (!provider)
      return res
        .status(404)
        .json({ success: false, error_code: "PROVIDER_NOT_FOUND" });

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
    const user_type = req.user?.user_type;
    if (!user_id)
      return res
        .status(401)
        .json({ success: false, error_code: "UNAUTHORIZED" });

    let provider = await ProviderModel.findByUserId(user_id);
    if (!provider) {
      // If provider doesn't exist but user is a provider, create it
      if (user_type === "provider") {
        provider = await ProviderModel.create({
          user_id,
          bio: "",
          phone: null,
          hourly_rate: null,
          referral_code: generateReferralCode()
        });
        await logProviderActivity(provider.provider_id, "provider_created");
      } else {
        return res.status(404).json({
          success: false,
          error_code: "PROVIDER_NOT_FOUND",
          message: "Business profile not found."
        });
      }
    }

    res.json({ success: true, data: provider });
  } catch (err) {
    logError("Get current provider failed", err);
    next(err);
  }
}

export async function deleteProvider(req, res, next) {
  try {
    const user_id = req.user?.user_id;
    if (!user_id)
      return res
        .status(401)
        .json({ success: false, error_code: "UNAUTHORIZED" });

    const provider = await ProviderModel.findByUserId(user_id);
    if (!provider)
      return res
        .status(404)
        .json({ success: false, error_code: "PROVIDER_NOT_FOUND" });

    await ProviderModel.deleteById(provider.provider_id);
    await logProviderActivity(provider.provider_id, "provider_deleted");

    res.json({
      success: true,
      message: "Provider account deleted successfully."
    });
  } catch (err) {
    logError("Delete provider failed", err);
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

    res.json({ success: true, data: { ...provider, services } });
  } catch (err) {
    logError("Get provider profile failed", err);
    next(err);
  }
}

export async function getBookingLink(req, res, next) {
  try {
    const { providerId } = req.params;
    const provider = await ProviderModel.findById(providerId);
    if (!provider)
      return res.status(404).json({
        success: false,
        error_code: "PROVIDER_NOT_FOUND",
        message: "Provider not found."
      });

    const bookingLink = `${FRONTEND_URL}/provider/${provider.booking_slug}`;
    res.json({
      success: true,
      data: {
        provider_id: provider.provider_id,
        provider_name: provider.name || "Business",
        booking_slug: provider.booking_slug,
        booking_link: bookingLink
      }
    });
  } catch (err) {
    logError("Get booking link failed", err);
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

    if (!provider_id || !booking_id || rating == null)
      return res
        .status(400)
        .json({ success: false, error_code: "INVALID_INPUT" });
    if (rating < 1 || rating > 5)
      return res.status(400).json({
        success: false,
        error_code: "INVALID_RATING",
        message: "Rating must be between 1 and 5."
      });

    const booking = await query(
      `
      SELECT appointment_id
      FROM appointments
      WHERE appointment_id = $1 AND user_id = $2 AND status = 'completed'
    `,
      [booking_id, reviewer_user_id]
    );

    if (!booking.rowCount)
      return res
        .status(403)
        .json({ success: false, error_code: "REVIEW_NOT_ALLOWED" });

    const existingReview = await ReviewModel.findByBooking(booking_id);
    if (existingReview)
      return res
        .status(409)
        .json({ success: false, error_code: "REVIEW_ALREADY_EXISTS" });

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
    logError("Get reviews failed", err);
    next(err);
  }
}

export async function updateReview(req, res, next) {
  try {
    const { review_id, rating, comment } = req.body;
    if (!review_id || rating == null)
      return res
        .status(400)
        .json({ success: false, error_code: "INVALID_INPUT" });

    const review = await ReviewModel.findById(review_id);
    if (!review)
      return res
        .status(404)
        .json({ success: false, error_code: "REVIEW_NOT_FOUND" });

    review.rating = rating;
    review.comment = comment;
    await review.save();

    await updateProviderRating(review.provider_id);
    await logProviderActivity(review.provider_id, "review_updated", { rating });

    res.json({ success: true, data: review });
  } catch (err) {
    logError("Update review failed", err);
    next(err);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const { review_id } = req.params;
    if (!review_id)
      return res
        .status(400)
        .json({ success: false, error_code: "INVALID_INPUT" });

    const review = await ReviewModel.findById(review_id);
    if (!review)
      return res
        .status(404)
        .json({ success: false, error_code: "REVIEW_NOT_FOUND" });

    await review.remove();
    await updateProviderRating(review.provider_id);
    await logProviderActivity(review.provider_id, "review_deleted");

    res.json({ success: true, message: "Review deleted successfully." });
  } catch (err) {
    logError("Delete review failed", err);
    next(err);
  }
}

/* ============================================================
   CREDIBILITY METRICS
   ============================================================ */

export async function updateCredibilityMetrics(req, res, next) {
  try {
    const { provider_id, metrics } = req.body;
    if (!provider_id || !metrics)
      return res
        .status(400)
        .json({ success: false, error_code: "INVALID_INPUT" });

    await updateMetrics(provider_id, metrics);
    await logProviderActivity(provider_id, "metrics_updated", metrics);

    res.json({
      success: true,
      message: "Provider metrics updated successfully."
    });
  } catch (err) {
    logError("Update credibility metrics failed", err);
    next(err);
  }
}

/* ============================================================
   ACTIVITY LOG
   ============================================================ */

export async function logActivity(req, res, next) {
  try {
    const { provider_id } = req.params;
    if (!provider_id)
      return res
        .status(400)
        .json({ success: false, error_code: "INVALID_INPUT" });

    const activities = await getProviderActivities(provider_id);
    res.json({ success: true, data: activities });
  } catch (err) {
    logError("Get provider activity failed", err);
    next(err);
  }
}

/* ============================================================
   REFERRAL CODES
   ============================================================ */

export async function getReferralCode(req, res, next) {
  try {
    const { user_id } = req.params;
    const provider = await ProviderModel.findByUserId(user_id);
    if (!provider)
      return res
        .status(404)
        .json({ success: false, error_code: "PROVIDER_NOT_FOUND" });

    if (!provider.referral_code) {
      provider.referral_code = generateReferralCode();
      await ProviderModel.updateByUserId(user_id, {
        referral_code: provider.referral_code
      });
    }

    res.json({
      success: true,
      data: { referral_code: provider.referral_code }
    });
  } catch (err) {
    logError("Get referral code failed", err);
    next(err);
  }
}

export async function useReferralCode(req, res, next) {
  try {
    const { referral_code, user_id } = req.body;
    if (!referral_code || !user_id)
      return res
        .status(400)
        .json({ success: false, error_code: "INVALID_INPUT" });

    // Example: mark referral code as used
    const provider = await ProviderModel.findByReferralCode(referral_code);
    if (!provider)
      return res
        .status(404)
        .json({ success: false, error_code: "REFERRAL_NOT_FOUND" });

    await ProviderModel.markReferralUsed(user_id, referral_code);
    await logProviderActivity(provider.provider_id, "referral_used", {
      used_by: user_id
    });

    res.json({ success: true, message: "Referral code used successfully." });
  } catch (err) {
    logError("Use referral code failed", err);
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
    res.json({ success: true, data: providers, pagination: { limit, offset } });
  } catch (err) {
    logError("Get all providers failed", err);
    next(err);
  }
}
