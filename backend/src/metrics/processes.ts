import { ProcessInfo } from '../types/metrics';
import { logger } from '../utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

async function getWindowsProcesses(): Promise<ProcessInfo[]> {
  try {
    // Use PowerShell Get-Process with CSV output for reliable parsing
    const command = `powershell -Command "Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 20 Id,ProcessName,WorkingSet64 | ConvertTo-Csv -NoTypeInformation"`;
    const { stdout } = await execAsync(command);
    const lines = stdout.trim().split('\n').slice(1); // Skip CSV header

    const processes: ProcessInfo[] = lines
      .filter(line => line.trim())
      .map(line => {
        // Parse CSV: "Id","ProcessName","WorkingSet64"
        const match = line.match(/"?(\d+)"?,"?([^"]+)"?,"?(\d+)"?/);
        if (!match) return null;

        const pid = parseInt(match[1]) || 0;
        const name = match[2] || 'Unknown';
        const workingSetSize = parseInt(match[3]) || 0;

        if (!pid) return null;

        return {
          pid,
          name,
          cpu_percent: 0,
          memory_mb: workingSetSize / (1024 * 1024),
          memory_percent: (workingSetSize / (os.totalmem())) * 100,
          status: 'running'
        };
      })
      .filter((p): p is ProcessInfo => p !== null)
      .filter(p => p.memory_mb > 10)
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
          memory_percent: memPercent,
          status: 'running' // Active processes are running
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
