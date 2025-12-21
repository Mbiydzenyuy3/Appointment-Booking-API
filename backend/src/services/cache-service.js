import { redisClient, cacheConfig } from "../config/redis.js";
import { logError, logInfo } from "../utils/logger.js";

/**
 * Comprehensive caching service with multiple strategies
 */
class CacheService {
  constructor() {
    this.client = redisClient;
    this.config = cacheConfig;
  }

  /**
   * Generate cache key with prefix
   */
  generateKey(prefix, identifier) {
    return `${this.config.prefixes[prefix] || ""}${identifier}`;
  }

  /**
   * Set cache with TTL
   */
  async set(key, value, ttl = null, prefix = null) {
    try {
      if (prefix) {
        key = this.generateKey(prefix, key);
      }

      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        expires: ttl ? Date.now() + ttl * 1000 : null
      });

      if (ttl) {
        await this.client.setEx(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }

      logInfo(`Cache set: ${key}`);
      return true;
    } catch (error) {
      logError(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get cache value
   */
  async get(key, prefix = null) {
    try {
      if (prefix) {
        key = this.generateKey(prefix, key);
      }

      const value = await this.client.get(key);
      if (!value) {
        return null;
      }

      const parsed = JSON.parse(value);

      // Check if expired
      if (parsed.expires && Date.now() > parsed.expires) {
        await this.delete(key, prefix);
        return null;
      }

      logInfo(`Cache hit: ${key}`);
      return parsed.data;
    } catch (error) {
      logError(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete cache key
   */
  async delete(key, prefix = null) {
    try {
      if (prefix) {
        key = this.generateKey(prefix, key);
      }

      await this.client.del(key);
      logInfo(`Cache deleted: ${key}`);
      return true;
    } catch (error) {
      logError(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deleteByPattern(pattern, prefix = null) {
    try {
      if (prefix) {
        pattern = this.generateKey(prefix, pattern);
      }

      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        logInfo(
          `Cache deleted ${keys.length} keys matching pattern: ${pattern}`
        );
      }
      return keys.length;
    } catch (error) {
      logError(`Cache delete by pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key, prefix = null) {
    try {
      if (prefix) {
        key = this.generateKey(prefix, key);
      }

      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      logError(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set expiration for existing key
   */
  async expire(key, ttl, prefix = null) {
    try {
      if (prefix) {
        key = this.generateKey(prefix, key);
      }

      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      logError(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL for key
   */
  async ttl(key, prefix = null) {
    try {
      if (prefix) {
        key = this.generateKey(prefix, key);
      }

      const ttl = await this.client.ttl(key);
      return ttl;
    } catch (error) {
      logError(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Increment counter
   */
  async increment(key, prefix = null, amount = 1) {
    try {
      if (prefix) {
        key = this.generateKey(prefix, key);
      }

      const value = await this.client.incrBy(key, amount);
      logInfo(`Cache increment: ${key} = ${value}`);
      return value;
    } catch (error) {
      logError(`Cache increment error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set with NX (only if not exists)
   */
  async setNX(key, value, ttl = null, prefix = null) {
    try {
      if (prefix) {
        key = this.generateKey(prefix, key);
      }

      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        expires: ttl ? Date.now() + ttl * 1000 : null
      });

      const result = ttl
        ? await this.client.setNX(key, serializedValue, { EX: ttl })
        : await this.client.setNX(key, serializedValue);

      return result;
    } catch (error) {
      logError(`Cache setNX error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Wrap function with cache-aside pattern
   */
  async cached(key, fetchFunction, ttl = 300, prefix = null) {
    try {
      // Try to get from cache first
      let data = await this.get(key, prefix);

      if (data !== null) {
        return { data, cached: true };
      }

      // Cache miss - fetch from source
      logInfo(`Cache miss for key: ${key}`);
      data = await fetchFunction();

      // Store in cache
      if (data !== null && data !== undefined) {
        await this.set(key, data, ttl, prefix);
      }

      return { data, cached: false };
    } catch (error) {
      logError(`Cached function error for key ${key}:`, error);

      // On error, try to fetch without cache
      try {
        const data = await fetchFunction();
        return { data, cached: false, error: error.message };
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
  }

  /**
   * Wrap function with cache-through pattern
   */
  async cacheThrough(key, fetchFunction, ttl = 300, prefix = null) {
    try {
      const data = await fetchFunction();

      if (data !== null && data !== undefined) {
        await this.set(key, data, ttl, prefix);
      }

      return data;
    } catch (error) {
      logError(`Cache-through error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Wrap function with write-behind pattern
   */
  async writeBehind(key, value, ttl = 300, prefix = null) {
    try {
      // Immediately store in cache
      await this.set(key, value, ttl, prefix);

      // Return immediately - background write can be implemented here
      return true;
    } catch (error) {
      logError(`Write-behind error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Invalidate cache by tags (pattern-based invalidation)
   */
  async invalidateByTag(tag) {
    try {
      const pattern = `*${tag}*`;
      const deletedCount = await this.deleteByPattern(pattern);
      logInfo(`Invalidated ${deletedCount} cache entries for tag: ${tag}`);
      return deletedCount;
    } catch (error) {
      logError(`Cache invalidation error for tag ${tag}:`, error);
      return 0;
    }
  }

  /**
   * Cache user profile
   */
  async cacheUserProfile(userId, userData, ttl = null) {
    const finalTTL = ttl || this.config.defaults.user;
    return this.set(`profile:${userId}`, userData, finalTTL);
  }

  /**
   * Get cached user profile
   */
  async getUserProfile(userId) {
    return this.get(`profile:${userId}`);
  }

  /**
   * Cache appointments list
   */
  async cacheAppointments(userId, appointments, ttl = null) {
    const finalTTL = ttl || this.config.defaults.appointments;
    return this.set(`user:${userId}:appointments`, appointments, finalTTL);
  }

  /**
   * Get cached appointments
   */
  async getCachedAppointments(userId) {
    return this.get(`user:${userId}:appointments`);
  }

  /**
   * Cache available slots
   */
  async cacheSlots(providerId, slots, ttl = null) {
    const finalTTL = ttl || this.config.defaults.slots;
    return this.set(`provider:${providerId}:slots`, slots, finalTTL);
  }

  /**
   * Get cached slots
   */
  async getCachedSlots(providerId) {
    return this.get(`provider:${providerId}:slots`);
  }

  /**
   * Cache services list
   */
  async cacheServices(services, ttl = null) {
    const finalTTL = ttl || this.config.defaults.services;
    return this.set("services:list", services, finalTTL);
  }

  /**
   * Get cached services
   */
  async getCachedServices() {
    return this.get("services:list");
  }

  /**
   * Rate limiting with cache
   */
  async rateLimit(identifier, limit, windowSeconds) {
    try {
      const key = this.generateKey("rateLimit", identifier);
      const current = await this.client.get(key);

      if (current && parseInt(current) >= limit) {
        return { allowed: false, remaining: 0, resetTime: await this.ttl(key) };
      }

      const newCount = current ? parseInt(current) + 1 : 1;
      await this.client.setEx(key, windowSeconds, newCount.toString());

      return {
        allowed: true,
        remaining: limit - newCount,
        resetTime: windowSeconds
      };
    } catch (error) {
      logError(`Rate limit error for ${identifier}:`, error);
      return { allowed: true, remaining: limit, resetTime: windowSeconds };
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async clearAll() {
    try {
      await this.client.flushAll();
      logInfo("All cache cleared");
      return true;
    } catch (error) {
      logError("Cache clear all error:", error);
      return false;
    }
  }

  /**
   * Get cache info
   */
  async getInfo() {
    try {
      const info = await this.client.info();
      return this.parseRedisInfo(info);
    } catch (error) {
      logError("Cache info error:", error);
      return null;
    }
  }

  /**
   * Parse Redis INFO output
   */
  parseRedisInfo(info) {
    const lines = info.split("\r\n");
    const parsed = {};

    lines.forEach((line) => {
      if (line.includes(":")) {
        const [key, value] = line.split(":");
        parsed[key] = value;
      }
    });

    return parsed;
  }
}

// Create and export cache service instance
const cacheService = new CacheService();

export default cacheService;
export { CacheService };
