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
