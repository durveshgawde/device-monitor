export interface Metrics {
    timestamp: string;
    cpu_percent: number;
    memory_percent: number;
    disk_usage_percent: number;
    network_sent_mbps: number;
    network_recv_mbps: number;
    p95_latency: number;
    error_rate: number;
    active_connections: number;
}

export interface ProcessInfo {
    pid: number;
    name: string;
    cpu_percent: number;
    memory_mb: number;
    status: string;
}

export interface Anomaly {
    id: number;
    created_at: string;
    rule_id: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    metric_name: string;
    metric_value: number;
    threshold?: number;
}

export interface Rule {
    id: number;
    name: string;
    metric: string;
    condition: 'gt' | 'lt' | 'eq';
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
    created_at: string;
}
