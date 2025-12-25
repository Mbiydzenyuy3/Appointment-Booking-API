import { pool, query } from "../config/db.js";
import { checkRedisHealth, getCacheStats } from "../config/redis.js";
import cacheService from "./cache-service.js";
import databaseOptimizer from "./database-optimizer.js";
import { logInfo, logError } from "../utils/logger.js";

/**
 * Comprehensive Performance Monitoring System
 * Collects and analyzes performance metrics across the application
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      api: {
        totalRequests: 0,
        successfulRequests: 0,
        errorRequests: 0,
        averageResponseTime: 0,
        slowRequests: 0,
        requestsPerMinute: []
      },
      database: {
        totalQueries: 0,
        slowQueries: 0,
        averageQueryTime: 0,
        connectionPool: {
          total: 0,
          active: 0,
          idle: 0,
          waiting: 0
        },
        cacheHitRatio: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRatio: 0,
        memoryUsage: {},
        keyCount: {}
      },
      system: {
        uptime: 0,
        memoryUsage: {},
        cpuUsage: 0,
        activeConnections: 0
      },
      business: {
        appointmentsPerHour: [],
        activeUsers: 0,
        popularServices: [],
        peakHours: []
      }
    };

    this.monitoringInterval = null;
    this.retentionDays = 7; // Keep metrics for 7 days
    this.startTime = Date.now();

    // Real-time metrics storage
    this.realtimeMetrics = new Map();
  }

  /**
   * Start performance monitoring
   */
  start() {
    if (this.monitoringInterval) {
      logInfo("Performance monitoring already started");
      return;
    }

    logInfo("🚀 Starting performance monitoring...");

    // Collect metrics every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 30000);

    // Initial collection
    this.collectMetrics();

    logInfo("✅ Performance monitoring started");
  }

  /**
   * Stop performance monitoring
   */
  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logInfo("🛑 Performance monitoring stopped");
    }
  }

  /**
   * Record API request metrics
   */
  recordApiRequest(duration, statusCode, endpoint) {
    const timestamp = Date.now();
    const minuteKey = Math.floor(timestamp / 60000) * 60000;

    // Update real-time metrics
    if (!this.realtimeMetrics.has(minuteKey)) {
      this.realtimeMetrics.set(minuteKey, {
        api: { requests: 0, errors: 0, totalTime: 0 },
        database: { queries: 0, totalTime: 0 }
      });
    }

    const minuteMetrics = this.realtimeMetrics.get(minuteKey);
    minuteMetrics.api.requests++;
    minuteMetrics.api.totalTime += duration;

    if (statusCode >= 400) {
      minuteMetrics.api.errors++;
    }

    // Update aggregated metrics
    this.metrics.api.totalRequests++;

    if (statusCode < 400) {
      this.metrics.api.successfulRequests++;
    } else {
      this.metrics.api.errorRequests++;
    }

    // Calculate running average response time
    const totalTime =
      this.metrics.api.averageResponseTime *
      (this.metrics.api.totalRequests - 1);
    this.metrics.api.averageResponseTime =
      (totalTime + duration) / this.metrics.api.totalRequests;

    // Track slow requests (> 1 second)
    if (duration > 1000) {
      this.metrics.api.slowRequests++;
    }

    // Store detailed metrics for analytics
    this.storeRequestMetric(endpoint, duration, statusCode);
  }

  /**
   * Record database query metrics
   */
  recordDatabaseQuery(duration, queryType = "unknown") {
    const timestamp = Date.now();
    const minuteKey = Math.floor(timestamp / 60000) * 60000;

    // Update real-time metrics
    if (!this.realtimeMetrics.has(minuteKey)) {
      this.realtimeMetrics.set(minuteKey, {
        api: { requests: 0, errors: 0, totalTime: 0 },
        database: { queries: 0, totalTime: 0 }
      });
    }

    const minuteMetrics = this.realtimeMetrics.get(minuteKey);
    minuteMetrics.database.queries++;
    minuteMetrics.database.totalTime += duration;

    // Update aggregated metrics
    this.metrics.database.totalQueries++;

    if (duration > 1000) {
      this.metrics.database.slowQueries++;
    }

    // Calculate running average query time
    const totalTime =
      this.metrics.database.averageQueryTime *
      (this.metrics.database.totalQueries - 1);
    this.metrics.database.averageQueryTime =
      (totalTime + duration) / this.metrics.database.totalQueries;
  }

  /**
   * Collect comprehensive metrics
   */
  async collectMetrics() {
    try {
      await Promise.all([
        this.collectDatabaseMetrics(),
        this.collectCacheMetrics(),
        this.collectSystemMetrics(),
        this.collectBusinessMetrics()
      ]);

      // Clean up old real-time metrics
      this.cleanupOldMetrics();

      // Store hourly aggregates
      await this.storeHourlyMetrics();
    } catch (error) {
      logError("Error collecting metrics:", error);
    }
  }

  /**
   * Collect database-related metrics
   */
  async collectDatabaseMetrics() {
    try {
      // Connection pool stats
      const poolStats = await query(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections,
          count(*) FILTER (WHERE state = 'idle in transaction') as waiting_connections
        FROM pg_stat_activity
        WHERE datname = current_database()
      `);

      this.metrics.database.connectionPool = {
        total: parseInt(poolStats.rows[0].total_connections),
        active: parseInt(poolStats.rows[0].active_connections),
        idle: parseInt(poolStats.rows[0].idle_connections),
        waiting: parseInt(poolStats.rows[0].waiting_connections)
      };

      // Cache hit ratio
      const cacheStats = await query(`
        SELECT 
          round(
            (sum(blks_hit) * 100.0) / (sum(blks_hit) + sum(blks_read)), 2
          ) as cache_hit_ratio
        FROM pg_stat_database
        WHERE datname = current_database()
      `);

      this.metrics.database.cacheHitRatio = parseFloat(
        cacheStats.rows[0].cache_hit_ratio
      );
    } catch (error) {
      logError("Error collecting database metrics:", error);
    }
  }

  /**
   * Collect cache-related metrics
   */
  async collectCacheMetrics() {
    try {
      const redisHealth = await checkRedisHealth();
      if (redisHealth.status === "connected") {
        const cacheStats = await getCacheStats();
        this.metrics.cache = {
          ...this.metrics.cache,
          ...cacheStats
        };
      }

      // Calculate cache hit ratio from application metrics
      const totalRequests = this.metrics.cache.hits + this.metrics.cache.misses;
      if (totalRequests > 0) {
        this.metrics.cache.hitRatio =
          (this.metrics.cache.hits / totalRequests) * 100;
      }
    } catch (error) {
      logError("Error collecting cache metrics:", error);
    }
  }

  /**
   * Collect system metrics
   */
  async collectSystemMetrics() {
    try {
      const memUsage = process.memoryUsage();
      this.metrics.system = {
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        memoryUsage: {
          rss: Math.round(memUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          external: Math.round(memUsage.external / 1024 / 1024) // MB
        },
        cpuUsage: process.cpuUsage(),
        activeConnections: this.metrics.database.connectionPool.active
      };
    } catch (error) {
      logError("Error collecting system metrics:", error);
    }
  }

  /**
   * Collect business metrics
   */
  async collectBusinessMetrics() {
    try {
      // Active users (users who made requests in last hour)
      const activeUsers = await query(`
        SELECT COUNT(DISTINCT user_id) as active_users
        FROM appointments 
        WHERE created_at > NOW() - INTERVAL '1 hour'
      `);

      // Appointments per hour (last 24 hours)
      const appointmentsPerHour = await query(`
        SELECT 
          DATE_TRUNC('hour', created_at) as hour,
          COUNT(*) as count
        FROM appointments 
        WHERE created_at > NOW() - INTERVAL '24 hours'
        GROUP BY hour
        ORDER BY hour
      `);

      // Popular services
      const popularServices = await query(`
        SELECT
          s.service_name as name,
          COUNT(a.appointment_id) as appointment_count
        FROM services s
        JOIN appointments a ON s.service_id = a.service_id
        WHERE a.created_at > NOW() - INTERVAL '7 days'
        GROUP BY s.service_id, s.service_name
        ORDER BY appointment_count DESC
        LIMIT 5
      `);

      this.metrics.business = {
        activeUsers: parseInt(activeUsers.rows[0]?.active_users || 0),
        appointmentsPerHour: appointmentsPerHour.rows,
        popularServices: popularServices.rows,
        peakHours: this.calculatePeakHours(appointmentsPerHour.rows)
      };
    } catch (error) {
      logError("Error collecting business metrics:", error);
    }
  }

  /**
   * Calculate peak hours from appointment data
   */
  calculatePeakHours(appointmentsData) {
    const hourCounts = {};

    appointmentsData.forEach((appointment) => {
      const hour = new Date(appointment.hour).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + parseInt(appointment.count);
    });

    return Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));
  }

  /**
   * Store detailed request metrics for analytics
   */
  async storeRequestMetric(endpoint, duration, statusCode) {
    try {
      await query(
        `
        INSERT INTO performance_metrics (
          metric_type, endpoint, duration, status_code, timestamp
        ) VALUES ($1, $2, $3, $4, NOW())
      `,
        ["api_request", endpoint, duration, statusCode]
      );

      // Clean up old metrics
      await query(`
        DELETE FROM performance_metrics 
        WHERE timestamp < NOW() - INTERVAL '${this.retentionDays} days'
      `);
    } catch (error) {
      logError("Error storing request metric:", error);
    }
  }

  /**
   * Store hourly aggregated metrics
   */
  async storeHourlyMetrics() {
    try {
      const hourKey = Math.floor(Date.now() / 3600000) * 3600000;

      // Calculate metrics for this hour
      const minuteMetrics = Array.from(this.realtimeMetrics.entries())
        .filter(
          ([timestamp]) => timestamp >= hourKey && timestamp < hourKey + 3600000
        )
        .map(([, metrics]) => metrics);

      if (minuteMetrics.length > 0) {
        const totalApiRequests = minuteMetrics.reduce(
          (sum, m) => sum + m.api.requests,
          0
        );
        const totalApiErrors = minuteMetrics.reduce(
          (sum, m) => sum + m.api.errors,
          0
        );
        const totalApiTime = minuteMetrics.reduce(
          (sum, m) => sum + m.api.totalTime,
          0
        );
        const totalDbQueries = minuteMetrics.reduce(
          (sum, m) => sum + m.database.queries,
          0
        );
        const totalDbTime = minuteMetrics.reduce(
          (sum, m) => sum + m.database.totalTime,
          0
        );

        await query(
          `
          INSERT INTO hourly_performance_metrics (
            hour_timestamp, 
            total_requests, 
            error_requests, 
            avg_response_time,
            total_queries,
            avg_query_time
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (hour_timestamp) 
          DO UPDATE SET
            total_requests = EXCLUDED.total_requests,
            error_requests = EXCLUDED.error_requests,
            avg_response_time = EXCLUDED.avg_response_time,
            total_queries = EXCLUDED.total_queries,
            avg_query_time = EXCLUDED.avg_query_time,
            updated_at = NOW()
        `,
          [
            new Date(hourKey),
            totalApiRequests,
            totalApiErrors,
            totalApiRequests > 0 ? totalApiTime / totalApiRequests : 0,
            totalDbQueries,
            totalDbQueries > 0 ? totalDbTime / totalDbQueries : 0
          ]
        );
      }
    } catch (error) {
      logError("Error storing hourly metrics:", error);
    }
  }

  /**
   * Clean up old real-time metrics
   */
  cleanupOldMetrics() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

    for (const [timestamp] of this.realtimeMetrics.entries()) {
      if (timestamp < cutoff) {
        this.realtimeMetrics.delete(timestamp);
      }
    }
  }

  /**
   * Get real-time dashboard data
   */
  getDashboardData() {
    const now = Date.now();
    const lastHour = now - 60 * 60 * 1000;

    // Get last hour's metrics
    const recentMetrics = Array.from(this.realtimeMetrics.entries())
      .filter(([timestamp]) => timestamp >= lastHour)
      .reduce(
        (acc, [, metrics]) => {
          acc.requests += metrics.api.requests;
          acc.errors += metrics.api.errors;
          acc.totalTime += metrics.api.totalTime;
          acc.queries += metrics.database.queries;
          acc.queryTime += metrics.database.totalTime;
          return acc;
        },
        { requests: 0, errors: 0, totalTime: 0, queries: 0, queryTime: 0 }
      );

    const avgResponseTime =
      recentMetrics.requests > 0
        ? recentMetrics.totalTime / recentMetrics.requests
        : 0;
    const avgQueryTime =
      recentMetrics.queries > 0
        ? recentMetrics.queryTime / recentMetrics.queries
        : 0;
    const errorRate =
      recentMetrics.requests > 0
        ? (recentMetrics.errors / recentMetrics.requests) * 100
        : 0;

    return {
      realTime: {
        requestsPerMinute: this.getRequestsPerMinute(),
        averageResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        activeConnections: this.metrics.system.activeConnections,
        cacheHitRatio: Math.round(this.metrics.cache.hitRatio * 100) / 100
      },
      summary: this.metrics,
      health: {
        database:
          this.metrics.database.cacheHitRatio > 80 ? "healthy" : "warning",
        cache: this.metrics.cache.hitRatio > 70 ? "healthy" : "warning",
        api: errorRate < 5 ? "healthy" : errorRate < 10 ? "warning" : "critical"
      },
      alerts: this.generateAlerts()
    };
  }

  /**
   * Get requests per minute for the last 10 minutes
   */
  getRequestsPerMinute() {
    const now = Date.now();
    const minutes = [];

    for (let i = 9; i >= 0; i--) {
      const minuteStart = now - i * 60 * 1000;
      const minuteEnd = minuteStart + 60 * 1000;

      const minuteMetrics = Array.from(this.realtimeMetrics.entries()).filter(
        ([timestamp]) => timestamp >= minuteStart && timestamp < minuteEnd
      );

      const requests = minuteMetrics.reduce(
        (sum, [, metrics]) => sum + metrics.api.requests,
        0
      );

      minutes.push({
        time: new Date(minuteStart).toISOString(),
        requests
      });
    }

    return minutes;
  }

  /**
   * Generate performance alerts
   */
  generateAlerts() {
    const alerts = [];

    // High error rate
    const errorRate =
      this.metrics.api.totalRequests > 0
        ? (this.metrics.api.errorRequests / this.metrics.api.totalRequests) *
          100
        : 0;

    if (errorRate > 10) {
      alerts.push({
        level: "critical",
        message: `High error rate detected: ${errorRate.toFixed(2)}%`,
        timestamp: new Date().toISOString()
      });
    } else if (errorRate > 5) {
      alerts.push({
        level: "warning",
        message: `Elevated error rate: ${errorRate.toFixed(2)}%`,
        timestamp: new Date().toISOString()
      });
    }

    // Slow response times
    if (this.metrics.api.averageResponseTime > 2000) {
      alerts.push({
        level: "warning",
        message: `Average response time is high: ${this.metrics.api.averageResponseTime.toFixed(
          0
        )}ms`,
        timestamp: new Date().toISOString()
      });
    }

    // Database performance
    if (this.metrics.database.cacheHitRatio < 80) {
      alerts.push({
        level: "warning",
        message: `Low database cache hit ratio: ${this.metrics.database.cacheHitRatio.toFixed(
          1
        )}%`,
        timestamp: new Date().toISOString()
      });
    }

    // Memory usage
    const memoryUsage = this.metrics.system.memoryUsage;
    if (memoryUsage.heapUsed > 500) {
      // 500MB
      alerts.push({
        level: "warning",
        message: `High memory usage: ${memoryUsage.heapUsed}MB`,
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }

  /**
   * Get performance report
   */
  async getPerformanceReport(startDate, endDate) {
    try {
      const report = await query(
        `
        SELECT 
          DATE_TRUNC('hour', timestamp) as hour,
          AVG(duration) as avg_response_time,
          COUNT(*) as total_requests,
          COUNT(*) FILTER (WHERE status_code >= 400) as error_requests
        FROM performance_metrics
        WHERE timestamp BETWEEN $1 AND $2
        GROUP BY hour
        ORDER BY hour
      `,
        [startDate, endDate]
      );

      return report.rows;
    } catch (error) {
      logError("Error generating performance report:", error);
      return [];
    }
  }

  /**
   * Optimize database based on performance data
   */
  async optimizeBasedOnMetrics() {
    try {
      logInfo("Running optimization based on performance metrics...");

      const result = await databaseOptimizer.optimize();

      if (result.success) {
        logInfo("✅ Database optimization completed based on metrics");
        return result;
      } else {
        logError("❌ Database optimization failed:", result.error);
        return result;
      }
    } catch (error) {
      logError("Error running metrics-based optimization:", error);
      throw error;
    }
  }
}

// Create and export performance monitor instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
export { PerformanceMonitor };
