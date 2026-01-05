export interface SystemMetrics {
  timestamp: number;
  cpu_percent: number;
  memory_percent: number;
  memory_mb: number;
  disk_percent?: number;
  cores: number;
  device_id: string;
  // New metrics
  network_in_mbps?: number;
  network_out_mbps?: number;
  load_avg_1min?: number;
  uptime_hours?: number;
  free_memory_mb?: number;
  total_memory_mb?: number;
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
  // System metrics
  disk_percent?: number;
  network_in_mbps?: number;
  network_out_mbps?: number;
  load_avg_1min?: number;
  load_avg_5min?: number;
  load_avg_15min?: number;
  uptime_hours?: number;
  free_memory_mb?: number;
  total_memory_mb?: number;
  swap_percent?: number;
  // Process metrics
  top_process_name?: string;
  top_process_cpu?: number;
  top_process_memory_mb?: number;
  total_processes?: number;
  // Application metrics
  request_count?: number;
  success_rate?: number;
  avg_response_time?: number;
  p50_response_time?: number;
  p99_response_time?: number;
  // Database metrics
  anomaly_count_24h?: number;
  resolved_anomalies?: number;
  total_rules?: number;
  enabled_rules?: number;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu_percent: number;
  memory_mb: number;
  memory_percent: number;
  status: string;
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
