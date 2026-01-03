export interface SystemMetrics {
  timestamp: number;
  cpu_percent: number;
  memory_percent: number;
  memory_mb: number;
  disk_percent?: number;
  cores: number;
  device_id: string;
}

export interface AggregatedMetrics {
  created_at: string;
  cpu_percent: number;
  memory_percent: number;
  p50_latency: number;
  p95_latency: number;
  p99_latency: number;
  error_rate: number;
  device_id: string;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu_percent: number;
  memory_mb: number;
  memory_percent: number;
}

export interface TopProcesses extends ProcessInfo {
  created_at: string;
  device_id: string;
}

export interface Rule {
  id: number;
  name: string;
  condition: string;
  threshold: number;
  severity: 'CRITICAL' | 'WARNING' | 'HIGH';
  enabled: boolean;
}

export interface Anomaly {
  id: number;
  created_at: string;
  rule_id: string;
  severity: string;
  description: string;
  metric_value: number;
  device_id: string;
}

export interface AIInsight {
  rootCause: string;
  recommendations: string;
  status: 'CRITICAL' | 'WARNING' | 'INFO';
}

export interface WebSocketMessage {
  type: 'metrics_update' | 'anomaly' | 'error';
  data: any;
  timestamp: number;
}
