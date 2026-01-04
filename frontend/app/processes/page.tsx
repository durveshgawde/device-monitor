'use client';

import { useMetrics } from '@/hooks/useMetrics';
import { ProcessInfo } from '@/types';
import { useEffect, useState } from 'react';

export default function ProcessesPage() {
    const { loading } = useMetrics();
    const [processes, setProcesses] = useState<ProcessInfo[]>([]);
    const [processesLoading, setProcessesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProcesses = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/processes`);
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const data = await res.json();
                // Ensure data is an array
                setProcesses(Array.isArray(data) ? data : []);
                setError(null);
            } catch (error) {
                console.error('Failed to fetch processes:', error);
                setError('Failed to connect to backend. Make sure the server is running.');
                setProcesses([]);
            } finally {
                setProcessesLoading(false);
            }
        };

        fetchProcesses();
        const interval = setInterval(fetchProcesses, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading || processesLoading) {
        return <div className="text-center py-10">Loading processes...</div>;
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-slate-900">Active Processes</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <span className="text-2xl">⚠️</span>
                    <p className="mt-2 text-red-800">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-300">Active Processes</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">PID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CPU %</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Memory (MB)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {processes.map((proc: ProcessInfo, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900">{proc.pid}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{proc.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{(proc.cpu_percent ?? 0).toFixed(1)}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{(proc.memory_mb ?? 0).toFixed(1)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${proc.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {proc.status || 'unknown'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {processes.length === 0 && (
                <div className="text-center py-10 text-gray-500">No processes found</div>
            )}
        </div>
    );
}
