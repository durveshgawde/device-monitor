'use client';

import { useMetrics } from '@/hooks/useMetrics';
import AlertPanel from '@/components/AlertPanel';

export default function AnomaliesPage() {
    const { anomalies, loading } = useMetrics();

    if (loading) {
        return <div className="text-center py-10">Loading anomalies...</div>;
    }

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">Anomaly Detection</h1>

            <p className="text-gray-600">
                View all detected anomalies and system alerts based on configured rules.
            </p>

            {anomalies.length > 0 ? (
                <AlertPanel anomaly={anomalies} />
            ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                    <span className="text-4xl">✅</span>
                    <h2 className="mt-4 text-xl font-semibold text-green-800">All Systems Normal</h2>
                    <p className="mt-2 text-green-600">No anomalies detected at this time.</p>
                </div>
            )}
        </div>
    );
}
