'use client';

import { useContext } from 'react';
import { WebSocketContext } from '@/components/WebSocketProvider';
import MetricCard from '@/components/MetricCard';
import TrendChart from '@/components/TrendChart';
import AlertPanel from '@/components/AlertPanel';
import AIInsight from '@/components/AIInsight';
import { useMetrics } from '@/hooks/useMetrics';

export default function Dashboard() {
  const { metrics } = useContext(WebSocketContext);
  const { history, anomalies, loading } = useMetrics();

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  // Get recent anomalies (within last 1 minute for real-time relevance)
  const recentAnomalies = anomalies.filter(a => {
    const anomalyTime = new Date(a.created_at).getTime();
    const oneMinuteAgo = Date.now() - 1 * 60 * 1000;
    return anomalyTime > oneMinuteAgo;
  });

  return (
    <div className="space-y-8">
      {/* System Metrics Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Usage"
          value={metrics?.cpu_percent}
          unit="%"
          critical={(metrics?.cpu_percent || 0) > 80}
        />
        <MetricCard
          title="Memory"
          value={metrics?.memory_percent}
          unit="%"
          critical={(metrics?.memory_percent || 0) > 90}
        />
        <MetricCard
          title="Disk Usage"
          value={metrics?.disk_percent}
          unit="%"
          critical={(metrics?.disk_percent || 0) > 85}
        />
        <MetricCard
          title="Swap"
          value={metrics?.swap_percent}
          unit="%"
          critical={(metrics?.swap_percent || 0) > 80}
        />
      </div>

      {/* System Metrics Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Network In"
          value={metrics?.network_in_mbps}
          unit="Mbps"
        />
        <MetricCard
          title="Network Out"
          value={metrics?.network_out_mbps}
          unit="Mbps"
        />
        <MetricCard
          title="Load Avg (1m)"
          value={metrics?.load_avg_1min}
          unit=""
        />
        <MetricCard
          title="Uptime"
          value={metrics?.uptime_hours}
          unit="hrs"
        />
      </div>

      {/* Performance Metrics Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="P50 Latency"
          value={metrics?.p50_latency}
          unit="ms"
        />
        <MetricCard
          title="P95 Latency"
          value={metrics?.p95_latency}
          unit="ms"
          critical={(metrics?.p95_latency || 0) > 500}
        />
        <MetricCard
          title="P99 Latency"
          value={metrics?.p99_latency}
          unit="ms"
          critical={(metrics?.p99_latency || 0) > 1000}
        />
        <MetricCard
          title="Error Rate"
          value={metrics?.error_rate}
          unit="%"
          critical={(metrics?.error_rate || 0) > 5}
        />
      </div>

      {/* Memory Details Row 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Free Memory"
          value={metrics?.free_memory_mb}
          unit="MB"
        />
        <MetricCard
          title="Total Memory"
          value={metrics?.total_memory_mb}
          unit="MB"
        />
        <MetricCard
          title="Top Process CPU"
          value={metrics?.top_process_cpu}
          unit="%"
        />
        <MetricCard
          title="Total Processes"
          value={metrics?.total_processes}
          unit=""
        />
      </div>

      {/* Alerts */}
      <AlertPanel anomalies={recentAnomalies} />

      {/* AI Insights */}
      <AIInsight anomalies={recentAnomalies} />

      {/* Charts Row 1 - System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendChart title="CPU Trend" data={history} dataKey="cpu_percent" />
        <TrendChart title="Memory Trend" data={history} dataKey="memory_percent" />
      </div>

      {/* Charts Row 2 - Disk & Network */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendChart title="Disk Usage" data={history} dataKey="disk_percent" />
        <TrendChart title="Network In" data={history} dataKey="network_in_mbps" />
      </div>

      {/* Charts Row 3 - Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendChart title="Latency Trend" data={history} dataKey="p95_latency" />
        <TrendChart title="Error Rate" data={history} dataKey="error_rate" />
      </div>

      {/* Charts Row 4 - Load & Uptime */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendChart title="Load Average" data={history} dataKey="load_avg_1min" />
        <TrendChart title="Uptime" data={history} dataKey="uptime_hours" />
      </div>
    </div>
  );
}
