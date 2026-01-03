import os from 'os';
import { SystemMetrics, AggregatedMetrics } from '../types/metrics';
import { storeMetrics } from './database';
import { logger } from '../utils/logger';
import { env } from '../utils/env';

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
    
    return {
      timestamp: Date.now(),
      cpu_percent: cpuPercent,
      memory_percent: memoryPercent,
      memory_mb: (totalMemory - freeMemory) / 1024 / 1024,
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
      cores: 0,
      device_id: env.DEVICE_ID
    };
  }
}

export async function aggregateAndStore(): Promise<AggregatedMetrics | null> {
  if (metricsBuffer.length === 0) return null;
  
  try {
    // Calculate averages
    const avgCpu = metricsBuffer.reduce((sum, m) => sum + m.cpu_percent, 0) / metricsBuffer.length;
    const avgMemory = metricsBuffer.reduce((sum, m) => sum + m.memory_percent, 0) / metricsBuffer.length;
    
    // Calculate percentiles (mock data for now)
    const latencies = metricsBuffer.map((_, i) => (i * 10 + 150) % 1000).sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];
    
    const aggregated: AggregatedMetrics = {
      created_at: new Date().toISOString(),
      cpu_percent: parseFloat(avgCpu.toFixed(2)),
      memory_percent: parseFloat(avgMemory.toFixed(2)),
      p50_latency: p50,
      p95_latency: p95,
      p99_latency: p99,
      error_rate: parseFloat((Math.random() * 5).toFixed(3)),
      device_id: env.DEVICE_ID
    };
    
    // Store in Supabase
    const success = await storeMetrics(aggregated);
    
    if (success) {
      metricsBuffer = [];
      logger.debug('Metrics aggregated and stored');
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
