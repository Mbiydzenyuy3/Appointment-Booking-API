import { query } from "../config/db.js";

export default {
  async create({ provider_id, booking_id, reviewer_user_id, rating, comment }) {
    const { rows } = await query(
      `
      INSERT INTO provider_reviews
      (provider_id, booking_id, reviewer_user_id, rating, comment)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [provider_id, booking_id, reviewer_user_id, rating, comment]
    );
    return rows[0];
  },

  async findByProvider(provider_id) {
    const { rows } = await query(
      `
      SELECT rating, comment, created_at
      FROM provider_reviews
      WHERE provider_id = $1
      ORDER BY created_at DESC
      `,
      [provider_id]
    );
    return rows;
  },

  async findByBooking(booking_id) {
    const { rows } = await query(
      `SELECT * FROM provider_reviews WHERE booking_id = $1`,
      [booking_id]
    );
    return rows[0] || null;
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
