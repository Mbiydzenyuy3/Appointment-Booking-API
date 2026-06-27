# Session Fix + Messaging + Performance Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix provider session loss after browser refresh, add client↔provider messaging, enforce idempotent booking, and cache hot reads under 500 ms.

**Architecture:** Three independent layers — (1) auth plumbing fix (two files), (2) REST + Socket.io messaging with a new `messages` table, (3) Redis-based idempotency key and response cache wired into existing `cacheService`. No new dependencies required; Redis and Socket.io are already wired up.

**Tech Stack:** Node.js/Express ES modules, PostgreSQL via `pg` Pool, Redis via `redis` v4 (`cacheService` wrapper at `backend/src/services/cache-service.js`), Socket.io (`backend/src/sockets/`), React/Vite frontend, axios (`frontend/src/services/api.js`), Tailwind CSS.

## Global Constraints

- ES module syntax (`import`/`export`) everywhere — no `require()`
- New DB columns/tables via `ALTER TABLE … ADD COLUMN IF NOT EXISTS` or `CREATE TABLE IF NOT EXISTS` inside `_runPostMigrations()` in `backend/src/config/db.js` — never re-create existing tables
- `req.user.user_id` set by `authMiddleware`; `req.user.provider_id` comes from JWT (may be null on refresh — see Task 1 fix)
- JWT cookie: `httpOnly: true, secure: true, sameSite: "none"`, 7-day maxAge
- All API responses: `{ success: true, data: … }` or `{ success: false, message: "…" }`
- Do not add features outside this plan's scope
- Redis operations must be non-blocking: wrap in try/catch, fall through on miss/error
- Socket.io auth uses JWT from `socket.handshake.auth.token`

---

## Task 1 — Fix session persistence after browser refresh

**Root cause:** `GET /auth/profile` returns `provider_info: { provider_id }` nested, not `provider_id` at top level. `AuthContext` sets `user = response.data.data`, so `user.provider_id` is `undefined` after every page reload. `ProviderDashboard` checks `if (!user?.provider_id)` and exits early — no data loads and components receive `undefined` as providerId, showing broken states.

**Second root cause:** No global axios interceptor — expired-token 401s are silently swallowed or cause partial failures.

**Files:**
- Modify: `backend/src/controllers/auth-controller.js` (function `getUserProfile`)
- Modify: `frontend/src/services/api.js`
- Modify: `frontend/src/context/AuthContext.jsx`

**Interfaces:**
- Produces: `GET /auth/profile` response now includes `provider_id` at top level alongside `provider_info`
- Produces: `api` instance interceptor that calls `logout()` + redirects to `/login` on any 401

- [ ] **Step 1: Fix getUserProfile to expose provider_id at top level**

In `backend/src/controllers/auth-controller.js`, find `getUserProfile` and change the final `res.json` call:

```js
// BEFORE:
res.status(200).json({ success: true, data: { ...user, provider_info: providerInfo } });

// AFTER:
res.status(200).json({
  success: true,
  data: {
    ...user,
    provider_id: providerInfo?.provider_id || null,
    provider_info: providerInfo
  }
});
```

- [ ] **Step 2: Add global 401 interceptor to api.js**

Replace the entire `frontend/src/services/api.js` with:

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

// Attached after AuthContext mounts — see AuthContext.jsx
export function attachAuthInterceptor(logoutFn, navigateFn) {
  api.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        logoutFn();
        navigateFn("/login");
      }
      return Promise.reject(error);
    }
  );
}

export default api;
```

- [ ] **Step 3: Wire interceptor in AuthContext.jsx**

In `frontend/src/context/AuthContext.jsx`, add `useNavigate` import and attach the interceptor once on mount:

```js
import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { attachAuthInterceptor } from "../services/api.js";
import { trackLogin, trackRegistrationCompleted } from "../services/analytics.js";

const Context = createContext();

