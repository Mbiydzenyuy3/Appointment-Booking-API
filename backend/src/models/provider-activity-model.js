import { query } from "../config/db.js";

export async function logProviderActivity(
  provider_id,
  activity_type,
  metadata = {}
) {
  await query(
    `
    INSERT INTO provider_activity_logs (provider_id, activity_type, metadata)
    VALUES ($1,$2,$3)
    `,
    [provider_id, activity_type, metadata]
  );
}

export async function getProviderActivities(provider_id) {
  const { rows } = await query(
    `
    SELECT activity_id, activity_type, metadata, created_at
    FROM provider_activity_logs
    WHERE provider_id = $1
    ORDER BY created_at DESC
  `,
    [provider_id]
  );
  return rows;
}
