import { query } from "../config/db.js";

export async function sendMessage({ providerId, senderId, receiverId, content }) {
  const { rows } = await query(
    `INSERT INTO messages (provider_id, sender_id, receiver_id, content)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [providerId, senderId, receiverId, content]
  );
  return rows[0];
}

// All messages in a conversation between a specific client and provider
export async function getConversation(providerId, clientUserId) {
  const { rows } = await query(
    `SELECT m.*,
            u_s.name AS sender_name,
            u_r.name AS receiver_name
     FROM messages m
     JOIN users u_s ON u_s.user_id = m.sender_id
     JOIN users u_r ON u_r.user_id = m.receiver_id
     WHERE m.provider_id = $1
       AND (m.sender_id = $2 OR m.receiver_id = $2)
     ORDER BY m.created_at ASC`,
    [providerId, clientUserId]
  );
  return rows;
}

// All distinct conversations for a provider (one row per client)
export async function getProviderConversations(providerUserId) {
  const { rows } = await query(
    `SELECT DISTINCT ON (other_id)
            m.provider_id,
            other_id,
            u.name AS other_user_name,
            m.content AS last_message,
            m.created_at AS last_message_at,
            (SELECT COUNT(*) FROM messages m2
             WHERE m2.provider_id = m.provider_id
               AND m2.receiver_id = $1
               AND m2.is_read = false) AS unread_count
     FROM messages m
     CROSS JOIN LATERAL (
       SELECT CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AS other_id
     ) ids
     JOIN users u ON u.user_id = other_id
     WHERE m.sender_id = $1 OR m.receiver_id = $1
     ORDER BY other_id, m.created_at DESC`,
    [providerUserId]
  );
  return rows;
}

// All distinct conversations for a client (one row per provider)
export async function getClientConversations(clientUserId) {
  const { rows } = await query(
    `SELECT DISTINCT ON (m.provider_id)
            m.provider_id,
            u.name AS provider_name,
            p.booking_slug,
            m.content AS last_message,
            m.created_at AS last_message_at,
            (SELECT COUNT(*) FROM messages m2
             WHERE m2.provider_id = m.provider_id
               AND m2.receiver_id = $1
               AND m2.is_read = false) AS unread_count
     FROM messages m
     JOIN providers p ON p.provider_id = m.provider_id
     JOIN users u ON u.user_id = p.user_id
     WHERE m.sender_id = $1 OR m.receiver_id = $1
     ORDER BY m.provider_id, m.created_at DESC`,
    [clientUserId]
  );
  return rows;
}

export async function markAsRead(messageId, receiverId) {
  const { rows } = await query(
    `UPDATE messages SET is_read = true
     WHERE message_id = $1 AND receiver_id = $2
     RETURNING *`,
    [messageId, receiverId]
  );
  return rows[0] || null;
}