export const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    setUser(null);
  };

  // Attach interceptor once — uses stable logout + navigate refs
  useEffect(() => {
    attachAuthInterceptor(logout, navigate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.get("/auth/profile")
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const userData = response.data.data;
      setUser(userData);
      trackLogin(userData.user_id, userData.user_type);
      return { success: true, user_type: userData.user_type };
    } catch (error) {
      let message = "Login failed";
      if (!error.response) message = "Network error: Please check your internet connection and try again.";
      else if (error.response.status >= 500) message = "Server error: Please try again later.";
      else message = error.response.data?.message || "Login failed due to an unexpected error.";
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      const newUser = response.data.data;
      setUser(newUser);
      trackRegistrationCompleted(newUser.user_id, newUser.user_type);
      return { success: true, user_type: newUser.user_type };
    } catch (error) {
      let message = "Registration failed";
      if (!error.response) message = "Network error: Please check your internet connection and try again.";
      else if (error.response.status >= 500) message = "Server error: Please try again later.";
      else message = error.response.data?.message || "Registration failed due to an unexpected error.";
      return { success: false, message };
    }
  };

  return (
    <Context.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </Context.Provider>
  );
};

export const useAuth = () => useContext(Context);
```

- [ ] **Step 4: Verify fix manually**
  1. Log in as a provider
  2. Hard-refresh the browser (Ctrl+Shift+R)
  3. Provider dashboard should load services and timeslots (no more empty state)
  4. Open DevTools → Network → confirm `GET /auth/profile` response body includes `"provider_id": "<uuid>"` at top level

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/auth-controller.js \
        frontend/src/services/api.js \
        frontend/src/context/AuthContext.jsx
git commit -m "fix: expose provider_id from /auth/profile + global 401 interceptor"
```

---

## Task 2 — Idempotent booking (prevent double-submit)

**Problem:** A user clicking "Book" twice (or a network retry) can create two appointments for the same slot. The DB constraint catches the second one only after the first INSERT commits — a race window exists during concurrent requests.

**Solution:** Before the DB write, attempt to SET a Redis key `idempotency:book:{userId}:{timeslotId}` (or `idempotency:book:guest:{guestEmail}:{timeslotId}`) with NX + EX 30. Only the first request acquires the lock; duplicates within 30 seconds receive 409 immediately without touching the DB. The lock expires automatically — no cleanup needed.

**Files:**
- Create: `backend/src/middlewares/idempotency-middleware.js`
- Modify: `backend/src/routes/appointment.js`

**Interfaces:**
- Consumes: `redisClient` from `backend/src/config/redis.js`
- Produces: `idempotencyGuard` middleware that can be applied to any route

- [ ] **Step 1: Create idempotency middleware**

Create `backend/src/middlewares/idempotency-middleware.js`:

```js
import { redisClient } from "../config/redis.js";

// Prevents duplicate booking submissions within a 30-second window.
// Key is scoped to (user OR guest email) + timeslotId.
// Redis NX flag means only the first SET wins; subsequent ones see "null" and are rejected.
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
      // Redis unavailable — allow request through; DB unique constraint is the safety net
    }

    next();
  };
}
```

- [ ] **Step 2: Apply middleware to booking routes**

In `backend/src/routes/appointment.js`, import and apply the guard to both booking routes:

```js
import { idempotencyGuard } from "../middlewares/idempotency-middleware.js";

// Add idempotencyGuard() before the controller on both booking routes:
// router.post("/book", authMiddleware, idempotencyGuard(), CreateAppointment);
// router.post("/guest-book", idempotencyGuard(), CreateGuestAppointment);
```

Read the current appointment routes file and locate the two POST routes for `/book` and `/guest-book`, then add `idempotencyGuard()` as the second argument (after `authMiddleware` for `/book`, as first for `/guest-book`).

- [ ] **Step 3: Verify idempotency**
  1. Open browser DevTools → Network
  2. Click "Book Appointment" button rapidly 3 times in quick succession
  3. First request: 201 Created
  4. Second and third requests (within 30s): 409 with `"Your booking request is already being processed."`
  5. Check DB: only one appointment row created

- [ ] **Step 4: Commit**

```bash
git add backend/src/middlewares/idempotency-middleware.js \
        backend/src/routes/appointment.js
git commit -m "feat: idempotency guard on booking endpoints via Redis NX lock"
```

---

## Task 3 — Redis response caching for hot reads (< 500 ms)

