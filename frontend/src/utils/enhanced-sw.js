/**
 * Enhanced Service Worker with Offline Functionality
 * Provides comprehensive caching strategies and offline support
 */

const CACHE_VERSION = "v1.0.0";
const STATIC_CACHE = `static-cache-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-cache-${CACHE_VERSION}`;
const API_CACHE = `api-cache-${CACHE_VERSION}`;
const IMAGE_CACHE = `image-cache-${CACHE_VERSION}`;

// Cache strategies
const CACHE_STRATEGIES = {
  NETWORK_FIRST: "NetworkFirst",
  CACHE_FIRST: "CacheFirst",
  STALE_WHILE_REVALIDATE: "StaleWhileRevalidate",
  NETWORK_ONLY: "NetworkOnly",
  CACHE_ONLY: "CacheOnly"
};

// Cache configuration
const CACHE_CONFIG = {
  static: {
    maxEntries: 50,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  dynamic: {
    maxEntries: 100,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  api: {
    maxEntries: 50,
    maxAge: 2 * 60 * 60 * 1000 // 2 hours
  },
  images: {
    maxEntries: 200,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
};

// Static assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/offline.html",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  /^\/api\/services/,
  /^\/api\/providers/,
  /^\/api\/slots/
];

/**
 * Service Worker Installation
 */
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("Static assets cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Failed to cache static assets:", error);
      })
  );
});

/**
 * Service Worker Activation
 */
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE &&
              cacheName !== IMAGE_CACHE
            ) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker activated");
        return self.clients.claim();
      })
  );
});

/**
 * Fetch Event Handler
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === "chrome-extension:") {
    return;
  }

  event.respondWith(handleFetch(request));
});

/**
 * Main fetch handler with routing logic
 */
async function handleFetch(request) {
  const url = new URL(request.url);

  try {
    // Handle different types of requests
    if (isStaticAsset(url)) {
      return handleStaticAsset(request);
    } else if (isApiRequest(url)) {
      return handleApiRequest(request);
    } else if (isImageRequest(request)) {
      return handleImageRequest(request);
    } else if (isNavigationRequest(request)) {
      return handleNavigation(request);
    } else {
      return handleDynamicRequest(request);
    }
  } catch (error) {
    console.error("Fetch handling error:", error);
    return handleOffline(request);
  }
}

/**
 * Handle static assets (CSS, JS, fonts, etc.)
 */
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    console.error("Static asset fetch failed");
    throw new Error("Static asset fetch failed");
  }
}

/**
 * Handle API requests with Network First strategy
 */
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);

  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful API responses
      if (shouldCacheApiResponse(request)) {
        await cache.put(request, networkResponse.clone());
      }
    }

    return networkResponse;
  } catch {
    // Network failed, try cache
    console.log("Network failed for API request, trying cache");
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback for API requests
    return new Response(
      JSON.stringify({
        error: "Offline",
        message: "This content is not available offline"
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

/**
 * Handle image requests with Cache First strategy
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Serve from cache and update in background
    updateCacheInBackground(request, IMAGE_CACHE);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    console.error("Image fetch failed");
    // Return placeholder image
    return getPlaceholderImage();
  }
}

/**
 * Handle navigation requests (pages)
 */
async function handleNavigation(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache the page for offline use
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    // Network failed, try cache
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    return caches.match("/offline.html") || getOfflineFallback();
  }
}

/**
 * Handle dynamic requests (other resources)
 */
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);

  try {
    // Stale while revalidate strategy
    const cachedResponse = await cache.match(request);

    const networkResponsePromise = fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => {
        console.log("Network request failed");
        return null;
      });

    // Return cached response immediately if available
    if (cachedResponse) {
      return cachedResponse;
    }

    // Otherwise wait for network
    const networkResponse = await networkResponsePromise;
    if (networkResponse) {
      return networkResponse;
    }

    throw new Error("No cached or network response available");
  } catch {
    console.error("Dynamic request failed");
    return getOfflineFallback();
  }
}

/**
 * Background cache update
 */
