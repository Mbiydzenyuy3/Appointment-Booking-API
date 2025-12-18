import cacheService from "../services/cache-service.js";

/**
 * Middleware for handling browser caching headers
 */

// Cache headers configuration
const cacheHeaders = {
  // Static assets - cache for 1 year
  static: {
    maxAge: 31536000, // 1 year
    etag: true,
    lastModified: true,
    public: true
  },

  // API responses - cache for 1 hour
  api: {
    maxAge: 3600, // 1 hour
    etag: true,
    public: true
  },

  // User-specific data - cache for 5 minutes
  user: {
    maxAge: 300, // 5 minutes
    etag: true,
    private: true
  },

  // Pages - cache for 30 minutes
  page: {
    maxAge: 1800, // 30 minutes
    etag: true,
    public: true
  }
};

/**
 * Set cache headers for responses
 */
const setCacheHeaders = (res, type = "api", maxAge = null) => {
  const config = cacheHeaders[type] || cacheHeaders.api;
  const age = maxAge || config.maxAge;

  // Set Cache-Control header
  let cacheControl = `max-age=${age}`;

  if (config.public) {
    cacheControl += ", public";
  } else if (config.private) {
    cacheControl += ", private";
  }

  if (config.etag) {
    cacheControl += ", must-revalidate";
  }

  res.setHeader("Cache-Control", cacheControl);

  // Set additional headers
  if (config.etag) {
    res.setHeader(
      "ETag",
      `"${Date.now()}-${Math.random().toString(36).substr(2, 9)}"`
    );
  }

  if (config.lastModified) {
    res.setHeader("Last-Modified", new Date().toUTCString());
  }

  res.setHeader("Vary", "Accept-Encoding, Accept-Language");

  return res;
};

/**
 * Middleware for caching API responses
 */
export const cacheApiResponse = (duration = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    try {
      // Skip caching for non-GET requests
      if (req.method !== "GET") {
        return next();
      }

      // Generate cache key
      const cacheKey = keyGenerator
        ? keyGenerator(req)
        : `${req.method}:${req.originalUrl}:${req.user?.id || "anonymous"}`;

      // Try to get from cache
      const cachedResponse = await cacheService.get(cacheKey);

      if (cachedResponse) {
        // Set cache headers
        setCacheHeaders(res, "api", duration);

        // Send cached response
        return res.json(cachedResponse);
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function (data) {
        // Cache the response
        cacheService.set(cacheKey, data, duration).catch((err) => {
          console.warn("Failed to cache API response:", err);
        });

        // Set cache headers
        setCacheHeaders(res, "api", duration);

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next(); // Continue without caching on error
    }
  };
};

/**
 * Middleware for caching user-specific data
 */
export const cacheUserData = (duration = 300) => {
  return async (req, res, next) => {
    try {
      if (req.method !== "GET" || !req.user) {
        return next();
      }

      const cacheKey = `user:${req.user.id}:${req.originalUrl}`;
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        setCacheHeaders(res, "user", duration);
        return res.json(cachedData);
      }

      const originalJson = res.json;
      res.json = function (data) {
        cacheService.set(cacheKey, data, duration).catch((err) => {
          console.warn("Failed to cache user data:", err);
        });

        setCacheHeaders(res, "user", duration);
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("User cache middleware error:", error);
      next();
    }
  };
};

/**
 * Middleware for static asset caching
 */
export const cacheStaticAssets = (req, res, next) => {
  if (
    req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2|woff|ttf|eot)$/)
  ) {
    setCacheHeaders(res, "static");
  }
  next();
};

/**
 * Middleware for page caching
 */
export const cachePages = (duration = 1800) => {
  return (req, res, next) => {
    if (req.method === "GET" && req.accepts("html")) {
      setCacheHeaders(res, "page", duration);
    }
    next();
  };
};

/**
 * Cache invalidation middleware
 */
export const invalidateCache = (patterns = []) => {
  return async (req, res, next) => {
    // Store original send/json methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Override response methods to invalidate cache after successful operations
    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate relevant cache patterns
        patterns.forEach((pattern) => {
          cacheService.deleteByPattern(pattern).catch((err) => {
            console.warn("Cache invalidation failed:", err);
          });
        });
      }
      return originalJson.call(this, data);
    };

    res.send = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach((pattern) => {
          cacheService.deleteByPattern(pattern).catch((err) => {
            console.warn("Cache invalidation failed:", err);
          });
        });
      }
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Conditional caching middleware
 */
export const conditionalCache = (condition, duration = 3600) => {
  return async (req, res, next) => {
    try {
      if (!condition(req) || req.method !== "GET") {
        return next();
      }

      const cacheKey = `conditional:${req.originalUrl}:${
        req.user?.id || "anonymous"
      }`;
      const cachedResponse = await cacheService.get(cacheKey);

      if (cachedResponse) {
        // Check if client has a matching ETag
        const clientETag = req.headers["if-none-match"];
        const serverETag = `"${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}"`;

        if (clientETag === serverETag) {
          return res.status(304).end();
        }

        setCacheHeaders(res, "api", duration);
        return res.json(cachedResponse);
      }

      const originalJson = res.json;
      res.json = function (data) {
        cacheService.set(cacheKey, data, duration).catch((err) => {
          console.warn("Failed to cache conditional response:", err);
        });

        setCacheHeaders(res, "api", duration);
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Conditional cache middleware error:", error);
      next();
    }
  };
};

/**
 * Rate limiting with caching
 */
export const cachedRateLimit = (limit, windowMs) => {
  return async (req, res, next) => {
    try {
      const key = `rate_limit:${req.ip}`;
      const result = await cacheService.rateLimit(
        key,
        limit,
        Math.floor(windowMs / 1000)
      );

      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", result.remaining);
      res.setHeader(
        "X-RateLimit-Reset",
        new Date(Date.now() + result.resetTime * 1000).toISOString()
      );

      if (!result.allowed) {
        return res.status(429).json({
          error: "Too many requests",
          retryAfter: result.resetTime
        });
      }

      next();
    } catch (error) {
      console.error("Cached rate limit error:", error);
      next(); // Continue on error
    }
  };
};

export default {
  setCacheHeaders,
  cacheApiResponse,
  cacheUserData,
  cacheStaticAssets,
  cachePages,
  invalidateCache,
  conditionalCache,
  cachedRateLimit
};
