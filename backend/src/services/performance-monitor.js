import os from "os";
import { performance } from "perf_hooks";

class PerformanceMonitor {
  constructor() {
    this.isMonitoring = false;
    this.metrics = {
      requests: [],
      errors: [],
      responseTimes: [],
      memoryUsage: [],
      cpuUsage: []
    };
    this.startTime = null;
  }

  start() {
    if (this.isMonitoring) {
      throw new Error("Performance monitoring is already running");
    }

    this.isMonitoring = true;
    this.startTime = Date.now();
    this.metrics = {
      requests: [],
      errors: [],
      responseTimes: [],
      memoryUsage: [],
      cpuUsage: []
    };

    // Start collecting metrics every 5 seconds
    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, 5000);

    console.log("Performance monitoring started");
  }

  stop() {
    if (!this.isMonitoring) {
      throw new Error("Performance monitoring is not running");
    }

    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log("Performance monitoring stopped");
  }

  collectMetrics() {
    if (!this.isMonitoring) return;

    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    this.metrics.memoryUsage.push({
      timestamp: Date.now(),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024)
    });

    this.metrics.cpuUsage.push({
      timestamp: Date.now(),
      user: cpuUsage.user / 1000, // ms
      system: cpuUsage.system / 1000
    });
  }

  recordRequest(responseTime, isError = false) {
    if (!this.isMonitoring) return;

    this.metrics.requests.push({
      timestamp: Date.now(),
      responseTime,
      isError
    });

    if (isError) {
      this.metrics.errors.push({
        timestamp: Date.now(),
        responseTime
      });
    }

    this.metrics.responseTimes.push(responseTime);

    // Keep only last 1000 entries to prevent memory issues
    if (this.metrics.requests.length > 1000) {
      this.metrics.requests.shift();
    }
    if (this.metrics.errors.length > 1000) {
      this.metrics.errors.shift();
    }
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift();
    }
  }

  getDashboardData() {
    const now = Date.now();
    const lastHour = now - 60 * 60 * 1000;

    // Filter metrics from last hour
    const recentRequests = this.metrics.requests.filter(
      (r) => r.timestamp > lastHour
    );
    const recentErrors = this.metrics.errors.filter(
      (e) => e.timestamp > lastHour
    );
    const recentResponseTimes = this.metrics.responseTimes.filter(
      (rt) => rt !== undefined
    );

    const totalRequests = recentRequests.length;
    const errorCount = recentErrors.length;
    const errorRate =
      totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

    const averageResponseTime =
      recentResponseTimes.length > 0
        ? recentResponseTimes.reduce((sum, rt) => sum + rt, 0) /
          recentResponseTimes.length
        : 0;

    const p95ResponseTime = this.calculatePercentile(recentResponseTimes, 95);
    const p99ResponseTime = this.calculatePercentile(recentResponseTimes, 99);

    // Current memory and CPU
    const currentMemory = process.memoryUsage();
    const currentCpu = process.cpuUsage();

    return {
      realTime: {
        totalRequests,
        errorCount,
        errorRate,
        averageResponseTime: Math.round(averageResponseTime),
        p95ResponseTime: Math.round(p95ResponseTime),
        p99ResponseTime: Math.round(p99ResponseTime),
        requestsPerSecond: totalRequests / 3600, // per hour
        uptime: this.startTime ? Math.round((now - this.startTime) / 1000) : 0
      },
      summary: {
        system: {
          memoryUsage: {
            heapUsed: Math.round(currentMemory.heapUsed / 1024 / 1024),
            heapTotal: Math.round(currentMemory.heapTotal / 1024 / 1024),
            external: Math.round(currentMemory.external / 1024 / 1024),
            rss: Math.round(currentMemory.rss / 1024 / 1024)
          },
          cpuUsage: {
            user: currentCpu.user / 1000,
            system: currentCpu.system / 1000
          },
          loadAverage: os.loadavg()
        },
        monitoring: {
          isActive: this.isMonitoring,
          startTime: this.startTime,
          uptime: this.startTime ? Math.round((now - this.startTime) / 1000) : 0
        }
      },
      charts: {
        responseTimeHistory: this.metrics.responseTimes.slice(-50), // Last 50 response times
        memoryHistory: this.metrics.memoryUsage.slice(-20), // Last 20 memory readings
        cpuHistory: this.metrics.cpuUsage.slice(-20) // Last 20 CPU readings
      }
    };
  }

  async getPerformanceReport(startDate, endDate) {
    // For now, return current dashboard data
    // In a real implementation, this would query historical data from a database
    const dashboardData = this.getDashboardData();

    return {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      metrics: dashboardData.realTime,
      system: dashboardData.summary.system,
      recommendations: this.generateRecommendations(dashboardData)
    };
  }

  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
      return sorted[lower];
    }

    return sorted[lower] + (index - lower) * (sorted[upper] - sorted[lower]);
  }

  generateRecommendations(dashboardData) {
    const recommendations = [];

    if (dashboardData.realTime.errorRate > 5) {
      recommendations.push({
        type: "error_rate",
        severity: "high",
        title: "High Error Rate",
        description: `Error rate is ${dashboardData.realTime.errorRate.toFixed(
          1
        )}%. Investigate error logs and API endpoints.`,
        action: "Check application logs and fix failing endpoints"
      });
    }

    if (dashboardData.realTime.averageResponseTime > 2000) {
      recommendations.push({
        type: "response_time",
        severity: "high",
        title: "Slow Response Times",
        description: `Average response time is ${dashboardData.realTime.averageResponseTime}ms. Consider database optimization or caching.`,
        action: "Optimize database queries and implement caching strategies"
      });
    }

    if (dashboardData.summary.system.memoryUsage.heapUsed > 500) {
      recommendations.push({
        type: "memory_usage",
        severity: "medium",
        title: "High Memory Usage",
        description: `Heap usage is ${dashboardData.summary.system.memoryUsage.heapUsed}MB. Monitor for memory leaks.`,
        action:
          "Review memory usage patterns and optimize memory-intensive operations"
      });
    }

    return recommendations;
  }
}

// Export singleton instance
const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
