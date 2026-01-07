// src/controllers/provider-controller.js
import ProviderModel from "../models/provider-model.js";
import {
  getProviderByBookingSlug,
  getProviderReferralCode,
  processReferral,
  updateProviderActivity,
  updateProviderCredibility,
  getTopProviders
} from "../services/provider-service.js";
import { logError, logDebug } from "../utils/logger.js";

export async function createProvider(req, res, next) {
  try {
    logDebug("createProvider: called");

    const {
      bio,
      rating,
      referral_code,
      certifications,
      business_photos,
      testimonials,
      years_of_experience
    } = req.body;
    const user_id = req.user?.user_id;

    logDebug("createProvider: extracted from req", {
      bio,
      rating,
      referral_code,
      user_id,
      fullUser: req.user
    });

    if (!user_id) {
      logError("createProvider: Missing user ID");
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user ID missing in request"
      });
    }

    const existing = await ProviderModel.findByUserId(user_id);
    logDebug("createProvider: existing provider check", { exists: !!existing });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Provider profile already exists"
      });
    }

    const newProvider = await ProviderModel.create({
      user_id,
      bio,
      rating,
      certifications,
      business_photos,
      testimonials,
      years_of_experience
    });

    // Process referral code if provided
    if (referral_code) {
      try {
        await processReferral(referral_code, newProvider.provider_id);
        logDebug("Referral code processed for new provider", {
          provider_id: newProvider.provider_id
        });
      } catch (referralError) {
        logError("Failed to process referral code", referralError);
        // Don't fail provider creation if referral processing fails
      }
    }

    logDebug("createProvider: new provider created", newProvider);

    return res.status(201).json({
      success: true,
      message: "Provider profile created successfully",
      data: {
        ...newProvider,
        booking_link: `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/book/${newProvider.booking_slug}`,
        referral_code: newProvider.referral_code
      }
    });
  } catch (err) {
    logError("createProvider: unexpected error", err);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }

    next(err);
  }
}

export async function updateProvider(req, res, next) {
  try {
    logDebug("updateProvider: called");

    const {
      bio,
      rating,
      certifications,
      business_photos,
      testimonials,
      years_of_experience
    } = req.body;
    const user_id = req.user?.user_id; // fixed from `id`

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user ID missing in request"
      });
    }

    const existing = await ProviderModel.findByUserId(user_id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found"
      });
    }

    const updated = await ProviderModel.updateByUserId(user_id, {
      bio,
      rating,
      certifications,
      business_photos,
      testimonials,
      years_of_experience
    });

    return res.json({
      success: true,
      message: "Provider profile updated successfully",
      data: updated
    });
  } catch (err) {
    logError("updateProvider: unexpected error", err);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Internal server error"
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
              totalPages: Math.ceil(total / limit)
            }
          : undefined
    });
  } catch (err) {
    logError("getAllProviders error", err);
    next(err);
  }
}

export async function getTopProvidersController(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const providers = await getTopProviders(limit);

    return res.json({
      success: true,
      data: providers
    });
  } catch (err) {
    logError("getTopProviders error", err);
    next(err);
  }
}

export async function getBookingLink(req, res, next) {
  try {
    const { providerId } = req.params;

    // Verify provider exists
    const provider = await ProviderModel.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found"
      });
    }

    // Generate personal booking link using booking slug
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const bookingLink = `${baseUrl}/book/${provider.booking_slug}`;

    return res.json({
      success: true,
      data: {
        booking_link: bookingLink,
        booking_slug: provider.booking_slug,
        provider_name: provider.name || "Provider",
        provider_id: providerId
      }
    });
  } catch (err) {
    logError("getBookingLink error", err);
    next(err);
  }
}

export async function getProviderBySlug(req, res, next) {
  try {
    const { bookingSlug } = req.params;
    const provider = await getProviderByBookingSlug(bookingSlug);

    return res.json({
      success: true,
      data: provider
    });
  } catch (err) {
    logError("getProviderBySlug error", err);
    if (err.message === "Provider not found") {
      return res.status(404).json({
        success: false,
        message: "Provider not found"
      });
    }
    next(err);
  }
}

