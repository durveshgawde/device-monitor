'use client';

import { StatusCheck } from '@/hooks/useStatusLog';

interface AlertPanelProps {
  lastCheck: StatusCheck | null;
  loading?: boolean;
}

export default function AlertPanel({ lastCheck, loading }: AlertPanelProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">🚨 Alert</h3>
        <div className="p-4 rounded-lg bg-slate-700 animate-pulse">
          <p className="text-gray-400">Loading status...</p>
        </div>
      </div>
    );
  }

  if (!lastCheck) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">🚨 Alert</h3>
          <span className="text-xs text-gray-400">Waiting for check...</span>
        </div>
        <div className="p-4 rounded-lg border-l-4 bg-blue-50 border-blue-500 text-blue-900">
          <p>Waiting for first status check from backend...</p>
        </div>
      </div>
    );
  }

  const timestamp = new Date(lastCheck.timestamp).toLocaleTimeString();

  if (!lastCheck.hasError) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">🚨 Alert</h3>
          <span className="text-xs text-gray-400">Updated: {timestamp}</span>
        </div>
        <div className="p-4 rounded-lg border-l-4 bg-green-50 border-green-500 text-green-900">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-green-700 text-white text-xs font-bold rounded">OK</span>
            <span className="text-xl">✅</span>
            <div>
              <span className="font-semibold">All Systems Normal</span>
              <p className="text-sm text-green-700">{lastCheck.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Has error
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">🚨 Alert</h3>
        <span className="text-xs text-gray-400">Updated: {timestamp}</span>
      </div>
      <div className="p-4 rounded-lg border-l-4 bg-yellow-100 border-yellow-500 text-yellow-900">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs font-bold rounded">
            {lastCheck.status}
          </span>
          <span className="text-xl">⚠️</span>
          <div>
            <span className="font-semibold">Issue Detected</span>
            <p className="text-sm text-yellow-800">{lastCheck.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