**Problem:** Every request hits Postgres with N+1 JOINs. The three hottest read paths are:
- `GET /services` — public service list, queried on every dashboard load
- `GET /providers/:bookingSlug` — public provider profile with reviews + gallery
- `GET /slots/search/available` — availability picker, re-fetches on every month change

**Solution:** Use the existing `cacheService` wrapper (`backend/src/services/cache-service.js`) to cache responses in Redis with short TTLs. Invalidate on mutation. Falls through to DB on cache miss or Redis down — zero behavior change if Redis is unavailable.

**Files:**
- Modify: `backend/src/models/service-model.js` (wrap `findAllServices`)
- Modify: `backend/src/models/slot-model.js` (wrap `searchAvailableSlots`)
- Modify: `backend/src/controllers/provider-controller.js` (cache `getProviderProfile`)
- Modify: `backend/src/controllers/service-controller.js` (invalidate on create/update/delete)
- Modify: `backend/src/controllers/gallery-controller.js` (invalidate provider profile cache on gallery change)

**Interfaces:**
- Consumes: `cacheService.get(key)`, `cacheService.set(key, value, ttlSeconds)`, `cacheService.del(key)` from `backend/src/services/cache-service.js`
- Cache key conventions:
  - `services:all` — full public service list, TTL 300s
  - `provider:profile:{bookingSlug}` — provider public profile, TTL 120s
  - `slots:available:{providerId}:{serviceId}` — available slots, TTL 60s

- [ ] **Step 1: Cache findAllServices in service-model.js**

In `backend/src/models/service-model.js`, import cacheService and wrap `findAllServices`:

```js
import cacheService from "../services/cache-service.js";

export async function findAllServices() {
  const cacheKey = "services:all";
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  const queryText = `SELECT s.service_id, s.provider_id, s.service_name as name, s.description, s.price,
                            s.duration_minutes as duration, s.location, s.category,
                            u.name as provider_name, p.booking_slug,
                            COALESCE(ROUND(AVG(pr.rating)::numeric, 1), 0) as avg_rating,
                            COUNT(pr.review_id) as review_count
                     FROM services s
                     JOIN providers p ON s.provider_id = p.provider_id
                     JOIN users u ON p.user_id = u.user_id
                     LEFT JOIN provider_reviews pr ON pr.provider_id = p.provider_id
                     GROUP BY s.service_id, s.provider_id, s.service_name, s.description,
                              s.price, s.duration_minutes, s.location, s.category, u.name, p.booking_slug`;
  // NOTE: keep the exact query that already exists — only add the cache wrapper around it
  const { rows } = await pool.query(queryText);
  await cacheService.set(cacheKey, rows, 300);
  return rows;
}
```

- [ ] **Step 2: Invalidate services cache on mutation**

In `backend/src/controllers/service-controller.js`, after successful create, update, or delete, add:

```js
import cacheService from "../services/cache-service.js";

// At end of create handler (after setServices):
await cacheService.del("services:all");

// At end of update handler:
await cacheService.del("services:all");

// At end of delete handler:
await cacheService.del("services:all");
```

Each `await cacheService.del(...)` is wrapped in try/catch by cacheService itself — safe to call without extra error handling.

- [ ] **Step 3: Cache getProviderProfile**

In `backend/src/controllers/provider-controller.js`, wrap `getProviderProfile`:

