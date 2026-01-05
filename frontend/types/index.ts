export interface Metrics {
    id: number;
    created_at: string;
    cpu_percent: number;
    memory_percent: number;
    memory_mb: number;
    p50_latency: number;
    p95_latency: number;
    p99_latency: number;
    error_rate: number;
    device_id: string;
    // New metrics
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
    top_process_name?: string;
    top_process_cpu?: number;
    top_process_memory_mb?: number;
    total_processes?: number;
    request_count?: number;
    success_rate?: number;
    avg_response_time?: number;
    p50_response_time?: number;
    p99_response_time?: number;
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

export interface Anomaly {
    id: number;
    created_at: string;
    rule_id: string;
    severity: 'CRITICAL' | 'WARNING' | 'HIGH';
    description: string;
    insights: Array<{
        root_cause: string;
        recommendations: string;
        status: string;
    }>;
}

export interface WebSocketMessage {
    type: 'metrics_update' | 'anomaly' | 'error';
    data: any;
    timestamp: number;
}
