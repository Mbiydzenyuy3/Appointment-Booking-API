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
  }
};
