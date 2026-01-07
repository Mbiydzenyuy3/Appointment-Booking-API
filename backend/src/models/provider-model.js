// src/models/provider-model.js
import { query } from "../config/db.js";
import { logError } from "../utils/logger.js";
import crypto from "crypto";
import imageService from "../services/image-service.js";

const ProviderModel = {
  async create({
    user_id,
    bio,
    rating,
    certifications = [],
    business_photos = [],
    testimonials = [],
    years_of_experience = 0
  }) {
    try {
      // Generate unique booking slug and referral code
      const bookingSlug = crypto.randomBytes(8).toString("hex");
      const referralCode = crypto.randomBytes(6).toString("hex").toUpperCase();

      // Process business photos to WebP format for better performance
      const webpPhotos = await imageService.processImagesToWebP(
        business_photos
      );

      const { rows } = await query(
        `
        INSERT INTO providers (user_id, bio, rating, booking_slug, referral_code, certifications, business_photos, testimonials, years_of_experience)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
        `,
        [
          user_id,
          bio,
          rating,
          bookingSlug,
          referralCode,
          JSON.stringify(certifications),
          webpPhotos, // Store WebP versions
          JSON.stringify(testimonials),
          years_of_experience
        ]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (create provider):", err);
      throw new Error("Failed to create provider profile");
    }
  },

  async updateByUserId(
    user_id,
    {
      bio,
      rating,
      certifications,
      business_photos,
      testimonials,
      years_of_experience
    }
  ) {
    try {
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (bio !== undefined) {
        updates.push(`bio = $${paramIndex++}`);
        values.push(bio);
      }
      if (rating !== undefined) {
        updates.push(`rating = $${paramIndex++}`);
        values.push(rating);
      }
      if (certifications !== undefined) {
        updates.push(`certifications = $${paramIndex++}`);
        values.push(JSON.stringify(certifications));
      }
      if (business_photos !== undefined) {
        // Process business photos to WebP format for better performance
        const webpPhotos = await imageService.processImagesToWebP(
          business_photos
        );
        updates.push(`business_photos = $${paramIndex++}`);
        values.push(webpPhotos);
      }
      if (testimonials !== undefined) {
        updates.push(`testimonials = $${paramIndex++}`);
        values.push(JSON.stringify(testimonials));
      }
      if (years_of_experience !== undefined) {
        updates.push(`years_of_experience = $${paramIndex++}`);
        values.push(years_of_experience);
      }

      if (updates.length === 0) {
        throw new Error("No fields to update");
      }

      values.push(user_id);
      const queryText = `UPDATE providers SET ${updates.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $${paramIndex} RETURNING *;`;

      const { rows } = await query(queryText, values);
      return rows[0];
    } catch (err) {
      logError("DB Error (update provider):", err);
      throw new Error("Failed to update provider profile");
    }
  },

  async listAll({ limit = 10, offset = 0 }) {
    try {
      const { rows } = await query(
        `
        SELECT 
          p.*, 
          u.name, 
          u.email 
        FROM providers p
        JOIN users u ON p.user_id = u.user_id
        LIMIT $1 OFFSET $2;
        `,
        [limit, offset]
      );
      return rows;
    } catch (err) {
      logError("DB Error (list providers):", err);
      throw new Error("Failed to fetch providers");
    }
  },

  async findByUserId(user_id) {
    try {
      const { rows } = await query(
        `SELECT * FROM providers WHERE user_id = $1`,
        [user_id]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (find by user ID):", err);
      throw new Error("Failed to query provider by user ID");
    }
  },

  async findById(provider_id) {
    try {
      const { rows } = await query(
        `
        SELECT
          p.*,
          u.name,
          u.email
        FROM providers p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.provider_id = $1
        `,
        [provider_id]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (find by provider ID):", err);
      throw new Error("Failed to query provider by ID");
    }
  },

  async findByBookingSlug(booking_slug) {
    try {
      const { rows } = await query(
        `
        SELECT
          p.*,
          u.name,
          u.email
        FROM providers p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.booking_slug = $1
        `,
        [booking_slug]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (find by booking slug):", err);
      throw new Error("Failed to query provider by booking slug");
    }
  },

  async findByReferralCode(referral_code) {
    try {
      const { rows } = await query(
        "SELECT * FROM providers WHERE referral_code = $1",
        [referral_code]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (find by referral code):", err);
      throw new Error("Failed to query provider by referral code");
    }
  },

  async updateActivity(provider_id, activity_type, activity_data = {}) {
    try {
      // Update last_active timestamp
      await query(
        "UPDATE providers SET last_active = CURRENT_TIMESTAMP, is_online = TRUE WHERE provider_id = $1",
        [provider_id]
      );

      // Log the activity
      await query(
        "INSERT INTO provider_activity_log (provider_id, activity_type, activity_data) VALUES ($1, $2, $3)",
        [provider_id, activity_type, JSON.stringify(activity_data)]
      );
    } catch (err) {
      logError("DB Error (update activity):", err);
      throw new Error("Failed to update provider activity");
    }
  },

  async updateCredibilityMetrics(provider_id, metrics) {
    try {
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (metrics.total_bookings !== undefined) {
        updates.push(`total_bookings = $${paramIndex++}`);
        values.push(metrics.total_bookings);
      }
      if (metrics.completed_bookings !== undefined) {
        updates.push(`completed_bookings = $${paramIndex++}`);
        values.push(metrics.completed_bookings);
      }
      if (metrics.cancellation_rate !== undefined) {
        updates.push(`cancellation_rate = $${paramIndex++}`);
        values.push(metrics.cancellation_rate);
      }
      if (metrics.average_rating !== undefined) {
        updates.push(`average_rating = $${paramIndex++}`);
        values.push(metrics.average_rating);
      }
      if (metrics.response_time_avg !== undefined) {
        updates.push(`response_time_avg = $${paramIndex++}`);
        values.push(metrics.response_time_avg);
      }
      if (metrics.profile_views !== undefined) {
        updates.push(`profile_views = $${paramIndex++}`);
        values.push(metrics.profile_views);
      }

      if (updates.length > 0) {
        values.push(provider_id);
        const queryText = `UPDATE providers SET ${updates.join(
          ", "
        )}, updated_at = CURRENT_TIMESTAMP WHERE provider_id = $${paramIndex}`;
        await query(queryText, values);
      }
    } catch (err) {
      logError("DB Error (update credibility metrics):", err);
      throw new Error("Failed to update credibility metrics");
    }
  },

  async incrementReferralCount(provider_id) {
    try {
      await query(
        "UPDATE providers SET referral_count = referral_count + 1 WHERE provider_id = $1",
        [provider_id]
      );
    } catch (err) {
      logError("DB Error (increment referral count):", err);
      throw new Error("Failed to increment referral count");
    }
  },

  async addReview({ provider_id, user_id, rating, review_text }) {
    try {
      const { rows } = await query(
        `
        INSERT INTO provider_reviews (provider_id, user_id, rating, review_text)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `,
        [provider_id, user_id, rating, review_text]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (add review):", err);
      throw new Error("Failed to add review");
    }
  },

  async getReviewsByProvider(provider_id, { limit = 10, offset = 0 }) {
    try {
      const { rows } = await query(
        `
        SELECT r.*, u.name as reviewer_name
        FROM provider_reviews r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.provider_id = $1
        ORDER BY r.created_at DESC
        LIMIT $2 OFFSET $3;
        `,
        [provider_id, limit, offset]
      );
      return rows;
    } catch (err) {
      logError("DB Error (get reviews by provider):", err);
      throw new Error("Failed to fetch reviews");
    }
  },

  async updateReview(review_id, user_id, { rating, review_text }) {
    try {
      const { rows } = await query(
        `
        UPDATE provider_reviews
        SET rating = $1, review_text = $2, updated_at = CURRENT_TIMESTAMP
        WHERE review_id = $3 AND user_id = $4
        RETURNING *;
        `,
        [rating, review_text, review_id, user_id]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (update review):", err);
      throw new Error("Failed to update review");
    }
  },

  async deleteReview(review_id, user_id) {
    try {
      const { rows } = await query(
        "DELETE FROM provider_reviews WHERE review_id = $1 AND user_id = $2 RETURNING *;",
        [review_id, user_id]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (delete review):", err);
      throw new Error("Failed to delete review");
    }
  }
};

export default ProviderModel;
