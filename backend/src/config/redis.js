import { createClient } from "redis";
import { logError, logInfo } from "../utils/logger.js";

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  database: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryDelayOnClusterDown: 300,
  maxRetriesPerRequest: null // For cluster mode
};

// Create Redis client
const redisClient = createClient({
  url: `redis://${redisConfig.host}:${redisConfig.port}`,
  password: redisConfig.password,
  database: redisConfig.database
});

// Cache configuration
const cacheConfig = {
  // Default TTL (time-to-live) values in seconds
  defaults: {
    user: 3600, // 1 hour
    appointments: 1800, // 30 minutes
    slots: 900, // 15 minutes
    services: 7200, // 2 hours
    providers: 3600, // 1 hour
    analytics: 300, // 5 minutes
    sessions: 86400 // 24 hours
  },

  // Cache key prefixes for organization
  prefixes: {
    user: "user:",
    appointment: "appointment:",
    slot: "slot:",
    service: "service:",
    provider: "provider:",
    analytics: "analytics:",
    session: "session:",
    rateLimit: "rate_limit:",
    temp: "temp:"
  },

  // Cache warming strategies
  warming: {
    enabled: process.env.CACHE_WARMING === "true",
    intervals: {
      popularAppointments: 300, // 5 minutes
      userProfiles: 1800, // 30 minutes
      services: 3600 // 1 hour
    }
  }
};

// Event handlers
redisClient.on("error", (error) => {
  logError("Redis Client Error:", error);
});

redisClient.on("connect", () => {
  logInfo("Redis Client Connected");
});

redisClient.on("ready", () => {
  logInfo("Redis Client Ready");
});

redisClient.on("end", () => {
  logInfo("Redis Client Disconnected");
});

redisClient.on("reconnecting", () => {
  logInfo("Redis Client Reconnecting...");
});

// Initialize Redis connection
export const initializeRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      logInfo("Redis connection established successfully");
    }
  } catch (error) {
    logError("Failed to connect to Redis:", error);
    // Don't throw error - allow app to continue without Redis
    console.warn("Redis connection failed. App will continue without caching.");
  }
};

// Graceful shutdown
export const closeRedisConnection = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.disconnect();
      logInfo("Redis connection closed successfully");
    }
  } catch (error) {
    logError("Error closing Redis connection:", error);
  }
};

// Health check
export const checkRedisHealth = async () => {
  try {
    if (!redisClient.isOpen) {
      return { status: "disconnected", latency: null };
    }

    const start = Date.now();
    await redisClient.ping();
    const latency = Date.now() - start;

    return { status: "connected", latency };
  } catch (error) {
    return { status: "error", error: error.message };
  }
};

// Cache statistics
export const getCacheStats = async () => {
  try {
    if (!redisClient.isOpen) {
      return { status: "Redis not connected" };
    }

    const info = await redisClient.info();
    const memory = await redisClient.call("INFO", "memory");

    return {
      status: "connected",
      memory: parseRedisInfo(memory),
      info: parseRedisInfo(info)
    };
  } catch (error) {
    return { status: "error", error: error.message };
  }
};

// Helper function to parse Redis INFO command output
const parseRedisInfo = (info) => {
  const lines = info.split("\r\n");
  const parsed = {};

  lines.forEach((line) => {
    if (line.includes(":")) {
      const [key, value] = line.split(":");
      parsed[key] = value;
    }
  });

  return parsed;
};

export { redisClient, redisConfig, cacheConfig };
export default redisClient;
