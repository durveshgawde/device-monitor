import pidusage from 'pidusage';
import { ProcessInfo } from '../types/metrics';
import { logger } from '../utils/logger';

export async function collectProcessMetrics(): Promise<ProcessInfo[]> {
  try {
    // Use pidusage.processes() to get all running processes
    const processes = await pidusage.processes();

    const processArray: ProcessInfo[] = Object.entries(processes)
      .map(([pid, stats]: [string, any]) => ({
        pid: parseInt(pid),
        name: stats.comm || stats.cmd || pid,
        cpu_percent: stats.cpu || 0,
        memory_mb: (stats.memory || 0) / 1024 / 1024,
        memory_percent: stats.memory_percent || 0
      }))
      .filter(p => p.memory_mb > 10)
      .sort((a, b) => b.cpu_percent - a.cpu_percent)
      .slice(0, 15);

    return processArray;
  } catch (error) {
    logger.error('Process metrics collection failed:', error);
    return [];
  }
}