export async function getProviderProfile(req, res, next) {
  try {
    const { bookingSlug } = req.params;

    // Get provider details
    const provider = await getProviderByBookingSlug(bookingSlug);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found"
      });
    }

    // Get provider's services
    const { query } = await import("../config/db.js");
    const servicesQuery = await query(
      `
      SELECT s.*, COUNT(ts.timeslot_id) as available_slots
      FROM services s
      LEFT JOIN time_slots ts ON s.service_id = ts.service_id
        AND ts.is_available = true
        AND ts.day >= CURRENT_DATE
      WHERE s.provider_id = $1
      GROUP BY s.service_id
      ORDER BY s.name
      `,
      [provider.provider_id]
    );

    // Get recent reviews
    const reviewsQuery = await query(
      `
      SELECT r.*, u.name as reviewer_name
      FROM provider_reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.provider_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
      `,
      [provider.provider_id]
    );

    // Update profile view count
    await query(
      "UPDATE providers SET profile_views = profile_views + 1, last_profile_view = CURRENT_TIMESTAMP WHERE provider_id = $1",
      [provider.provider_id]
    );

    return res.json({
      success: true,
      data: {
        ...provider,
        services: servicesQuery.rows,
        reviews: reviewsQuery.rows,
        profile_views: provider.profile_views + 1
      }
    });
  } catch (err) {
    logError("getProviderProfile error", err);
    next(err);
  }
}

export async function getReferralCode(req, res, next) {
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

    const referralData = await getProviderReferralCode(provider.provider_id);

    return res.json({
      success: true,
      data: referralData
    });
  } catch (err) {
    logError("getReferralCode error", err);
    next(err);
  }
}

export async function useReferralCode(req, res, next) {
  try {
    const { referral_code } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!referral_code) {
      return res
        .status(400)
        .json({ success: false, message: "Referral code is required" });
    }

    const provider = await ProviderModel.findByUserId(user_id);
    if (!provider) {
      return res
        .status(404)
        .json({ success: false, message: "Provider profile not found" });
    }

    const result = await processReferral(referral_code, provider.provider_id);

    return res.json({
      success: true,
      message: "Referral code applied successfully",
      data: result
    });
  } catch (err) {
    logError("useReferralCode error", err);
    if (err.message === "Invalid referral code") {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
}

export async function logProviderActivity(req, res, next) {
  try {
    const { activity_type, activity_data } = req.body;
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

    await updateProviderActivity(
      provider.provider_id,
      activity_type,
      activity_data
    );

    return res.json({
      success: true,
      message: "Activity logged successfully"
    });
  } catch (err) {
    logError("logProviderActivity error", err);
    next(err);
  }
}

export async function updateCredibilityMetrics(req, res, next) {
  try {
    const metrics = req.body;
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

    await updateProviderCredibility(provider.provider_id, metrics);

    return res.json({
      success: true,
      message: "Credibility metrics updated successfully"
    });
  } catch (err) {
    logError("updateCredibilityMetrics error", err);
    next(err);
  }
}

export async function addReview(req, res, next) {
  try {
    const { provider_id, rating, review_text } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!provider_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "Provider ID and rating are required"
      });
    }

    const review = await ProviderModel.addReview({
      provider_id,
      user_id,
      rating,
      review_text
    });

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review
    });
  } catch (err) {
    logError("addReview error", err);
    next(err);
  }
}

export async function getReviews(req, res, next) {
  try {
    const { providerId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const reviews = await ProviderModel.getReviewsByProvider(providerId, {
      limit,
      offset
    });

    return res.json({
      success: true,
      data: reviews
    });
  } catch (err) {
    logError("getReviews error", err);
    next(err);
  }
}

export async function updateReview(req, res, next) {
  try {
    const { review_id } = req.params;
    const { rating, review_text } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const updatedReview = await ProviderModel.updateReview(review_id, user_id, {
      rating,
      review_text
    });

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found or not authorized"
      });
    }

    return res.json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview
    });
  } catch (err) {
    logError("updateReview error", err);
    next(err);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const { review_id } = req.params;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const deletedReview = await ProviderModel.deleteReview(review_id, user_id);

    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found or not authorized"
      });
    }

    return res.json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (err) {
    logError("deleteReview error", err);
    next(err);
  }
}