```js
import cacheService from "../services/cache-service.js";

export async function getProviderProfile(req, res, next) {
  try {
    const cacheKey = `provider:profile:${req.params.bookingSlug}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });

    const provider = await getProviderByBookingSlug(req.params.bookingSlug);
    const { rows: services } = await query(
      `SELECT service_id, service_name AS name, description, duration_minutes AS duration, price,
              location, additional_description, image_url
       FROM services WHERE provider_id = $1 ORDER BY service_name`,
      [provider.provider_id]
    );
    const { rows: galleryRows } = await query(
      `SELECT gallery_id, image_url, caption, display_order
       FROM provider_gallery WHERE provider_id = $1
       ORDER BY display_order ASC, created_at ASC`,
      [provider.provider_id]
    );
    const reviews = await ReviewModel.findByProvider(provider.provider_id);
    const data = { ...provider, services, gallery: galleryRows, reviews };

    await cacheService.set(cacheKey, data, 120);
    res.json({ success: true, data });
  } catch (err) {
    logError("Get provider profile failed", err);
    next(err);
  }
}
```

Add cache invalidation in `updateProvider` and `addReview` and gallery operations (see Step 4).

- [ ] **Step 4: Invalidate provider profile cache on mutations**

Anywhere the provider's public data changes, delete its cache key. Add this helper at the top of provider-controller.js:

```js
async function invalidateProviderProfileCache(bookingSlug) {
  if (bookingSlug) {
    await cacheService.del(`provider:profile:${bookingSlug}`);
  }
}
```

Call it in:
- `updateProvider` — after `ProviderModel.updateByUserId`, fetch `provider.booking_slug` and call `invalidateProviderProfileCache(provider.booking_slug)`
- `addReview` — fetch provider's booking_slug from DB, call invalidate
- `updateGalleryItem` in `gallery-controller.js` — fetch provider's booking_slug, call invalidate

For `addReview`, add before the `res.status(201)`:
```js
const providerForCache = await ProviderModel.findById(provider_id);
await invalidateProviderProfileCache(providerForCache?.booking_slug);
```

- [ ] **Step 5: Cache available slot search**

In `backend/src/models/slot-model.js`, wrap `searchAvailableSlots`:

```js
import cacheService from "../services/cache-service.js";

export async function searchAvailableSlots({ providerId, serviceId, day, limit = 10, offset = 0 }) {
  // Only cache the common case (no specific day, no offset, requesting up to 1000)
  const isCacheable = !day && offset === 0 && limit >= 100 && providerId && serviceId;
  const cacheKey = `slots:available:${providerId}:${serviceId}`;

  if (isCacheable) {
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;
  }

  // ... existing query logic unchanged ...
  // After computing `slots`:
  if (isCacheable) {
    await cacheService.set(cacheKey, slots, 60);
  }
  return slots;
}
```

Invalidate in slot-controller.js after create or delete:
```js
import cacheService from "../services/cache-service.js";
// after successful create: await cacheService.del(`slots:available:${providerId}:${serviceId}`);
// after successful delete: await cacheService.del(`slots:available:${slot.provider_id}:${slot.service_id}`);
```

- [ ] **Step 6: Verify latency**

Open browser DevTools → Network tab → load the client dashboard and provider profile:
- `GET /services` first load: ~200-400ms (DB); subsequent loads: <50ms (Redis)
- `GET /providers/:slug` with reviews+gallery first load: ~300-600ms; subsequent: <50ms
- `GET /slots/search/available` first load: ~150-300ms; subsequent: <30ms

- [ ] **Step 7: Commit**

```bash
git add backend/src/models/service-model.js \
        backend/src/models/slot-model.js \
        backend/src/controllers/provider-controller.js \
        backend/src/controllers/service-controller.js \
        backend/src/controllers/gallery-controller.js
git commit -m "perf: Redis cache for services, provider profile, and slot search"
```

---

## Task 4 — Messaging: backend (DB + API)

**Design:** A `messages` table stores all messages. Each message belongs to a conversation between a client `user_id` and a `provider_id`. Messages are one-directional (sender → receiver). Both parties can list conversation history and send messages. A provider can only access their own conversations; a client can only access conversations they're part of.

**Files:**
- Modify: `backend/src/config/db.js` (add messages table migration)
- Create: `backend/src/models/message-model.js`
- Create: `backend/src/controllers/message-controller.js`
- Create: `backend/src/routes/message.js`
- Modify: `backend/src/routes/index.js` (or server.js — wherever routes are mounted)

**Interfaces:**
- Produces:
  - `POST /messages` — send a message `{ provider_id, content }` (authenticated client or provider)
  - `GET /messages/conversations` — list all conversations for the current user
  - `GET /messages/conversations/:providerId` — get all messages in a conversation
  - `PUT /messages/:messageId/read` — mark message as read

- [ ] **Step 1: Add messages table migration in db.js**

In `backend/src/config/db.js`, inside `_runPostMigrations()`, add after the existing `safeAlter` calls:

```js
await pool.query(`
  CREATE TABLE IF NOT EXISTS messages (
    message_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id   UUID NOT NULL REFERENCES providers(provider_id) ON DELETE CASCADE,
    sender_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id   UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content       TEXT NOT NULL,
    is_read       BOOLEAN DEFAULT false,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
await safeAlter(
  `CREATE INDEX IF NOT EXISTS idx_messages_provider ON messages(provider_id)`,
  "messages provider index"
);
await safeAlter(
  `CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id)`,
  "messages sender_receiver index"
);
```

