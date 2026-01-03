import { Anomaly } from '@/types';
import { useState, useEffect } from 'react';

interface AIInsightProps {
  anomaly: Anomaly | Anomaly[];
}

export default function AIInsight({ anomaly }: AIInsightProps) {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the first anomaly if array
        const targetAnomaly = Array.isArray(anomaly) ? anomaly[0] : anomaly;

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/ai/insight`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anomaly: targetAnomaly })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch AI insight');
        }

        const data = await response.json();
        setInsight(data.insight || 'No recommendations available at this time.');
      } catch (err) {
        console.error('AI Insight error:', err);
        setError('Unable to generate AI recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (anomaly) {
      fetchInsight();
    }
  }, [anomaly]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold text-gray-800">AI Recommendations</h3>
        </div>
        <p className="mt-3 text-gray-600 animate-pulse">Analyzing anomaly...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold text-gray-800">AI Recommendations</h3>
        </div>
        <p className="mt-3 text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🤖</span>
        <h3 className="text-lg font-semibold text-gray-800">AI Recommendations</h3>
      </div>
      <div className="mt-3 text-gray-700 whitespace-pre-line">
        {insight}
      </div>
    </div>
  );
}
