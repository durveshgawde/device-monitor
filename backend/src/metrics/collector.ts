import os from 'os';
import { SystemMetrics, AggregatedMetrics } from '../types/metrics';
import { storeMetrics } from './database';
import { logger } from '../utils/logger';
import { env } from '../utils/env';
import { getSystemStats } from './system';
import { collectProcessMetrics } from './processes';

let metricsBuffer: SystemMetrics[] = [];

export function collectSystemMetrics(): SystemMetrics {
  try {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    // Calculate CPU percentage
    let totalIdle = 0, totalTick = 0;
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += (cpu.times as any)[type];
      }
      totalIdle += cpu.times.idle;
    });

    const cpuPercent = Math.min(100 - ~~(100 * totalIdle / totalTick), 100);
    const memoryPercent = ((totalMemory - freeMemory) / totalMemory) * 100;

    // ← NEW: Get additional system stats
    const systemStats = getSystemStats();

    return {
      timestamp: Date.now(),
      cpu_percent: cpuPercent,
      memory_percent: memoryPercent,
      memory_mb: (totalMemory - freeMemory) / 1024 / 1024,
      disk_percent: systemStats.disk_percent,
      network_in_mbps: systemStats.network_in_mbps,
      network_out_mbps: systemStats.network_out_mbps,
      load_avg_1min: systemStats.load_avg_1min,
      uptime_hours: systemStats.uptime_hours,
      free_memory_mb: systemStats.free_memory_mb,
      total_memory_mb: systemStats.total_memory_mb,
      cores: cpus.length,
      device_id: env.DEVICE_ID
    };
  } catch (error) {
    logger.error('System metrics collection failed:', error);
    return {
      timestamp: Date.now(),
      cpu_percent: 0,
      memory_percent: 0,
      memory_mb: 0,
      disk_percent: 0,
      network_in_mbps: 0,
      network_out_mbps: 0,
      load_avg_1min: 0,
      uptime_hours: 0,
      free_memory_mb: 0,
      total_memory_mb: 0,
      cores: 0,
      device_id: env.DEVICE_ID
    };
  }
}