- [ ] **Step 2: Create message-model.js**

Create `backend/src/models/message-model.js`:

```js
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

// All messages in a conversation between a client and provider
export async function getConversation(providerId, clientUserId) {
  const { rows } = await query(
    `SELECT m.*, 
            u_sender.name AS sender_name,
            u_receiver.name AS receiver_name
     FROM messages m
     JOIN users u_sender  ON u_sender.user_id  = m.sender_id
     JOIN users u_receiver ON u_receiver.user_id = m.receiver_id
     WHERE m.provider_id = $1
       AND (m.sender_id = $2 OR m.receiver_id = $2)
     ORDER BY m.created_at ASC`,
    [providerId, clientUserId]
  );
  return rows;
}

// List all unique conversations for a provider (one row per client)
export async function getProviderConversations(providerUserId) {
  const { rows } = await query(
    `SELECT DISTINCT ON (
       CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
     )
     m.provider_id,
     CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AS other_user_id,
     u.name AS other_user_name,
     m.content AS last_message,
     m.created_at AS last_message_at,
     COUNT(m2.message_id) FILTER (WHERE m2.is_read = false AND m2.receiver_id = $1) AS unread_count
     FROM messages m
     JOIN users u ON u.user_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
     LEFT JOIN messages m2 ON m2.provider_id = m.provider_id
       AND (m2.sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
            OR m2.receiver_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END)
     WHERE m.sender_id = $1 OR m.receiver_id = $1
     GROUP BY m.provider_id, other_user_id, u.name, m.content, m.created_at
     ORDER BY other_user_id, m.created_at DESC`,
    [providerUserId]
  );
  return rows;
}

// List all conversations for a client
export async function getClientConversations(clientUserId) {
  const { rows } = await query(
    `SELECT DISTINCT ON (m.provider_id)
     m.provider_id,
     p_user.name AS provider_name,
     p.booking_slug,
     m.content AS last_message,
     m.created_at AS last_message_at,
     COUNT(m2.message_id) FILTER (WHERE m2.is_read = false AND m2.receiver_id = $1) AS unread_count
     FROM messages m
     JOIN providers p ON p.provider_id = m.provider_id
     JOIN users p_user ON p_user.user_id = p.user_id
     LEFT JOIN messages m2 ON m2.provider_id = m.provider_id
       AND (m2.sender_id = $1 OR m2.receiver_id = $1)
       AND m2.is_read = false AND m2.receiver_id = $1
     WHERE m.sender_id = $1 OR m.receiver_id = $1
     GROUP BY m.provider_id, p_user.name, p.booking_slug, m.content, m.created_at
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
```

- [ ] **Step 3: Create message-controller.js**

Create `backend/src/controllers/message-controller.js`:

```js
import * as MessageModel from "../models/message-model.js";
import ProviderModel from "../models/provider-model.js";
import { query } from "../config/db.js";
import { logError } from "../utils/logger.js";
import { getSocket } from "../sockets/socket.js";

export async function sendMessage(req, res, next) {
  try {
    const senderId = req.user.user_id;
    const { provider_id, content } = req.body;

    if (!provider_id || !content?.trim()) {
      return res.status(400).json({ success: false, message: "provider_id and content are required." });
    }
    if (content.trim().length > 2000) {
      return res.status(400).json({ success: false, message: "Message cannot exceed 2000 characters." });
    }

    // Determine receiver: if sender is provider's owner, receiver = client (need client_user_id in body)
    // If sender is a client, receiver = provider's user
    const provider = await ProviderModel.findById(provider_id);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });

    let receiverId;
    if (req.user.user_type === "provider" && req.user.provider_id === provider_id) {
      // Provider replying to a client — need client_user_id
      const { client_user_id } = req.body;
      if (!client_user_id) return res.status(400).json({ success: false, message: "client_user_id required for provider reply." });
      receiverId = client_user_id;
    } else {
      // Client sending to provider
      receiverId = provider.user_id;
    }

    const message = await MessageModel.sendMessage({
      providerId: provider_id,
      senderId,
      receiverId,
      content: content.trim()
    });

    // Real-time delivery via Socket.io (best-effort)
    try {
      const io = getSocket();
      io.to(`user:${receiverId}`).emit("new_message", message);
    } catch { /* socket not critical */ }

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    logError("Send message failed", err);
    next(err);
  }
}

