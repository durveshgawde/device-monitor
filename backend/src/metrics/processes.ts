import { ProcessInfo } from '../types/metrics';
import { logger } from '../utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

async function getWindowsProcesses(): Promise<ProcessInfo[]> {
  try {
    const { stdout } = await execAsync('wmic process get processid,name,workingsetsize /format:csv');
    const lines = stdout.trim().split('\n').slice(1); // Skip header

    const processes: ProcessInfo[] = lines
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split(',');
        if (parts.length < 4) return null;

        const name = parts[1] || 'Unknown';
        const workingSetSize = parseInt(parts[2]) || 0;
        const pid = parseInt(parts[3]) || 0;

        if (!pid) return null;

        return {
          pid,
          name,
          cpu_percent: 0, // WMIC doesn't easily provide CPU percent
          memory_mb: workingSetSize / (1024 * 1024),
          memory_percent: (workingSetSize / (os.totalmem())) * 100
        };
      })
      .filter((p): p is ProcessInfo => p !== null)
      .filter(p => p.memory_mb > 10)
      .sort((a, b) => b.memory_mb - a.memory_mb)
      .slice(0, 15);

    return processes;
  } catch (error) {
    logger.error('Failed to get Windows processes:', error);
    return [];
  }
}

async function getUnixProcesses(): Promise<ProcessInfo[]> {
  try {
    const { stdout } = await execAsync('ps aux --sort=-%mem | head -n 16');
    const lines = stdout.trim().split('\n').slice(1); // Skip header

    const processes: ProcessInfo[] = lines
      .map(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 11) return null;

        const pid = parseInt(parts[1]) || 0;
        const cpuPercent = parseFloat(parts[2]) || 0;
        const memPercent = parseFloat(parts[3]) || 0;
        const name = parts.slice(10).join(' ');

        if (!pid) return null;

        return {
          pid,
          name,
          cpu_percent: cpuPercent,
          memory_mb: (os.totalmem() * memPercent / 100) / (1024 * 1024),
          memory_percent: memPercent
        };
      })
      .filter((p): p is ProcessInfo => p !== null);

    return processes;
  } catch (error) {
    logger.error('Failed to get Unix processes:', error);
    return [];
  }
}

export async function collectProcessMetrics(): Promise<ProcessInfo[]> {
  try {
    if (process.platform === 'win32') {
      return await getWindowsProcesses();
    } else {
      return await getUnixProcesses();
    }
  } catch (error) {
    logger.error('Process metrics collection failed:', error);
    return [];
  }
}
