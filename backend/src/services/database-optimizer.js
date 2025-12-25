import { pool, query } from "../config/db.js";
import { logInfo, logError } from "../utils/logger.js";

/**
 * Database Performance Optimization Script
 * This script adds performance indexes, optimizes queries, and implements best practices
 */

class DatabaseOptimizer {
  constructor() {
    this.performanceStats = {
      totalQueries: 0,
      slowQueries: 0,
      averageQueryTime: 0,
      cacheHitRatio: 0
    };
  }

  /**
   * Add performance-optimized indexes
   */
  async addPerformanceIndexes() {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      logInfo("Adding performance indexes...");

      // Composite indexes for common query patterns
      const indexes = [
        // Appointments table - most queried table
        {
          name: "idx_appointments_user_date_status",
          sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_user_date_status 
                ON appointments(user_id, appointment_date, status) 
                WHERE status != 'canceled'`
        },
        {
          name: "idx_appointments_provider_date_status",
          sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_provider_date_status 
                ON appointments(provider_id, appointment_date, status) 
                WHERE status != 'canceled'`
        },
        {
          name: "idx_appointments_date_status",
          sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_date_status 
                ON appointments(appointment_date, status)`
        },

        // Time slots table - frequently joined
        {
          name: "idx_time_slots_provider_date_available",
          sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_slots_provider_date_available 
                ON time_slots(provider_id, day, is_available) 
                WHERE is_available = true`
        },
        {
          name: "idx_time_slots_date_available",
          sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_slots_date_available 
                ON time_slots(day, is_available) 
                WHERE is_available = true AND is_booked = false`
        },

        // Services table - for provider lookups
        {
          name: "idx_services_provider_name",
          sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_provider_name
                ON services(provider_id, service_name)`
        },

        // Users table - for authentication and lookups
        {
          name: "idx_users_type_created",
          sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_type_created 
                ON users(user_type, created_at)`
        },

        // Providers table - for rating-based queries
        {
          name: "idx_providers_rating_created",
          sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_providers_rating_created 
                ON providers(rating, created_at) 
                WHERE rating IS NOT NULL`
        }
      ];

      for (const index of indexes) {
        try {
          await client.query(index.sql);
          logInfo(`✅ Created index: ${index.name}`);
        } catch (error) {
          // Index might already exist or have naming conflicts
          if (!error.message.includes("already exists")) {
            logError(`❌ Failed to create index ${index.name}:`, error);
          }
        }
      }

      // Partial indexes for specific use cases
      const partialIndexes = [
        {
          name: "idx_appointments_upcoming",
          sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_upcoming 
                ON appointments(appointment_date, appointment_time) 
                WHERE appointment_date >= CURRENT_DATE AND status = 'booked'`
        },
        {
          name: "idx_time_slots_available_today",
          sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_slots_available_today 
                ON time_slots(provider_id, start_time) 
                WHERE day = CURRENT_DATE AND is_available = true AND is_booked = false`
        }
      ];

      for (const index of partialIndexes) {
        try {
          await client.query(index.sql);
          logInfo(`✅ Created partial index: ${index.name}`);
        } catch (error) {
          if (!error.message.includes("already exists")) {
            logError(`❌ Failed to create partial index ${index.name}:`, error);
          }
        }
      }

      await client.query("COMMIT");
      logInfo("🎉 Performance indexes added successfully!");
    } catch (error) {
      await client.query("ROLLBACK");
      logError("❌ Error adding performance indexes:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Optimize existing queries with better patterns
   */
  async optimizeQueries() {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      logInfo("Optimizing database queries...");

      // Create optimized views for common queries
      const views = [
        {
          name: "upcoming_appointments",
          sql: `CREATE OR REPLACE VIEW upcoming_appointments AS
                SELECT
                  a.appointment_id,
                  a.appointment_date,
                  a.appointment_time,
                  a.status,
                  u.name as client_name,
                  u.email as client_email,
                  p.bio as provider_bio,
                  s.service_name as name,
                  s.duration_minutes as duration,
                  s.price
                FROM appointments a
                JOIN users u ON a.user_id = u.user_id
                JOIN providers p ON a.provider_id = p.provider_id
                JOIN services s ON a.service_id = s.service_id
                WHERE a.appointment_date >= CURRENT_DATE
                  AND a.status IN ('booked', 'completed')
                ORDER BY a.appointment_date, a.appointment_time`
        },
        {
          name: "available_slots_view",
          sql: `CREATE OR REPLACE VIEW available_slots_view AS
                SELECT
                  ts.timeslot_id,
                  ts.day,
                  ts.start_time,
                  ts.end_time,
                  ts.is_available,
                  p.bio as provider_bio,
                  s.service_name as name,
                  s.duration_minutes as duration,
                  s.price
                FROM time_slots ts
                JOIN providers p ON ts.provider_id = p.provider_id
                JOIN services s ON ts.service_id = s.service_id
                WHERE ts.is_available = true
                  AND ts.is_booked = false
                  AND ts.day >= CURRENT_DATE
                ORDER BY ts.day, ts.start_time`
        },
        {
          name: "provider_stats",
          sql: `CREATE OR REPLACE VIEW provider_stats AS
                SELECT 
                  p.provider_id,
                  u.name,
                  u.email,
                  p.rating,
                  COUNT(a.appointment_id) as total_appointments,
                  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
                  COUNT(CASE WHEN a.status = 'canceled' THEN 1 END) as canceled_appointments,
                  AVG(CASE WHEN a.status = 'completed' THEN 1.0 ELSE 0 END) * 100 as completion_rate
                FROM providers p
                JOIN users u ON p.user_id = u.user_id
                LEFT JOIN appointments a ON p.provider_id = a.provider_id
                GROUP BY p.provider_id, u.name, u.email, p.rating`
        }
      ];

      for (const view of views) {
        try {
          await client.query(view.sql);
          logInfo(`✅ Created optimized view: ${view.name}`);
        } catch (error) {
          logError(`❌ Failed to create view ${view.name}:`, error);
        }
      }

      await client.query("COMMIT");
      logInfo("🎉 Query optimizations applied successfully!");
    } catch (error) {
      await client.query("ROLLBACK");
      logError("❌ Error optimizing queries:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Enable query performance monitoring
   */
  async enablePerformanceMonitoring() {
    try {
      logInfo("Enabling performance monitoring...");

      // Enable query statistics collection
      await query("LOAD 'pg_stat_statements'");

      // Create performance monitoring function
      await query(`
        CREATE OR REPLACE FUNCTION get_slow_queries(min_calls integer DEFAULT 10, min_time_ms integer DEFAULT 1000)
        RETURNS TABLE (
          query text,
          calls bigint,
          total_time numeric,
          mean_time numeric,
          rows bigint,
          100p_time numeric
        ) AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            query,
            calls,
            total_time,
            mean_time,
            rows,
            percentile_cont(0.100) WITHIN GROUP (ORDER BY total_time) as percentile_100
          FROM pg_stat_statements 
          WHERE calls >= min_calls 
            AND total_time >= (min_time_ms * 1000)  -- Convert to microseconds
          ORDER BY mean_time DESC;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Create function to get index usage statistics
      await query(`
        CREATE OR REPLACE FUNCTION get_index_usage()
        RETURNS TABLE (
          schemaname text,
          tablename text,
          indexname text,
          idx_scan bigint,
          idx_tup_read bigint,
          idx_tup_fetch bigint
        ) AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            schemaname,
            tablename,
            indexname,
            idx_scan,
            idx_tup_read,
            idx_tup_fetch
          FROM pg_stat_user_indexes
          ORDER BY idx_scan DESC;
        END;
        $$ LANGUAGE plpgsql;
      `);

      logInfo("✅ Performance monitoring enabled");
    } catch (error) {
      logError("❌ Error enabling performance monitoring:", error);
      // Don't throw error - monitoring is optional
    }
  }

  /**
   * Analyze and suggest optimizations
   */
  async analyzePerformance() {
    try {
      logInfo("Analyzing database performance...");

      // Get table sizes
      const tableStats = await query(`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_rows,
          n_dead_tup as dead_rows,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC
      `);

      // Get index usage
      const indexUsage = await query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes
        ORDER BY idx_scan DESC
      `);

      // Get slow queries (if pg_stat_statements is available)
      let slowQueries = [];
      try {
        const result = await query("SELECT * FROM get_slow_queries() LIMIT 10");
        slowQueries = result.rows;
      } catch (error) {
        logInfo(
          "pg_stat_statements not available, skipping slow query analysis"
        );
      }

      // Analyze results
      const analysis = {
        tables: tableStats.rows,
        indexes: indexUsage.rows,
        slowQueries: slowQueries,
        recommendations: []
      };

      // Generate recommendations
      if (tableStats.rows) {
        for (const table of tableStats.rows) {
          if (table.dead_rows > table.live_rows * 0.1) {
            analysis.recommendations.push({
              type: "VACUUM",
              table: table.tablename,
              message: `Table ${table.tablename} has high dead tuple ratio (${table.dead_rows}/${table.live_rows}). Consider running VACUUM.`
            });
          }
        }
      }

      if (indexUsage.rows) {
        const unusedIndexes = indexUsage.rows.filter(
          (idx) => idx.idx_scan === 0
        );
        if (unusedIndexes.length > 0) {
          analysis.recommendations.push({
            type: "UNUSED_INDEX",
            indexes: unusedIndexes.map((idx) => idx.indexname),
            message: `${unusedIndexes.length} indexes are never used and should be considered for removal.`
          });
        }
      }

      return analysis;
    } catch (error) {
      logError("❌ Error analyzing performance:", error);
      throw error;
    }
  }

  /**
   * Optimize database configuration
   */
  async optimizeConfiguration() {
    try {
      logInfo("Optimizing database configuration...");

      const optimizations = [
        // Enable automatic statistics collection
        "ALTER SYSTEM SET track_activities = on",
        "ALTER SYSTEM SET track_counts = on",
        "ALTER SYSTEM SET track_io_timing = on",

        // Optimize for mixed read/write workload
        "ALTER SYSTEM SET random_page_cost = 1.1",
        "ALTER SYSTEM SET effective_cache_size = '256MB'",

        // Connection pooling settings
        "ALTER SYSTEM SET max_connections = 100",

        // Memory settings for better performance
        "ALTER SYSTEM SET shared_buffers = '128MB'",
        "ALTER SYSTEM SET work_mem = '4MB'",
        "ALTER SYSTEM SET maintenance_work_mem = '32MB'",

        // Write-ahead logging optimization
        "ALTER SYSTEM SET wal_buffers = '4MB'",
        "ALTER SYSTEM SET checkpoint_completion_target = 0.7",

        // Query planner settings
        "ALTER SYSTEM SET default_statistics_target = 100",
        "ALTER SYSTEM SET constraint_exclusion = partition"
      ];

      for (const sql of optimizations) {
        try {
          await query(sql);
          logInfo(`✅ Applied configuration: ${sql.split(" ")[2]}`);
        } catch (error) {
          logError(`❌ Failed to apply configuration: ${sql}`, error);
        }
      }

      // Reload configuration
      await query("SELECT pg_reload_conf()");

      logInfo("🎉 Database configuration optimized!");
    } catch (error) {
      logError("❌ Error optimizing configuration:", error);
      // Don't throw error - configuration optimization is optional
    }
  }

  /**
   * Clean up database and reclaim space
   */
  async cleanupDatabase() {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      logInfo("Starting database cleanup...");

      // Vacuum and analyze all tables
      await client.query("VACUUM ANALYZE");

      // Reindex all indexes
      await client.query("REINDEX DATABASE current_database()");

      await client.query("COMMIT");

      logInfo("🎉 Database cleanup completed!");
    } catch (error) {
      await client.query("ROLLBACK");
      logError("❌ Error during database cleanup:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get database health status
   */
  async getHealthStatus() {
    try {
      const client = await pool.connect();

      // Database size
      const dbSize = await query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as database_size
      `);

      // Table sizes
      const tableSizes = await query(`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY size_bytes DESC
      `);

      // Index sizes
      const indexSizes = await query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          pg_size_pretty(pg_relation_size(indexrelname)) as index_size,
          pg_relation_size(indexrelname) as index_size_bytes
        FROM pg_stat_user_indexes
        ORDER BY index_size_bytes DESC
      `);

      // Connection stats
      const connectionStats = await query(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections,
          count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
        FROM pg_stat_activity
      `);

      // Cache hit ratio
      const cacheHitRatio = await query(`
        SELECT 
          round(
            (sum(blks_hit) * 100.0) / (sum(blks_hit) + sum(blks_read)), 2
          ) as cache_hit_ratio
        FROM pg_stat_database
        WHERE datname = current_database()
      `);

      client.release();

      return {
        databaseSize: dbSize.rows[0].database_size,
        tables: tableSizes.rows,
        indexes: indexSizes.rows,
        connections: connectionStats.rows[0],
        cacheHitRatio: parseFloat(cacheHitRatio.rows[0].cache_hit_ratio),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logError("❌ Error getting health status:", error);
      throw error;
    }
  }

  /**
   * Run complete optimization process
   */
  async optimize() {
    try {
      logInfo("🚀 Starting complete database optimization...");

      await this.addPerformanceIndexes();
      await this.optimizeQueries();
      await this.enablePerformanceMonitoring();
      await this.optimizeConfiguration();

      const analysis = await this.analyzePerformance();
      const healthStatus = await this.getHealthStatus();

      logInfo("✅ Database optimization completed successfully!");

      return {
        success: true,
        analysis,
        healthStatus,
        recommendations: analysis.recommendations
      };
    } catch (error) {
      logError("❌ Database optimization failed:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export optimizer instance
const databaseOptimizer = new DatabaseOptimizer();

export default databaseOptimizer;
export { DatabaseOptimizer };