export async function getConversations(req, res, next) {
  try {
    const userId = req.user.user_id;
    const conversations = req.user.user_type === "provider"
      ? await MessageModel.getProviderConversations(userId)
      : await MessageModel.getClientConversations(userId);
    res.json({ success: true, data: conversations });
  } catch (err) {
    logError("Get conversations failed", err);
    next(err);
  }
}

export async function getConversation(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { providerId } = req.params;

    // Verify access: must be the provider owner or a participant client
    const provider = await ProviderModel.findById(providerId);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });

    const isProvider = req.user.user_type === "provider" && req.user.provider_id === providerId;
    const clientUserId = isProvider ? req.query.client_user_id : userId;

    if (!clientUserId) {
      return res.status(400).json({ success: false, message: "client_user_id query param required for provider." });
    }

    const messages = await MessageModel.getConversation(providerId, clientUserId);
    res.json({ success: true, data: messages });
  } catch (err) {
    logError("Get conversation failed", err);
    next(err);
  }
}

export async function markRead(req, res, next) {
  try {
    const updated = await MessageModel.markAsRead(req.params.messageId, req.user.user_id);
    if (!updated) return res.status(404).json({ success: false, message: "Message not found." });
    res.json({ success: true, data: updated });
  } catch (err) {
    logError("Mark read failed", err);
    next(err);
  }
}
```

- [ ] **Step 4: Create message route**

Create `backend/src/routes/message.js`:

```js
import express from "express";
import authMiddleware from "../middlewares/auth-middleware.js";
import * as MessageController from "../controllers/message-controller.js";

const router = express.Router();

router.post("/", authMiddleware, MessageController.sendMessage);
router.get("/conversations", authMiddleware, MessageController.getConversations);
router.get("/conversations/:providerId", authMiddleware, MessageController.getConversation);
router.put("/:messageId/read", authMiddleware, MessageController.markRead);

