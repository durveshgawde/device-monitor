import { Metrics, ProcessInfo, Anomaly } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
    async getMetricsLatest(): Promise<Metrics> {
        const res = await fetch(`${API_URL}/api/metrics/latest`);
        return res.json();
    },

    async getMetricsHistory(hours: number = 1): Promise<Metrics[]> {
        const res = await fetch(`${API_URL}/api/metrics/history?hours=${hours}`);
        return res.json();
    },

    async getProcesses(): Promise<ProcessInfo[]> {
        const res = await fetch(`${API_URL}/api/processes`);
        return res.json();
    },

    async getAnomalies(): Promise<Anomaly[]> {
        const res = await fetch(`${API_URL}/api/anomalies`);
        return res.json();
    },

    async getRules() {
        const res = await fetch(`${API_URL}/api/rules`);
        return res.json();
    },

    async createRule(rule: any) {
        const res = await fetch(`${API_URL}/api/rules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rule)
        });
        return res.json();
    },

    async getChat(message: string): Promise<{ response: string; metrics_used: any }> {
        const res = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        return res.json();
    },

    async getChatHistory(): Promise<any[]> {
        const res = await fetch(`${API_URL}/api/chat/history`);
        return res.json();
    },

    async exportCSV() {
        window.location.href = `${API_URL}/api/export/csv`;
    }
};