async function updateCacheInBackground(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse);
    }
  } catch {
    console.log("Background cache update failed");
  }
}

/**
 * Handle offline scenarios
 */
async function handleOffline(request) {
  const cache = await caches.open(DYNAMIC_CACHE);

  // Try to find any cached version
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Return appropriate offline fallback
  if (request.destination === "image") {
    return getPlaceholderImage();
  }

  return getOfflineFallback();
}

/**
 * Utility functions
 */
function isStaticAsset(url) {
  return (
    /\.(js|css|woff2?|ttf|eot)$/.test(url.pathname) ||
    STATIC_ASSETS.includes(url.pathname)
  );
}

function isApiRequest(url) {
  return (
    url.pathname.startsWith("/api/") ||
    API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))
  );
}

function isImageRequest(request) {
  return (
    request.destination === "image" ||
    /\.(png|jpg|jpeg|gif|webp|avif|svg)$/i.test(request.url)
  );
}

function isNavigationRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept").includes("text/html"))
  );
}

function shouldCacheApiResponse(request) {
  return (
    request.method === "GET" &&
    !request.url.includes("auth") &&
    !request.url.includes("login")
  );
}

function getPlaceholderImage() {
  return new Response(
    `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">
        Image not available offline
      </text>
    </svg>`,
    {
      headers: { "Content-Type": "image/svg+xml" }
    }
  );
}

function getOfflineFallback() {
  return (
    caches.match("/offline.html") ||
    new Response(
      `<!DOCTYPE html>
    <html>
      <head>
        <title>Offline</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .offline-message { color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>You're Offline</h1>
        <p class="offline-message">Please check your internet connection and try again.</p>
      </body>
    </html>`,
      {
        headers: { "Content-Type": "text/html" }
      }
    )
  );
}

/**
 * Background Sync for offline actions
 */
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  try {
    // Process queued offline actions
    const actions = await getQueuedActions();

    for (const action of actions) {
      try {
        await processOfflineAction(action);
        await removeQueuedAction(action.id);
      } catch (error) {
        console.error("Failed to process offline action:", error);
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

/**
 * Queue management for offline actions
 */
async function queueOfflineAction(action) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const actions = await getQueuedActions();

  const queuedAction = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...action
  };

  actions.push(queuedAction);

  // Store in IndexedDB or cache
  await cache.put(
    `offline-action-${queuedAction.id}`,
    new Response(JSON.stringify(queuedAction))
  );

  // Register for background sync
  if ("sync" in self.registration) {
    await self.registration.sync.register("background-sync");
  }
}

async function getQueuedActions() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = await cache.keys();

  const actions = [];
  for (const request of requests) {
    if (request.url.includes("offline-action-")) {
      const response = await cache.match(request);
      const action = await response.json();
      actions.push(action);
    }
  }

  return actions;
}

async function removeQueuedAction(actionId) {
  const cache = await caches.open(DYNAMIC_CACHE);
  await cache.delete(`offline-action-${actionId}`);
}

async function processOfflineAction(action) {
  const { url, method, body } = action;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(`Failed to process action: ${response.statusText}`);
  }

  return response;
}

/**
 * Message handling for communication with main thread
 */
self.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "QUEUE_OFFLINE_ACTION":
      queueOfflineAction(payload);
      break;

    case "CACHE_URLS":
      cacheUrls(payload.urls);
      break;

    case "CLEAR_CACHE":
      clearCache(payload.cacheName);
      break;

    default:
      console.log("Unknown message type:", type);
  }
});

async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.error(`Failed to cache ${url}:`, error);
    }
  }
}

async function clearCache(cacheName) {
  const cache = await caches.open(cacheName);
  await cache.clear();
}

/**
 * Periodic background sync (for newer browsers)
 */
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "content-sync") {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  try {
    // Update cached content
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedRequests = await cache.keys();

    for (const request of cachedRequests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response);
        }
      } catch {
        console.log("Failed to update cached content");
      }
    }
  } catch (error) {
    console.error("Periodic sync failed:", error);
  }
}

console.log("Enhanced Service Worker loaded");