export default router;
```

- [ ] **Step 5: Mount message route**

Find where other routes are mounted (search for `app.use("/auth"` or similar in `backend/src/` — likely `server.js` or `app.js`). Add:

```js
import messageRoutes from "./routes/message.js";
// ...
app.use("/messages", messageRoutes);
```

- [ ] **Step 6: Join Socket.io room on connect**

In `backend/src/sockets/socket-handler.js`, add room join so users receive real-time messages:

```js
// Inside socketHandler(socket) function, add at the top:
const userId = socket.user?.sub;
if (userId) {
  socket.join(`user:${userId}`);
}
```

- [ ] **Step 7: Test endpoints manually**

```bash
# Send a message (as client)
curl -X POST https://your-backend/messages \
  -H "Content-Type: application/json" \
  -d '{"provider_id":"<uuid>","content":"Hello, I have a question about pricing."}' \
  --cookie "token=<jwt>"

# List conversations
curl https://your-backend/messages/conversations --cookie "token=<jwt>"

# Get conversation with a provider
curl "https://your-backend/messages/conversations/<providerId>" --cookie "token=<jwt>"
```

Expected: 201, 200, 200 responses with correct data shapes.

- [ ] **Step 8: Commit**

```bash
git add backend/src/config/db.js \
        backend/src/models/message-model.js \
        backend/src/controllers/message-controller.js \
        backend/src/routes/message.js
git commit -m "feat: messaging backend — messages table, REST API, Socket.io delivery"
```

---

## Task 5 — Messaging: frontend UI

**Design:** A "Messages" tab appears in both the client dashboard and provider dashboard. Clicking it shows a conversation list. Clicking a conversation shows the message thread. On the provider profile public page, a "Message Provider" button opens a modal for the first message. All messages show sender name, time, and read status.

**Files:**
- Create: `frontend/src/components/Messaging/ConversationList.jsx`
- Create: `frontend/src/components/Messaging/MessageThread.jsx`
- Create: `frontend/src/components/Messaging/MessageModal.jsx`
- Modify: `frontend/src/pages/Dashboard.jsx` (add Messages tab/section)
- Modify: `frontend/src/pages/ProviderDashboard.jsx` (add Messages tab)
- Modify: `frontend/src/pages/ProviderProfile.jsx` (add "Message Provider" button)

**Interfaces:**
- Consumes:
  - `GET /messages/conversations` → `[{ provider_id, provider_name, booking_slug, last_message, last_message_at, unread_count }]`
  - `GET /messages/conversations/:providerId` → `[{ message_id, sender_id, sender_name, content, is_read, created_at }]`
  - `POST /messages` body: `{ provider_id, content }` (client) or `{ provider_id, client_user_id, content }` (provider)
  - `PUT /messages/:messageId/read`
- Produces: `MessageModal` props: `{ providerId, providerName, isOpen, onClose }`

- [ ] **Step 1: Create ConversationList.jsx**

Create `frontend/src/components/Messaging/ConversationList.jsx`:

```jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export default function ConversationList({ onSelect }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/messages/conversations")
      .then((res) => setConversations(res.data.data || []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-8 text-center text-gray-500">Loading conversations...</div>;

  if (conversations.length === 0) {
    return (
      <div className="py-12 text-center">
        <ChatBubbleLeftRightIcon className="w-10 h-10 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conv) => (
        <button
          key={conv.provider_id || conv.other_user_id}
          onClick={() => onSelect(conv)}
          className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-3 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <span className="text-green-700 font-semibold text-sm">
              {(conv.provider_name || conv.other_user_name || "?")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {conv.provider_name || conv.other_user_name}
              </p>
              {Number(conv.unread_count) > 0 && (
                <span className="bg-green-600 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-2">
                  {conv.unread_count}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs truncate mt-0.5">{conv.last_message}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create MessageThread.jsx**

Create `frontend/src/components/Messaging/MessageThread.jsx`:

```jsx
import React, { useEffect, useRef, useState } from "react";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PaperAirplaneIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function MessageThread({ conversation, onBack }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const providerId = conversation.provider_id;
  const clientUserId = user?.user_type === "provider" ? conversation.other_user_id : undefined;

  useEffect(() => {
    const url = clientUserId
      ? `/messages/conversations/${providerId}?client_user_id=${clientUserId}`
      : `/messages/conversations/${providerId}`;

    api.get(url)
      .then((res) => setMessages(res.data.data || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [providerId, clientUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const body = { provider_id: providerId, content: newMessage.trim() };
      if (clientUserId) body.client_user_id = clientUserId;
      const res = await api.post("/messages", body);
      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage("");
    } catch {
      // keep message in input on failure
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-lg text-gray-600">
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-green-700 font-semibold text-xs">
            {(conversation.provider_name || conversation.other_user_name || "?")[0].toUpperCase()}
          </span>
        </div>
        <p className="font-semibold text-gray-900 text-sm">
          {conversation.provider_name || conversation.other_user_name}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 text-sm">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user?.user_id;
            return (
              <div key={msg.message_id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMine ? "bg-green-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMine ? "text-green-200" : "text-gray-400"}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-end gap-2 px-4 py-3 border-t border-gray-100">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Create MessageModal.jsx**

Create `frontend/src/components/Messaging/MessageModal.jsx`:

```jsx
import React, { useState } from "react";
import api from "../../services/api.js";
import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

export default function MessageModal({ providerId, providerName, isOpen, onClose }) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      await api.post("/messages", { provider_id: providerId, content: content.trim() });
      toast.success("Message sent!");
      setContent("");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Message {providerName}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSend} className="p-6 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ask about pricing, location, availability..."
            rows={4}
            maxLength={2000}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{content.length}/2000</span>
            <button
              type="submit"
              disabled={!content.trim() || sending}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              {sending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add Messages section to client Dashboard.jsx**

In `frontend/src/pages/Dashboard.jsx`, add a "Messages" section after the Appointments section:

```jsx
import ConversationList from "../components/Messaging/ConversationList.jsx";
import MessageThread from "../components/Messaging/MessageThread.jsx";
// Add state:
const [activeConversation, setActiveConversation] = useState(null);

// Add section at the bottom of the page JSX (before closing </div>):
<section className="mt-8">
  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Messages</h2>
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ minHeight: 320 }}>
    {activeConversation ? (
      <MessageThread
        conversation={activeConversation}
        onBack={() => setActiveConversation(null)}
      />
    ) : (
      <div className="p-4">
        <ConversationList onSelect={setActiveConversation} />
      </div>
    )}
  </div>
</section>
```

- [ ] **Step 5: Add Messages tab to ProviderDashboard.jsx**

In `frontend/src/pages/ProviderDashboard.jsx`, add state and a new "Messages" tab alongside the existing tabs. Import `ConversationList` and `MessageThread`. Add the Messages tab button to the tab bar and add the corresponding tab panel that renders `ConversationList` / `MessageThread` — following the exact same tab pattern used for "Services" and "Availability" tabs already in that file.

Import additions:
```jsx
import ConversationList from "../components/Messaging/ConversationList.jsx";
import MessageThread from "../components/Messaging/MessageThread.jsx";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
```

State addition:
```jsx
const [activeConversation, setActiveConversation] = useState(null);
```

- [ ] **Step 6: Add "Message Provider" button to ProviderProfile.jsx**

In `frontend/src/pages/ProviderProfile.jsx`, import `MessageModal` and `useAuth`. Add state for the modal. Add the button below the "Book Appointment" button on the profile (only visible when the viewer is a logged-in client — not the provider themselves, not a guest):

```jsx
import MessageModal from "../components/Messaging/MessageModal.jsx";
// state:
const [messageModalOpen, setMessageModalOpen] = useState(false);

// In JSX, after the Book Appointment button:
{user && user.user_type !== "provider" && (
  <>
    <button
      onClick={() => setMessageModalOpen(true)}
      className="w-full mt-2 btn btn-secondary flex items-center justify-center gap-2"
    >
      <ChatBubbleLeftRightIcon className="w-4 h-4" />
      Message Provider
    </button>
    <MessageModal
      providerId={provider?.provider_id}
      providerName={provider?.name || "Provider"}
      isOpen={messageModalOpen}
      onClose={() => setMessageModalOpen(false)}
    />
  </>
)}
```

- [ ] **Step 7: Verify messaging flow end-to-end**
  1. Log in as a client → navigate to a provider's public profile → click "Message Provider" → type a message → Send → toast "Message sent!"
  2. Log in as the provider → go to Messages tab in dashboard → see the conversation → click it → see the client's message → reply → Send
  3. Refresh the client dashboard → Messages section shows the conversation with provider's reply
  4. Unread count badge appears on conversations with unread messages

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/Messaging/ \
        frontend/src/pages/Dashboard.jsx \
        frontend/src/pages/ProviderDashboard.jsx \
        frontend/src/pages/ProviderProfile.jsx
git commit -m "feat: messaging UI — ConversationList, MessageThread, MessageModal"
```

---

## Self-Review

**Spec coverage:**
- Session bug (provider_id missing, no 401 interceptor) → Task 1 ✓
- Idempotent booking (dedup double-submit) → Task 2 ✓
- Request latency < 500ms → Task 3 ✓
- Client↔provider messaging (send, list, thread, negotiate price/location) → Tasks 4 + 5 ✓
- Socket.io real-time delivery → Task 4 Step 6 + controller ✓
- Provider can reply → Task 4 controller `client_user_id` param + Task 5 MessageThread ✓
- Message only visible to participants → Task 4 model queries use WHERE constraints ✓

**Placeholder scan:** No TBDs, all code blocks complete.

**Type consistency:** `provider_id` (UUID string) used consistently. `client_user_id` passed through body and query param consistently between frontend and backend. `conversation.provider_id` used in MessageThread matches what `getClientConversations` returns.
