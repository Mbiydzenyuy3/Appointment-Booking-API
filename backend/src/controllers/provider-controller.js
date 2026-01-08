// src/controllers/provider-controller.js
import ProviderModel from "../models/provider-model.js";
import { getProviderByBookingSlug } from "../services/provider-service.js";
import { logError } from "../utils/logger.js";
import { query } from "../config/db.js";

export async function createProvider(req, res, next) {
  try {
    const { bio, phone } = req.body;
    const user_id = req.user?.sub;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Please log in to create a business profile."
      });
    }

    const existing = await ProviderModel.findByUserId(user_id);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You already have a business profile."
      });
    }

    const newProvider = await ProviderModel.create({
      user_id,
      bio: bio || "",
      phone: phone || ""
    });

    return res.status(201).json({
      success: true,
      message: "Your business profile has been created successfully!",
      data: {
        ...newProvider,
        booking_link: `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/book/${newProvider.booking_slug}`
      }
    });
  } catch (err) {
    logError("Error creating provider profile", err);
    next(err);
  }
}

export async function updateProvider(req, res, next) {
  try {
    const { bio, phone } = req.body;
    const user_id = req.user?.sub;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Please log in to update your profile."
      });
    }

    const existing = await ProviderModel.findByUserId(user_id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found."
      });
    }

    const updated = await ProviderModel.updateByUserId(user_id, {
      bio,
      phone
    });

    return res.json({
      success: true,
      message: "Your business profile has been updated successfully.",
      data: updated
    });
  } catch (err) {
    logError("Error updating provider profile", err);
    next(err);
  }
}

export async function getCurrentProvider(req, res, next) {
  try {
    const user_id = req.user?.sub;
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Please log in to view your profile."
      });
    }

    const provider = await ProviderModel.findByUserId(user_id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found."
      });
    }

    return res.json({ success: true, data: provider });
  } catch (err) {
    logError("Error getting current provider", err);
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
    logError("Error getting provider by slug", err);
    if (err.message === "Provider not found") {
      return res.status(404).json({
        success: false,
        message: "Business not found."
      });
    }
    next(err);
  }
}

export async function getProviderProfile(req, res, next) {
  try {
    const { bookingSlug } = req.params;

    // Get provider details - try booking_slug first, then provider_id if it's a UUID
    let provider;
    try {
      provider = await getProviderByBookingSlug(bookingSlug);
    } catch (err) {
      if (err.message === "Provider not found") {
        // Check if bookingSlug is a valid UUID (provider_id)
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(bookingSlug)) {
          provider = await ProviderModel.findById(bookingSlug);
        }
      } else {
        throw err;
      }
    }
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Business not found."
      });
    }

    // Get provider's services
    const servicesQuery = await query(
      `
      SELECT s.service_id, s.service_name, s.description, s.duration_minutes, s.price
      FROM services s
      WHERE s.provider_id = $1
      ORDER BY s.service_name
      `,
      [provider.provider_id]
    );

    return res.json({
      success: true,
      data: {
        ...provider,
        services: servicesQuery.rows
      }
    });
  } catch (err) {
    logError("Error getting provider profile", err);
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
        message: "Business not found."
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
        provider_name: provider.name || "Business",
        provider_id: providerId
      }
    });
  } catch (err) {
    logError("Error getting booking link", err);
    next(err);
  }
}

// Stub implementations for missing provider controller functions
export async function getAllProviders(req, res, next) {
  // TODO: Implement get all providers functionality
  res.status(501).json({
    success: false,
    message: "Get all providers functionality not implemented yet"
  });
}

export async function getTopProvidersController(req, res, next) {
  // TODO: Implement get top providers functionality
  res.status(501).json({
    success: false,
    message: "Get top providers functionality not implemented yet"
  });
}

export async function getReferralCode(req, res, next) {
  // TODO: Implement get referral code functionality
  res.status(501).json({
    success: false,
    message: "Get referral code functionality not implemented yet"
  });
}

export async function useReferralCode(req, res, next) {
  // TODO: Implement use referral code functionality
  res.status(501).json({
    success: false,
    message: "Use referral code functionality not implemented yet"
  });
}

export async function logProviderActivity(req, res, next) {
  // TODO: Implement log provider activity functionality
  res.status(501).json({
    success: false,
    message: "Log provider activity functionality not implemented yet"
  });
}

export async function updateCredibilityMetrics(req, res, next) {
  // TODO: Implement update credibility metrics functionality
  res.status(501).json({
    success: false,
    message: "Update credibility metrics functionality not implemented yet"
  });
}

export async function addReview(req, res, next) {
  // TODO: Implement add review functionality
  res.status(501).json({
    success: false,
    message: "Add review functionality not implemented yet"
  });
}

export async function getReviews(req, res, next) {
  // TODO: Implement get reviews functionality
  res.status(501).json({
    success: false,
    message: "Get reviews functionality not implemented yet"
  });
}

export async function updateReview(req, res, next) {
  // TODO: Implement update review functionality
  res.status(501).json({
    success: false,
    message: "Update review functionality not implemented yet"
  });
}

export async function deleteReview(req, res, next) {
  // TODO: Implement delete review functionality
  res.status(501).json({
    success: false,
    message: "Delete review functionality not implemented yet"
  });
}
