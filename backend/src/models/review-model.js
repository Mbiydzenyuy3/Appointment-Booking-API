import { query } from "../config/db.js";

export default {
  async create({ provider_id, reviewer_user_id, rating, comment }) {
    const { rows } = await query(
      `
      INSERT INTO provider_reviews
      (provider_id, user_id, rating, review_text)
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
      [provider_id, reviewer_user_id, rating, comment]
    );
    return rows[0];
  },

  async findByProvider(provider_id) {
    const { rows } = await query(
      `
      SELECT rating, review_text AS comment, created_at
      FROM provider_reviews
      WHERE provider_id = $1
      ORDER BY created_at DESC
      `,
      [provider_id]
    );
    return rows;
  },

  async findByBooking(booking_id) {
    // booking_id column does not exist in DB; return null gracefully
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
           SET rating = $1, review_text = $2, updated_at = NOW()
           WHERE review_id = $3`,
          [this.rating, this.review_text, this.review_id]
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
