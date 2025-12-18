import React, { useState, useEffect } from "react";
import { LazyWrapper, OptimizedImage } from "../LazyLoading/index";

/**
 * Performance Monitoring Dashboard Component
 * Displays real-time performance metrics and analytics
 */
const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch metrics data
  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/performance/metrics");
      if (!response.ok) {
        throw new Error("Failed to fetch performance metrics");
      }
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchMetrics, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Initial load
  useEffect(() => {
    fetchMetrics();
  }, []);

  // Manual refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchMetrics();
  };

  // Format bytes to human readable
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format duration
  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Alert level color
  const getAlertColor = (level) => {
    switch (level) {
      case "critical":
        return "border-red-500 bg-red-50";
      case "warning":
        return "border-yellow-500 bg-yellow-50";
      default:
        return "border-blue-500 bg-blue-50";
    }
  };

  if (loading && !metrics) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-300 rounded w-1/4 mb-6'></div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='bg-white p-6 rounded-lg shadow'>
                  <div className='h-4 bg-gray-300 rounded w-1/2 mb-2'></div>
                  <div className='h-8 bg-gray-300 rounded w-3/4'></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
            <div className='flex items-center'>
              <div className='text-red-600 mr-3'>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>
              <div>
                <h3 className='text-red-800 font-medium'>
                  Error Loading Performance Dashboard
                </h3>
                <p className='text-red-600 text-sm mt-1'>{error}</p>
                <button
                  onClick={handleRefresh}
                  className='mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Performance Dashboard
              </h1>
              <p className='text-gray-600 mt-1'>
                Real-time monitoring and analytics
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <label className='text-sm text-gray-600'>Auto-refresh:</label>
                <input
                  type='checkbox'
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className='rounded border-gray-300'
                />
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className='border border-gray-300 rounded px-3 py-1 text-sm'
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors'
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Health Status */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
          <div
            className={`p-4 rounded-lg border ${getStatusColor(
              metrics.health.database
            )}`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-medium'>Database</h3>
                <p className='text-sm opacity-75'>Cache Hit Ratio</p>
              </div>
              <div className='text-right'>
                <div className='text-2xl font-bold'>
                  {metrics.summary.database.cacheHitRatio.toFixed(1)}%
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    metrics.health.database
                  )}`}
                >
                  {metrics.health.database}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border ${getStatusColor(
              metrics.health.cache
            )}`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-medium'>Cache</h3>
                <p className='text-sm opacity-75'>Hit Ratio</p>
              </div>
              <div className='text-right'>
                <div className='text-2xl font-bold'>
                  {metrics.summary.cache.hitRatio.toFixed(1)}%
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    metrics.health.cache
                  )}`}
                >
                  {metrics.health.cache}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border ${getStatusColor(
              metrics.health.api
            )}`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-medium'>API</h3>
                <p className='text-sm opacity-75'>Error Rate</p>
              </div>
              <div className='text-right'>
                <div className='text-2xl font-bold'>
                  {metrics.realTime.errorRate.toFixed(2)}%
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    metrics.health.api
                  )}`}
                >
                  {metrics.health.api}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='flex items-center'>
              <div className='p-3 bg-blue-100 rounded-full'>
                <svg
                  className='w-6 h-6 text-blue-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Response Time
                </h3>
                <p className='text-2xl font-bold text-gray-900'>
                  {formatDuration(metrics.realTime.averageResponseTime)}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='flex items-center'>
              <div className='p-3 bg-green-100 rounded-full'>
                <svg
                  className='w-6 h-6 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Active Connections
                </h3>
                <p className='text-2xl font-bold text-gray-900'>
                  {metrics.realTime.activeConnections}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='flex items-center'>
              <div className='p-3 bg-purple-100 rounded-full'>
                <svg
                  className='w-6 h-6 text-purple-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Total Requests
                </h3>
                <p className='text-2xl font-bold text-gray-900'>
                  {metrics.summary.api.totalRequests.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow'>
            <div className='flex items-center'>
              <div className='p-3 bg-yellow-100 rounded-full'>
                <svg
                  className='w-6 h-6 text-yellow-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 10V3L4 14h7v7l9-11h-7z'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Cache Hit Ratio
                </h3>
                <p className='text-2xl font-bold text-gray-900'>
                  {metrics.realTime.cacheHitRatio.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Metrics */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Requests per Minute Chart */}
          <div className='bg-white p-6 rounded-lg shadow'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Requests per Minute
            </h3>
            <div className='h-64 flex items-end space-x-2'>
              {metrics.realTime.requestsPerMinute.map((point, index) => (
                <div key={index} className='flex-1 flex flex-col items-center'>
                  <div
                    className='bg-blue-500 rounded-t w-full transition-all duration-300'
                    style={{
                      height: `${Math.max(
                        4,
                        (point.requests /
                          Math.max(
                            ...metrics.realTime.requestsPerMinute.map(
                              (p) => p.requests
                            )
                          )) *
                          200
                      )}px`
                    }}
                    title={`${point.requests} requests at ${new Date(
                      point.time
                    ).toLocaleTimeString()}`}
                  ></div>
                  <span className='text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left'>
                    {new Date(point.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Resources */}
          <div className='bg-white p-6 rounded-lg shadow'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              System Resources
            </h3>
            <div className='space-y-4'>
              <div>
                <div className='flex justify-between text-sm'>
                  <span>Memory Usage</span>
                  <span>
                    {formatBytes(
                      metrics.summary.system.memoryUsage.heapUsed * 1024 * 1024
                    )}{" "}
                    /{" "}
                    {formatBytes(
                      metrics.summary.system.memoryUsage.heapTotal * 1024 * 1024
                    )}
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2 mt-1'>
                  <div
                    className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                    style={{
                      width: `${
                        (metrics.summary.system.memoryUsage.heapUsed /
                          metrics.summary.system.memoryUsage.heapTotal) *
                        100
                      }%`
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className='flex justify-between text-sm'>
                  <span>Database Connections</span>
                  <span>
                    {metrics.summary.database.connectionPool.active} /{" "}
                    {metrics.summary.database.connectionPool.total}
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2 mt-1'>
                  <div
                    className='bg-green-600 h-2 rounded-full transition-all duration-300'
                    style={{
                      width: `${
                        (metrics.summary.database.connectionPool.active /
                          metrics.summary.database.connectionPool.total) *
                        100
                      }%`
                    }}
                  ></div>
                </div>
              </div>

              <div className='pt-2 border-t'>
                <div className='flex justify-between text-sm'>
                  <span>Uptime</span>
                  <span>
                    {Math.floor(metrics.summary.system.uptime / 3600)}h{" "}
                    {Math.floor((metrics.summary.system.uptime % 3600) / 60)}m
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {metrics.alerts.length > 0 && (
          <div className='bg-white p-6 rounded-lg shadow mb-8'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Performance Alerts
            </h3>
            <div className='space-y-3'>
              {metrics.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${getAlertColor(
                    alert.level
                  )}`}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <div
                        className={`w-3 h-3 rounded-full mr-3 ${
                          alert.level === "critical"
                            ? "bg-red-500"
                            : alert.level === "warning"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                      ></div>
                      <div>
                        <p className='font-medium text-gray-900'>
                          {alert.message}
                        </p>
                        <p className='text-sm text-gray-600'>
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.level === "critical"
                          ? "bg-red-100 text-red-800"
                          : alert.level === "warning"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {alert.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Business Metrics */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <div className='bg-white p-6 rounded-lg shadow'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Popular Services
            </h3>
            <div className='space-y-3'>
              {metrics.summary.business.popularServices.length > 0 ? (
                metrics.summary.business.popularServices.map(
                  (service, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between'
                    >
                      <span className='text-gray-700'>
                        {service.service_name}
                      </span>
                      <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm'>
                        {service.appointment_count} appointments
                      </span>
                    </div>
                  )
                )
              ) : (
                <p className='text-gray-500 text-sm'>No data available</p>
              )}
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Peak Hours
            </h3>
            <div className='space-y-3'>
              {metrics.summary.business.peakHours.length > 0 ? (
                metrics.summary.business.peakHours.map((peak, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between'
                  >
                    <span className='text-gray-700'>{peak.hour}:00</span>
                    <span className='bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm'>
                      {peak.count} appointments
                    </span>
                  </div>
                ))
              ) : (
                <p className='text-gray-500 text-sm'>No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
