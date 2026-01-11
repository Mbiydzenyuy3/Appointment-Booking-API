import { query } from "../config/db.js";

export async function updateProviderRating(provider_id) {
  await query(
    `
    UPDATE providers
    SET
      rating_avg = sub.avg_rating,
      rating_count = sub.count
    FROM (
      SELECT provider_id,
             AVG(rating)::numeric(3,2) AS avg_rating,
             COUNT(*) AS count
      FROM provider_reviews
      WHERE provider_id = $1
      GROUP BY provider_id
    ) sub
    WHERE providers.provider_id = sub.provider_id
    `,
    [provider_id]
  );
}
