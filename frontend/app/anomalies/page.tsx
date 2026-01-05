'use client';

import { useState, useEffect } from 'react';
import { useMetrics } from '@/hooks/useMetrics';
import { useStatusLog, StatusCheck } from '@/hooks/useStatusLog';
import { Anomaly } from '@/types';

interface UnifiedAlert {
    id: string;
    timestamp: Date;
    hasError: boolean;
    status: string;
    message: string;
    source: 'status' | 'database';
}

export default function AnomaliesPage() {
    const { statusLog, loading: statusLoading } = useStatusLog();
    const { anomalies, loading: anomaliesLoading } = useMetrics();
    const [syncedTime, setSyncedTime] = useState(new Date());

    // Update synced time every minute
    useEffect(() => {
        const interval = setInterval(() => setSyncedTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const loading = statusLoading || anomaliesLoading;

    if (loading) {
        return <div className="text-center py-10">Loading alerts...</div>;
    }

    // Merge status log and database anomalies into unified timeline
    const statusAlerts: UnifiedAlert[] = statusLog.map((check: StatusCheck) => ({
        id: `status-${check.id}`,
        timestamp: new Date(check.timestamp),
        hasError: check.hasError,
        status: check.status,
        message: check.message,
        source: 'status' as const
    }));

    const dbAlerts: UnifiedAlert[] = anomalies.map((a: Anomaly) => ({
        id: `db-${a.id}`,
        timestamp: new Date(a.created_at),
        hasError: true,
        status: a.severity,
        message: `${a.rule_id} - ${a.description}`,
        source: 'database' as const
    }));

    // Merge and sort by timestamp (newest first)
    const allAlerts = [...statusAlerts, ...dbAlerts].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    // Remove duplicates (same timestamp within 2 seconds = same check)
    const uniqueAlerts = allAlerts.filter((alert, index, self) => {
        const isDuplicate = self.findIndex(a =>
            Math.abs(a.timestamp.getTime() - alert.timestamp.getTime()) < 2000 &&
            a.hasError === alert.hasError
        ) !== index;
        return !isDuplicate;
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">🚨 Alert Timeline</h1>
                <span className="text-sm text-gray-400">Updated: {syncedTime.toLocaleTimeString()}</span>
            </div>
            <p className="text-gray-400">All status checks and alerts. Newest at top. ({uniqueAlerts.length} total)</p>

            {uniqueAlerts.length > 0 ? (
                <div className="space-y-3">
                    {uniqueAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`p-4 rounded-lg border-l-4 ${alert.hasError
                                    ? 'bg-yellow-100 border-yellow-500 text-yellow-900'
                                    : 'bg-green-100 border-green-500 text-green-900'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 text-white text-xs font-bold rounded ${alert.hasError ? 'bg-yellow-600' : 'bg-green-600'
                                            }`}>
                                            {alert.status}
                                        </span>
                                        {alert.hasError ? (
                                            <span className="text-lg">⚠️</span>
                                        ) : (
                                            <span className="text-lg">✅</span>
                                        )}
                                    </div>
                                    <p className="mt-2 text-base">{alert.message}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono font-bold">
                                        {alert.timestamp.toLocaleTimeString()}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {alert.timestamp.toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 text-center">
                    <span className="text-3xl">⏳</span>
                    <h2 className="mt-4 text-xl font-semibold text-blue-300">Waiting for checks...</h2>
                    <p className="mt-2 text-blue-400">Status checks appear every minute as the backend runs.</p>
                </div>
            )}
        </div>
    );
}
