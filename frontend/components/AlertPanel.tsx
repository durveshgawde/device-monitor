'use client';

import { Anomaly } from '@/types';
import { useState, useEffect } from 'react';

interface AlertPanelProps {
  anomalies: Anomaly[];
}

export default function AlertPanel({ anomalies }: AlertPanelProps) {
  const [now, setNow] = useState(new Date());

  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Show "all clear" alert when no anomalies
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white-800">🚨 Alert</h3>
          <span className="text-xs text-white-500">Updated: {now.toLocaleTimeString()}</span>
        </div>
        <div className="p-4 rounded-lg border-l-4 bg-green-50 border-green-500 text-green-900">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-green-700 text-white text-xs font-bold rounded">ALERT</span>
            <span className="text-xl">✅</span>
            <div>
              <span className="font-semibold">All Systems Normal</span>
              <p className="text-sm text-green-700">No anomalies detected in the last minute.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    const s = severity?.toLowerCase() || '';
    switch (s) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-900';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      default: return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">🚨 Alert ({anomalies.length} issue{anomalies.length > 1 ? 's' : ''})</h3>
        <span className="text-xs text-gray-500">Updated: {now.toLocaleTimeString()}</span>
      </div>
      {anomalies.slice(0, 5).map((item) => (
        <div
          key={item.id}
          className={`p-4 rounded-lg border-l-4 ${getSeverityColor(item.severity)}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-gray-800 text-white text-xs font-bold rounded">ALERT</span>
                <span className="font-semibold uppercase text-sm">{item.severity}</span>
                <span className="text-sm text-gray-600">•</span>
                <span className="text-sm text-gray-600">Rule: {item.rule_id}</span>
              </div>
              <p className="mt-1 text-base">{item.description}</p>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
