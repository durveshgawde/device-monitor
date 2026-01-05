'use client';

import { useState, useEffect } from 'react';

interface StatusCheck {
    id: number;
    timestamp: string;
    hasError: boolean;
    status: 'OK' | 'WARNING' | 'CRITICAL';
    message: string;
    cpu_percent: number;
    memory_percent: number;
}

export default function AnomaliesPage() {
    const [statusLog, setStatusLog] = useState<StatusCheck[]>([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());

    const fetchStatusLog = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/status-log`);
            if (res.ok) {
                const data = await res.json();
                setStatusLog(data);
            }
        } catch (error) {
            console.error('Failed to fetch status log:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch on load and every 10 seconds
    useEffect(() => {
        fetchStatusLog();
        const interval = setInterval(() => {
            setNow(new Date());
            fetchStatusLog();
        }, 10000); // Check every 10 seconds for new entries
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <div className="text-center py-10">Loading status log...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white-900">🚨 Alert Timeline</h1>
                <div className="text-right">
                    <span className="text-sm text-white-500">Updated: {now.toLocaleTimeString()}</span>
                    <p className="text-xs text-white-400">{statusLog.length} checks</p>
                </div>
            </div>

            <p className="text-white-600">Status checks logged every minute by the backend. Newest at top.</p>

            {statusLog.length > 0 ? (
                <div className="space-y-3">
                    {statusLog.map((check) => (
                        <div
                            key={check.id}
                            className={`p-4 rounded-lg border-l-4 ${check.hasError
                                ? 'bg-yellow-50 border-yellow-500 text-yellow-900'
                                : 'bg-green-50 border-green-500 text-green-900'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 text-white text-xs font-bold rounded ${check.hasError ? 'bg-yellow-600' : 'bg-green-600'
                                            }`}>
                                            {check.status}
                                        </span>
                                        {!check.hasError && <span className="text-lg">✅</span>}
                                        {check.hasError && <span className="text-lg">⚠️</span>}
                                    </div>
                                    <p className="mt-2 text-base">{check.message}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono font-bold">
                                        {new Date(check.timestamp).toLocaleTimeString()}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(check.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <span className="text-3xl">⏳</span>
                    <h2 className="mt-4 text-xl font-semibold text-blue-800">Waiting for checks...</h2>
                    <p className="mt-2 text-blue-600">Status checks will appear here every minute as the backend collects metrics.</p>
                    <p className="mt-1 text-sm text-blue-500">Make sure the backend is running!</p>
                    <button
                        onClick={() => { setLoading(true); fetchStatusLog(); }}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry Fetch
                    </button>
                </div>
            )}
        </div>
    );
}
