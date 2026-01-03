import { Anomaly } from '@/types';

interface AlertPanelProps {
  anomaly: Anomaly | Anomaly[];
}

export default function AlertPanel({ anomaly }: AlertPanelProps) {
  // Handle both single anomaly and array of anomalies
  const anomalies = Array.isArray(anomaly) ? anomaly : [anomaly];

  if (anomalies.length === 0) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'low':
        return 'bg-blue-100 border-blue-500 text-blue-900';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  return (
    <div className="space-y-3">
      {anomalies.map((item) => (
        <div
          key={item.id}
          className={`p-4 rounded-lg border-l-4 ${getSeverityColor(item.severity)}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold uppercase text-sm">{item.severity}</span>
                <span className="text-sm text-gray-600">•</span>
                <span className="text-sm text-gray-600">{item.metric_name}</span>
              </div>
              <p className="mt-1 text-base">{item.message}</p>
              <div className="mt-2 text-sm text-gray-600">
                Value: <span className="font-mono">{item.metric_value.toFixed(2)}</span>
                {item.threshold && (
                  <>
                    {' • Threshold: '}
                    <span className="font-mono">{item.threshold.toFixed(2)}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
