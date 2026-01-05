'use client';

import { StatusCheck } from '@/hooks/useStatusLog';
import { Anomaly } from '@/types';

interface AIInsightProps {
  lastCheck: StatusCheck | null;
  anomalies: Anomaly[];
  loading?: boolean;
}

export default function AIInsight({ lastCheck, anomalies, loading }: AIInsightProps) {
  if (loading) {
    return (
      <div className="bg-slate-700 p-6 rounded-lg animate-pulse">
        <h3 className="text-lg font-semibold text-white">🤖 AI Recommendations</h3>
        <p className="text-gray-400 mt-2">Loading...</p>
      </div>
    );
  }

  const timestamp = lastCheck ? new Date(lastCheck.timestamp).toLocaleTimeString() : 'N/A';

  // No anomalies - all clear
  if (!lastCheck?.hasError || anomalies.length === 0) {
    return (
      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-6 rounded-lg border border-green-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-semibold text-white">AI Status</h3>
          </div>
          <span className="text-xs text-green-400">Updated: {timestamp}</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="text-green-300 font-medium">All Clear</p>
            <p className="text-green-400 text-sm mt-1">
              {lastCheck?.message || 'System running normally!'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get the most recent anomaly with insights
  const targetAnomaly = anomalies[0];
  const insight = targetAnomaly?.insights?.[0];

  if (!insight) {
    return (
      <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-6 rounded-lg border border-yellow-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
          </div>
          <span className="text-xs text-orange-400">Updated: {timestamp}</span>
        </div>
        <div className="mt-4">
          <p className="text-orange-300 font-medium">⏳ Analyzing issue...</p>
          <p className="mt-2 text-sm text-orange-400">{lastCheck.message}</p>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    CRITICAL: 'bg-red-900/50 text-red-300 border-red-700',
    WARNING: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    INFO: 'bg-blue-900/50 text-blue-300 border-blue-700'
  };

  const statusColor = statusColors[insight.status] || statusColors.INFO;

  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusColor}`}>
            {insight.status}
          </span>
          <span className="text-xs text-purple-400">Updated: {timestamp}</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-400">Root Cause</h4>
          <p className="mt-1 text-white">{insight.root_cause}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-400">Recommendations</h4>
          <p className="mt-1 text-gray-300 whitespace-pre-line">{insight.recommendations}</p>
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
          Based on: {lastCheck.message}
        </div>
      </div>
    </div>
  );
}
