'use client';

import { Anomaly } from '@/types';
import { useState, useEffect } from 'react';

interface AIInsightProps {
  anomalies: Anomaly[];
}

interface HealthCheck {
  message: string;
  timestamp: string;
}

export default function AIInsight({ anomalies }: AIInsightProps) {
  const [now, setNow] = useState(new Date());
  const [healthMessage, setHealthMessage] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch health check when no anomalies
  const fetchHealthCheck = async () => {
    if (anomalies && anomalies.length > 0) return;

    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/api/health-check`);
      if (res.ok) {
        const data = await res.json();
        setHealthMessage(data);
      }
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update every minute
  useEffect(() => {
    fetchHealthCheck();
    const interval = setInterval(() => {
      setNow(new Date());
      fetchHealthCheck();
    }, 60000);
    return () => clearInterval(interval);
  }, [anomalies.length]);

  // Show AI health check message when no anomalies
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-semibold text-gray-800">AI Status</h3>
          </div>
          <span className="text-xs text-green-600">Updated: {now.toLocaleTimeString()}</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="text-green-800 font-medium">All Clear</p>
            <p className="text-green-600 text-sm mt-1">
              {loading ? 'Getting AI status...' : (healthMessage?.message || 'System running normally!')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get the most recent anomaly
  const targetAnomaly = anomalies[0];
  const insight = targetAnomaly?.insights?.[0];

  if (!insight) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-semibold text-gray-800">AI Analysis</h3>
          </div>
          <span className="text-xs text-orange-600">Updated: {now.toLocaleTimeString()}</span>
        </div>
        <div className="mt-4">
          <p className="text-orange-800 font-medium">
            ⏳ Analyzing {anomalies.length} anomal{anomalies.length === 1 ? 'y' : 'ies'}...
          </p>
          <p className="mt-2 text-sm text-orange-700">
            Latest issue: {targetAnomaly.description}
          </p>
          <p className="mt-1 text-xs text-orange-500">
            Detected at: {new Date(targetAnomaly.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
    WARNING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    INFO: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const statusColor = statusColors[insight.status] || statusColors.INFO;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold text-gray-800">AI Recommendations</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColor}`}>
            {insight.status}
          </span>
          <span className="text-xs text-purple-600">Updated: {now.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-600">Root Cause</h4>
          <p className="mt-1 text-gray-800">{insight.root_cause}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-600">Recommendations</h4>
          <p className="mt-1 text-gray-700 whitespace-pre-line">{insight.recommendations}</p>
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          Based on anomaly from: {new Date(targetAnomaly.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
