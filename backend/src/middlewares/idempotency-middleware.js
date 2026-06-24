import { redisClient } from "../config/redis.js";

// Prevents duplicate booking submissions within a 30-second window.
// Key scoped to (user_id OR guest email) + timeslotId so only the first
// request wins; subsequent identical requests within the TTL get 409.
// Falls through to DB if Redis is unavailable — the unique constraint
// on the slots table is the safety net in that case.
export function idempotencyGuard(ttlSeconds = 30) {
  return async (req, res, next) => {
    const { timeslotId, guest_email } = req.body;
    if (!timeslotId) return next();

    const identity = req.user?.user_id || `guest:${guest_email}`;
    const key = `idempotency:book:${identity}:${timeslotId}`;

    try {
      if (redisClient.isOpen) {
        const result = await redisClient.set(key, "1", { NX: true, EX: ttlSeconds });
        if (result === null) {
          return res.status(409).json({
            success: false,
            message: "Your booking request is already being processed. Please wait a moment."
          });
        }
      }
    } catch {
      // Redis unavailable — allow through; DB constraint is the safety net
    }

    next();
  };
}
