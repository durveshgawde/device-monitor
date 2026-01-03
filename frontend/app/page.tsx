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

  const hasAnomalies = anomalies && anomalies.length > 0;
  const latestAnomaly = hasAnomalies ? anomalies[0] : null;

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
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
          title="P95 Latency"
          value={metrics?.p95_latency}
          unit="ms"
          critical={(metrics?.p95_latency || 0) > 500}
        />
        <MetricCard
          title="Error Rate"
          value={metrics?.error_rate}
          unit="%"
          critical={(metrics?.error_rate || 0) > 5}
        />
      </div>

      {/* Alerts */}
      {hasAnomalies && <AlertPanel anomaly={anomalies} />}

      {/* AI Insights */}
      {latestAnomaly && <AIInsight anomaly={latestAnomaly} />}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendChart title="CPU Trend" data={history} dataKey="cpu_percent" />
        <TrendChart title="Memory Trend" data={history} dataKey="memory_percent" />
        <TrendChart title="Latency Trend" data={history} dataKey="p95_latency" />
        <TrendChart title="Error Rate" data={history} dataKey="error_rate" />
      </div>
    </div>
  );
}
