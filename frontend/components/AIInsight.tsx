import { Anomaly } from '@/types';

interface AIInsightProps {
  anomaly: Anomaly | Anomaly[];
}

// Extended anomaly type that includes insights from the API
interface AnomalyWithInsights extends Anomaly {
  insights?: {
    root_cause: string;
    recommendations: string;
    status: string;
  }[];
}

export default function AIInsight({ anomaly }: AIInsightProps) {
  // Get the first anomaly if array
  const targetAnomaly = (Array.isArray(anomaly) ? anomaly[0] : anomaly) as AnomalyWithInsights;

  // Get insight from the anomaly data (returned by /api/anomalies)
  const insight = targetAnomaly?.insights?.[0];

  if (!insight) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold text-gray-800">AI Recommendations</h3>
        </div>
        <p className="mt-3 text-gray-500">
          AI analysis is being generated. Refresh the page in a moment...
        </p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
    WARNING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    INFO: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const statusColor = statusColors[insight.status] || statusColors.INFO;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold text-gray-800">AI Recommendations</h3>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColor}`}>
          {insight.status}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-600">Root Cause</h4>
          <p className="mt-1 text-gray-800">{insight.root_cause}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-600">Recommendations</h4>
          <p className="mt-1 text-gray-700 whitespace-pre-line">{insight.recommendations}</p>
        </div>
      </div>
    </div>
  );
}