export async function aggregateAndStore(): Promise<AggregatedMetrics | null> {
  if (metricsBuffer.length === 0) return null;

  try {
    // Calculate averages for system metrics
    const avgCpu = metricsBuffer.reduce((sum, m) => sum + m.cpu_percent, 0) / metricsBuffer.length;
    const avgMemory = metricsBuffer.reduce((sum, m) => sum + m.memory_percent, 0) / metricsBuffer.length;
    const avgDisk = metricsBuffer.reduce((sum, m) => sum + (m.disk_percent || 0), 0) / metricsBuffer.length;
    const avgNetIn = metricsBuffer.reduce((sum, m) => sum + (m.network_in_mbps || 0), 0) / metricsBuffer.length;
    const avgNetOut = metricsBuffer.reduce((sum, m) => sum + (m.network_out_mbps || 0), 0) / metricsBuffer.length;
    const avgLoad1 = metricsBuffer.reduce((sum, m) => sum + (m.load_avg_1min || 0), 0) / metricsBuffer.length;
    const avgLoad5 = metricsBuffer.reduce((sum, m) => sum + (m.load_avg_1min || 0), 0) / metricsBuffer.length;
    const avgLoad15 = metricsBuffer.reduce((sum, m) => sum + (m.load_avg_1min || 0), 0) / metricsBuffer.length;
    const latestUptime = metricsBuffer[metricsBuffer.length - 1]?.uptime_hours || 0;
    const avgFreeMem = metricsBuffer.reduce((sum, m) => sum + (m.free_memory_mb || 0), 0) / metricsBuffer.length;
    const latestTotalMem = metricsBuffer[metricsBuffer.length - 1]?.total_memory_mb || 0;

    // Get current system stats for swap (real value, not mocked)
    const systemStats = getSystemStats();

    // Get real process data
    const processes = await collectProcessMetrics();
    const topProcess = processes.length > 0 ? processes[0] : null;
    const totalProcesses = processes.length;

    const aggregated: AggregatedMetrics = {
      created_at: new Date().toISOString(),
      cpu_percent: parseFloat(avgCpu.toFixed(2)),
      memory_percent: parseFloat(avgMemory.toFixed(2)),
      p50_latency: 0, // No real HTTP tracking - set to 0
      p95_latency: 0, // No real HTTP tracking - set to 0
      p99_latency: 0, // No real HTTP tracking - set to 0
      error_rate: 0, // No real HTTP tracking - set to 0
      device_id: env.DEVICE_ID,
      // System stats
      disk_percent: parseFloat(avgDisk.toFixed(2)),
      network_in_mbps: parseFloat(avgNetIn.toFixed(2)),
      network_out_mbps: parseFloat(avgNetOut.toFixed(2)),
      load_avg_1min: parseFloat(avgLoad1.toFixed(2)),
      load_avg_5min: parseFloat(avgLoad5.toFixed(2)),
      load_avg_15min: parseFloat(avgLoad15.toFixed(2)),
      uptime_hours: parseFloat(latestUptime.toFixed(2)),
      free_memory_mb: parseFloat(avgFreeMem.toFixed(2)),
      total_memory_mb: parseFloat(latestTotalMem.toFixed(2)),
      swap_percent: parseFloat(systemStats.swap_percent.toFixed(2)), // Real swap value
      // Process data
      top_process_name: topProcess?.name || undefined,
      top_process_cpu: topProcess?.cpu_percent || undefined,
      top_process_memory_mb: topProcess?.memory_mb || undefined,
      total_processes: totalProcesses || undefined
    };

    // Store in Supabase
    const success = await storeMetrics(aggregated);

    if (success) {
      metricsBuffer = [];
      logger.debug('Metrics aggregated and stored');
      // Status checks are now handled by detector.ts
    }

    return aggregated;
  } catch (error) {
    logger.error('Aggregation failed:', error);
    return null;
  }
}

export function startMetricsCollection(): void {
  // Collect every 1 second
  setInterval(() => {
    const metrics = collectSystemMetrics();
    metricsBuffer.push(metrics);
  }, 1000);

  // Aggregate every 60 seconds
  setInterval(() => {
    aggregateAndStore();
  }, 60000);

  logger.info('✅ Metrics collection started');
}

export function getBufferedMetrics(): SystemMetrics[] {
  return metricsBuffer;
}

// Status check log - stores each minute's status
interface StatusCheck {
  id: number;
  timestamp: string;
  hasError: boolean;
  status: 'OK' | 'WARNING' | 'CRITICAL';
  message: string;
  cpu_percent: number;
  memory_percent: number;
}

let statusLog: StatusCheck[] = [];
let statusCheckId = 0;

export function addStatusCheck(metrics: AggregatedMetrics | null, hasAnomaly: boolean, anomalyMessage?: string): void {
  const check: StatusCheck = {
    id: statusCheckId++,
    timestamp: new Date().toISOString(),
    hasError: hasAnomaly,
    status: hasAnomaly ? 'WARNING' : 'OK',
    message: hasAnomaly && anomalyMessage
      ? anomalyMessage
      : `System check complete - CPU: ${metrics?.cpu_percent?.toFixed(1) || 0}%, Memory: ${metrics?.memory_percent?.toFixed(1) || 0}%`,
    cpu_percent: metrics?.cpu_percent || 0,
    memory_percent: metrics?.memory_percent || 0
  };

  statusLog.unshift(check); // Add to beginning (newest first)
  if (statusLog.length > 60) {
    statusLog = statusLog.slice(0, 60); // Keep last 60 checks (1 hour)
  }
}

export function getStatusLog(): StatusCheck[] {
  return statusLog;
}
