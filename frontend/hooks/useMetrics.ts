import { useEffect, useState } from 'react';
import { Metrics, Anomaly } from '@/types';
import { api } from '@/utils/api';

export function useMetrics() {
    const [history, setHistory] = useState<Metrics[]>([]);
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [historyData, anomaliesData] = await Promise.all([
                    api.getMetricsHistory(1),
                    api.getAnomalies()
                ]);
                setHistory(historyData);
                setAnomalies(anomaliesData);
            } catch (error) {
                console.error('Failed to fetch metrics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Refresh data every 30 seconds
        const interval = setInterval(fetchData, 30000);

        return () => clearInterval(interval);
    }, []);

    return { history, anomalies, loading };
}
