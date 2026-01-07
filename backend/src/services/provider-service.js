// src/services/provider-service.js
import ProviderModel from "../models/provider-model.js";
import { query } from "../config/db.js";
import { logError } from "../utils/logger.js";

export async function createProvider({ user_id, bio, rating }) {
  try {
    if (!user_id || typeof bio !== "string" || (rating && isNaN(rating))) {
      throw new Error("Invalid input for provider creation");
    }

    const existing = await ProviderModel.findByUserId(user_id);
    if (existing) {
      throw new Error("Provider already exists for this user.");
    }

    return await ProviderModel.create({
      user_id,
      bio,
      rating
    });
  } catch (err) {
    logError("Service error - creating provider", err);
    throw new Error(err.message || "Unable to create provider.");
  }
}

export async function listProviders({ limit, offset }) {
  try {
    return await ProviderModel.listAll({ limit, offset });
  } catch (err) {
    logError("Service error - listing providers", err);
    throw new Error("Unable to fetch providers.");
  }
}

export async function getProviderByBookingSlug(booking_slug) {
  try {
    const provider = await ProviderModel.findByBookingSlug(booking_slug);
    if (!provider) {
      throw new Error("Provider not found");
    }
    return provider;
  } catch (err) {
    logError("Service error - getting provider by booking slug", err);
    throw new Error(err.message || "Unable to fetch provider.");
  }
}

export async function getProviderReferralCode(provider_id) {
  try {
    const provider = await ProviderModel.findById(provider_id);
    if (!provider) {
      throw new Error("Provider not found");
    }
    return {
      referral_code: provider.referral_code,
      referral_count: provider.referral_count
    };
  } catch (err) {
    logError("Service error - getting referral code", err);
    throw new Error(err.message || "Unable to get referral code.");
  }
}

export async function processReferral(referral_code, new_provider_id) {
  try {
    const referrer = await ProviderModel.findByReferralCode(referral_code);
    if (!referrer) {
      throw new Error("Invalid referral code");
    }

    // Create referral record
    await query(
      "INSERT INTO referrals (referrer_provider_id, referred_provider_id, referral_code_used) VALUES ($1, $2, $3)",
      [referrer.provider_id, new_provider_id, referral_code]
    );

    // Increment referral count
    await ProviderModel.incrementReferralCount(referrer.provider_id);

    return { referrer_id: referrer.provider_id };
  } catch (err) {
    logError("Service error - processing referral", err);
    throw new Error(err.message || "Unable to process referral.");
  }
}

export async function updateProviderActivity(
  provider_id,
  activity_type,
  activity_data = {}
) {
  try {
    await ProviderModel.updateActivity(
      provider_id,
      activity_type,
      activity_data
    );
  } catch (err) {
    logError("Service error - updating activity", err);
    throw new Error(err.message || "Unable to update activity.");
  }
}

export async function updateProviderCredibility(provider_id, metrics) {
  try {
    await ProviderModel.updateCredibilityMetrics(provider_id, metrics);
  } catch (err) {
    logError("Service error - updating credibility", err);
    throw new Error(err.message || "Unable to update credibility metrics.");
  }
}
