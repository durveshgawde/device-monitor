'use client';

import { useState, useEffect } from 'react';

export interface StatusCheck {
    id: number;
    timestamp: string;
    hasError: boolean;
    status: 'OK' | 'WARNING' | 'CRITICAL';
    message: string;
    cpu_percent: number;
    memory_percent: number;
}

export function useStatusLog() {
    const [statusLog, setStatusLog] = useState<StatusCheck[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastCheck, setLastCheck] = useState<StatusCheck | null>(null);

    const fetchStatusLog = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/status-log`);
            if (res.ok) {
                const data = await res.json();
                setStatusLog(data);
                if (data.length > 0) {
                    setLastCheck(data[0]); // Most recent check
                }
            }
        } catch (error) {
            console.error('Failed to fetch status log:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatusLog();
        const interval = setInterval(fetchStatusLog, 10000); // Every 10 seconds
        return () => clearInterval(interval);
    }, []);

    return { statusLog, lastCheck, loading, refetch: fetchStatusLog };
}
