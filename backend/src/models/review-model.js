import { query } from "../config/db.js";

export default {
  async create({ provider_id, reviewer_user_id, rating, comment }) {
    const { rows } = await query(
      `INSERT INTO provider_reviews (provider_id, reviewer_user_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [provider_id, reviewer_user_id, rating, comment || null]
    );
    return rows[0];
  },

  async findByProvider(provider_id) {
    const { rows } = await query(
      `SELECT pr.review_id, pr.rating, pr.comment, pr.created_at,
              u.name AS reviewer_name
       FROM provider_reviews pr
       LEFT JOIN users u ON u.user_id = pr.reviewer_user_id
       WHERE pr.provider_id = $1
       ORDER BY pr.created_at DESC`,
      [provider_id]
    );
    return rows;
  },

  async findByReviewerAndProvider(reviewer_user_id, provider_id) {
    const { rows } = await query(
      `SELECT review_id FROM provider_reviews
       WHERE reviewer_user_id = $1 AND provider_id = $2`,
      [reviewer_user_id, provider_id]
    );
    return rows[0] || null;
  },

  async findByBooking(_booking_id) {
    return null;
  },

  async findById(review_id) {
    const { rows } = await query(
      `SELECT * FROM provider_reviews WHERE review_id = $1`,
      [review_id]
    );
    if (!rows[0]) return null;
    const row = rows[0];
    return {
      ...row,
      async save() {
        await query(
          `UPDATE provider_reviews
           SET rating = $1, comment = $2, updated_at = NOW()
           WHERE review_id = $3`,
          [this.rating, this.comment, this.review_id]
        );
      },
      async remove() {
        await query(
          `DELETE FROM provider_reviews WHERE review_id = $1`,
          [this.review_id]
        );
      }
    };
  }
};
