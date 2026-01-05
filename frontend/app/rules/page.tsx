'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';

interface Rule {
    id: number;
    name: string;
    condition: string;
    threshold: number;
    severity: 'CRITICAL' | 'WARNING' | 'HIGH';
    enabled: boolean;
}

export default function RulesPage() {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        condition: '',
        threshold: '',
        severity: 'WARNING'
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Fetch rules on mount
    useEffect(() => {
        fetchRules();
    }, []);

    async function fetchRules() {
        try {
            setLoading(true);
            const data = await api.getRules();
            setRules(data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to fetch rules' });
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!formData.name || !formData.condition || !formData.threshold) {
            setMessage({ type: 'error', text: 'All fields are required' });
            return;
        }

        try {
            setSubmitting(true);
            const newRule = {
                name: formData.name,
                condition: formData.condition,
                threshold: parseFloat(formData.threshold),
                severity: formData.severity
            };

            await api.createRule(newRule);

            // Reset form
            setFormData({ name: '', condition: '', threshold: '', severity: 'WARNING' });
            setShowForm(false);
            setMessage({ type: 'success', text: 'Rule created successfully!' });

            // Refresh rules
            await fetchRules();

            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to create rule' });
        } finally {
            setSubmitting(false);
        }
    }

    const conditionOptions = [
        { value: 'cpu_percent', label: 'CPU Usage (%)' },
        { value: 'memory_percent', label: 'Memory Usage (%)' },
        { value: 'p95_latency', label: 'P95 Latency (ms)' },
        { value: 'error_rate', label: 'Error Rate (%)' },
        { value: 'memory_mb', label: 'Memory (MB)' }
    ];

    const severityOptions = [
        { value: 'INFO', label: 'ℹ️ Info' },
        { value: 'WARNING', label: '🟡 Warning' },
        { value: 'HIGH', label: '🟠 High' },
        { value: 'CRITICAL', label: '🔴 Critical' }
    ];

    if (loading) {
        return <div className="text-center py-10">Loading rules...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">📋 Monitoring Rules</h1>
                    <p className="text-gray-600 mt-2">Define custom alerts and thresholds</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                    {showForm ? '✕ Cancel' : '+ New Rule'}
                </button>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success'
                    ? 'bg-green-100 border border-green-500 text-green-900'
                    : 'bg-red-100 border border-red-500 text-red-900'
                    }`}>
                    {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
            )}

            {/* Create Rule Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-gray-200">
                    <h2 className="text-xl font-semibold mb-6 text-slate-900">Create New Rule</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Rule Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-900">Rule Name</label>
                            <input
                                type="text"
                                placeholder="e.g., High CPU Alert, Memory Spike"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-500"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1 text-slate-500">Unique name for this rule</p>
                        </div>

                        {/* Condition */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-900">Metric Condition</label>
                            <select
                                value={formData.condition}
                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-500"
                                required
                            >
                                <option value="">Select a metric...</option>
                                {conditionOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Threshold */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-900">Threshold Value</label>
                            <input
                                type="number"
                                placeholder="e.g., 80 for CPU > 80%"
                                value={formData.threshold}
                                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-500"
                                step="0.1"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Trigger alert when metric exceeds this value</p>
                        </div>

                        {/* Severity */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-900">Severity Level</label>
                            <select
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-500"
                            >
                                {severityOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                            >
                                {submitting ? '⏳ Creating...' : '✓ Create Rule'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setFormData({ name: '', condition: '', threshold: '', severity: 'WARNING' });
                                }}
                                className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Rules List */}
            <div className="space-y-4">
                {rules.length === 0 ? (
                    <div className="bg-gray-50 p-8 rounded-lg text-center border-2 border-dashed border-gray-300">
                        <p className="text-gray-600 text-lg">No rules configured yet</p>
                        <p className="text-gray-500">Click "New Rule" to create your first monitoring rule</p>
                    </div>
                ) : (
                    rules.map((rule) => (
                        <div
                            key={rule.id}
                            className="bg-white p-6 rounded-lg shadow border-l-4"
                            style={{
                                borderLeftColor: rule.severity === 'CRITICAL' ? '#ef4444' :
                                    rule.severity === 'HIGH' ? '#f97316' : '#eab308'
                            }}
                        >
                            {/* Rule Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{rule.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Rule ID: {rule.id}
                                    </p>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${rule.severity === 'CRITICAL' ? 'bg-red-100 text-red-900' :
                                        rule.severity === 'HIGH' ? 'bg-orange-100 text-orange-900' :
                                            'bg-yellow-100 text-yellow-900'
                                        }`}>
                                        {rule.severity === 'CRITICAL' ? '🔴' :
                                            rule.severity === 'HIGH' ? '🟠' : '🟡'} {rule.severity}
                                    </span>

                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${rule.enabled
                                        ? 'bg-green-100 text-green-900'
                                        : 'bg-gray-100 text-gray-900'
                                        }`}>
                                        {rule.enabled ? '✓ Active' : '○ Inactive'}
                                    </span>
                                </div>
                            </div>

                            {/* Rule Details */}
                            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200">
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Metric</p>
                                    <p className="text-sm font-mono text-gray-900 mt-1">
                                        {conditionOptions.find(c => c.value === rule.condition)?.label || rule.condition}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Threshold</p>
                                    <p className="text-sm font-mono text-gray-900 mt-1">
                                        {rule.threshold} {
                                            rule.condition.includes('percent') ? '%' :
                                                rule.condition.includes('latency') ? 'ms' :
                                                    rule.condition.includes('memory') ? 'MB' : ''
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Condition</p>
                                    <p className="text-sm text-gray-900 mt-1">
                                        When <strong>{rule.condition}</strong> &gt; <strong>{rule.threshold}</strong>
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mt-4">
                                🔔 Triggers a <span className="font-semibold">{rule.severity}</span> alert when {rule.condition} exceeds {rule.threshold}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Info Section */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">💡 How Rules Work</h3>
                <ul className="space-y-2 text-sm text-blue-900">
                    <li>✓ Rules are checked every <strong>60 seconds</strong></li>
                    <li>✓ When a threshold is exceeded, an <strong>anomaly</strong> is created</li>
                    <li>✓ OpenRouter AI analyzes the anomaly for <strong>root cause</strong></li>
                    <li>✓ Recommendations are stored and shown on the dashboard</li>
                    <li>✓ All rules are <strong>enabled by default</strong></li>
                </ul>
            </div>
        </div>
    );
}
