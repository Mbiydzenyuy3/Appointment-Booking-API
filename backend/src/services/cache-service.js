import { redisClient, cacheConfig } from "../config/redis.js";
import { logInfo, logError } from "../utils/logger.js";

/**
 * Cache Service
 * Provides caching functionality using Redis
 */
class CacheService {
  constructor() {
    this.isConnected = false;
    this.checkConnection();
  }

  /**
   * Check if Redis is connected
   */
  async checkConnection() {
    try {
      if (redisClient.isOpen) {
        this.isConnected = true;
        return true;
      }
      return false;
    } catch (error) {
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Set a cache value
   */
  async set(key, value, ttl = null) {
    try {
      if (!this.isConnected) return false;

      const serializedValue = JSON.stringify(value);
      const options = {};

      if (ttl) {
        options.EX = ttl;
      }

      await redisClient.set(key, serializedValue, options);
      return true;
    } catch (error) {
      logError("Cache set error:", error);
      return false;
    }
  }

  /**
   * Get a cache value
   */
  async get(key) {
    try {
      if (!this.isConnected) return null;

      const value = await redisClient.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      logError("Cache get error:", error);
      return null;
    }
  }

  /**
   * Delete a cache key
   */
  async delete(key) {
    try {
      if (!this.isConnected) return false;

      await redisClient.del(key);
      return true;
    } catch (error) {
      logError("Cache delete error:", error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      if (!this.isConnected) return false;

      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logError("Cache exists error:", error);
      return false;
    }
  }

  /**
   * Set multiple keys
   */
  async mset(keyValuePairs, ttl = null) {
    try {
      if (!this.isConnected) return false;

      const pipeline = redisClient.multi();

      for (const [key, value] of Object.entries(keyValuePairs)) {
        const serializedValue = JSON.stringify(value);
        pipeline.set(key, serializedValue);
        if (ttl) {
          pipeline.expire(key, ttl);
        }
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      logError("Cache mset error:", error);
      return false;
    }
  }

  /**
   * Get multiple keys
   */
  async mget(keys) {
    try {
      if (!this.isConnected) return {};

      const values = await redisClient.mGet(keys);
      const result = {};

      keys.forEach((key, index) => {
        const value = values[index];
        if (value) {
          try {
            result[key] = JSON.parse(value);
          } catch (parseError) {
            result[key] = value;
          }
        } else {
          result[key] = null;
        }
      });

      return result;
    } catch (error) {
      logError("Cache mget error:", error);
      return {};
    }
  }

  /**
   * Clear all cache
   */
  async clearAll() {
    try {
      if (!this.isConnected) {
        throw new Error("Redis not connected");
      }

      await redisClient.flushAll();
      logInfo("Cache cleared successfully");
      return true;
    } catch (error) {
      logError("Cache clear error:", error);
      throw error;
    }
  }

  /**
   * Get cache keys matching pattern
   */
  async keys(pattern = "*") {
    try {
      if (!this.isConnected) return [];

      const keys = await redisClient.keys(pattern);
      return keys;
    } catch (error) {
      logError("Cache keys error:", error);
      return [];
    }
  }

  /**
   * Set cache with default TTL based on type
   */
  async setWithType(key, value, type) {
    const ttl = cacheConfig.defaults[type] || cacheConfig.defaults.user;
    return this.set(key, value, ttl);
  }

  /**
   * Get cache with prefixed key
   */
  async getWithPrefix(prefix, key) {
    const fullKey = `${cacheConfig.prefixes[prefix] || prefix}:${key}`;
    return this.get(fullKey);
  }

  /**
   * Set cache with prefixed key
   */
  async setWithPrefix(prefix, key, value, ttl = null) {
    const fullKey = `${cacheConfig.prefixes[prefix] || prefix}:${key}`;
    return this.set(fullKey, value, ttl);
  }

  /**
   * Delete cache with prefixed key
   */
  async deleteWithPrefix(prefix, key) {
    const fullKey = `${cacheConfig.prefixes[prefix] || prefix}:${key}`;
    return this.delete(fullKey);
  }

  /**
   * Get or set cache (cache-aside pattern)
   */
  async getOrSet(key, fetcher, ttl = null) {
    let value = await this.get(key);
    if (value !== null) {
      return value;
    }

    value = await fetcher();
    if (value !== null && value !== undefined) {
      await this.set(key, value, ttl);
    }

    return value;
  }

  /**
   * Increment a numeric value
   */
  async increment(key, amount = 1) {
    try {
      if (!this.isConnected) return null;

      const result = await redisClient.incrBy(key, amount);
      return result;
    } catch (error) {
      logError("Cache increment error:", error);
      return null;
    }
  }

  /**
   * Set expiration on key
   */
  async expire(key, ttl) {
    try {
      if (!this.isConnected) return false;

      await redisClient.expire(key, ttl);
      return true;
    } catch (error) {
      logError("Cache expire error:", error);
      return false;
    }
  }

  /**
   * Get TTL for key
   */
  async ttl(key) {
    try {
      if (!this.isConnected) return -2;

      const result = await redisClient.ttl(key);
      return result;
    } catch (error) {
      logError("Cache ttl error:", error);
      return -2;
    }
  }
}

// Export singleton instance
const cacheService = new CacheService();

export default cacheService;
export { CacheService };
