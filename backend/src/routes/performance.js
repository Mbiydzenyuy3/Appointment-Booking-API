import express from "express";
import performanceMonitor from "../services/performance-monitor.js";
import databaseOptimizer from "../services/database-optimizer.js";
import {
  cacheApiResponse,
  cacheUserData
} from "../middlewares/cache-middleware.js";

const router = express.Router();

/**
 * Performance Monitoring API Routes
 */

// Get real-time performance metrics
router.get(
  "/metrics",
  cacheApiResponse(30), // Cache for 30 seconds
  async (req, res) => {
    try {
      const dashboardData = performanceMonitor.getDashboardData();
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      res.status(500).json({
        error: "Failed to fetch performance metrics",
        message: error.message
      });
    }
  }
);

// Get historical performance report
router.get(
  "/report",
  cacheApiResponse(300), // Cache for 5 minutes
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: "startDate and endDate query parameters are required"
        });
      }

      const report = await performanceMonitor.getPerformanceReport(
        new Date(startDate),
        new Date(endDate)
      );

      res.json({
        report,
        period: { startDate, endDate },
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating performance report:", error);
      res.status(500).json({
        error: "Failed to generate performance report",
        message: error.message
      });
    }
  }
);

// Run database optimization
router.post(
  "/optimize/database",
  cacheUserData(60), // Cache for 1 minute
  async (req, res) => {
    try {
      const result = await databaseOptimizer.optimize();

      res.json({
        success: result.success,
        message: result.success
          ? "Database optimization completed successfully"
          : "Database optimization failed",
        data: result.success ? result : { error: result.error },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error running database optimization:", error);
      res.status(500).json({
        error: "Failed to run database optimization",
        message: error.message
      });
    }
  }
);

// Get database health status
router.get(
  "/database/health",
  cacheApiResponse(60), // Cache for 1 minute
  async (req, res) => {
    try {
      const healthStatus = await databaseOptimizer.getHealthStatus();

      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        ...healthStatus
      });
    } catch (error) {
      console.error("Error fetching database health:", error);
      res.status(500).json({
        error: "Failed to fetch database health",
        message: error.message
      });
    }
  }
);

// Analyze database performance
router.get(
  "/database/analyze",
  cacheApiResponse(300), // Cache for 5 minutes
  async (req, res) => {
    try {
      const analysis = await databaseOptimizer.analyzePerformance();

      res.json({
        success: true,
        analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error analyzing database performance:", error);
      res.status(500).json({
        error: "Failed to analyze database performance",
        message: error.message
      });
    }
  }
);

// Clean up database
router.post("/database/cleanup", async (req, res) => {
  try {
    await databaseOptimizer.cleanupDatabase();

    res.json({
      success: true,
      message: "Database cleanup completed successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error cleaning up database:", error);
    res.status(500).json({
      error: "Failed to clean up database",
      message: error.message
    });
  }
});

// Start/stop performance monitoring
router.post("/monitoring/start", async (req, res) => {
  try {
    performanceMonitor.start();

    res.json({
      success: true,
      message: "Performance monitoring started",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error starting performance monitoring:", error);
    res.status(500).json({
      error: "Failed to start performance monitoring",
      message: error.message
    });
  }
});

router.post("/monitoring/stop", async (req, res) => {
  try {
    performanceMonitor.stop();

    res.json({
      success: true,
      message: "Performance monitoring stopped",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error stopping performance monitoring:", error);
    res.status(500).json({
      error: "Failed to stop performance monitoring",
      message: error.message
    });
  }
});

// Get cache statistics
router.get(
  "/cache/stats",
  cacheApiResponse(60), // Cache for 1 minute
  async (req, res) => {
    try {
      const { getCacheStats } = await import("../config/redis.js");
      const stats = await getCacheStats();

      res.json({
        success: true,
        stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching cache stats:", error);
      res.status(500).json({
        error: "Failed to fetch cache statistics",
        message: error.message
      });
    }
  }
);

// Clear all cache
router.post("/cache/clear", async (req, res) => {
  try {
    const cacheService = (await import("../services/cache-service.js")).default;
    await cacheService.clearAll();

    res.json({
      success: true,
      message: "Cache cleared successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    res.status(500).json({
      error: "Failed to clear cache",
      message: error.message
    });
  }
});

// Get system information
router.get(
  "/system/info",
  cacheApiResponse(60), // Cache for 1 minute
  async (req, res) => {
    try {
      const os = await import("os");

      const systemInfo = {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem()
        },
        cpu: {
          count: os.cpus().length,
          model: os.cpus()[0]?.model || "Unknown",
          loadAverage: os.loadavg()
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          port: process.env.PORT,
          database: process.env.DB_NAME
        }
      };

      res.json({
        success: true,
        system: systemInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching system info:", error);
      res.status(500).json({
        error: "Failed to fetch system information",
        message: error.message
      });
    }
  }
);

// Performance optimization suggestions
router.get(
  "/suggestions",
  cacheApiResponse(600), // Cache for 10 minutes
  async (req, res) => {
    try {
      const dashboardData = performanceMonitor.getDashboardData();
      const suggestions = [];

      // Generate suggestions based on current metrics
      if (dashboardData.realTime.errorRate > 5) {
        suggestions.push({
          type: "high_error_rate",
          priority: "high",
          title: "High Error Rate Detected",
          description: `Current error rate is ${dashboardData.realTime.errorRate.toFixed(
            2
          )}%. Consider checking error logs and API endpoints.`,
          action: "Check error logs and API endpoint health"
        });
      }

      if (dashboardData.realTime.averageResponseTime > 2000) {
        suggestions.push({
          type: "slow_response",
          priority: "high",
          title: "Slow Response Times",
          description: `Average response time is ${dashboardData.realTime.averageResponseTime}ms. Consider optimizing database queries or adding caching.`,
          action: "Optimize database queries and implement caching"
        });
      }

      if (dashboardData.realTime.cacheHitRatio < 70) {
        suggestions.push({
          type: "low_cache_performance",
          priority: "medium",
          title: "Low Cache Hit Ratio",
          description: `Cache hit ratio is ${dashboardData.realTime.cacheHitRatio.toFixed(
            1
          )}%. Review caching strategies.`,
          action: "Review and optimize caching strategies"
        });
      }

      if (dashboardData.summary.system.memoryUsage.heapUsed > 500) {
        suggestions.push({
          type: "high_memory_usage",
          priority: "medium",
          title: "High Memory Usage",
          description: `Memory usage is ${dashboardData.summary.system.memoryUsage.heapUsed}MB. Consider memory optimization.`,
          action: "Optimize memory usage and consider garbage collection"
        });
      }

      res.json({
        success: true,
        suggestions,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({
        error: "Failed to generate performance suggestions",
        message: error.message
      });
    }
  }
);

export default router;
