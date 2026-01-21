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

export async function updateCredibilityMetrics(provider_id, metrics) {
  // Assuming metrics is an object like { response_rate: 95, completed_jobs: 10 }
  const fields = Object.keys(metrics);
  if (fields.length === 0) return;

  const setClause = fields
    .map((key, index) => `${key} = $${index + 2}`)
    .join(", ");

  await query(
    `
    UPDATE providers
    SET ${setClause}
    WHERE provider_id = $1
  `,
    [provider_id, ...Object.values(metrics)]
  );
}
