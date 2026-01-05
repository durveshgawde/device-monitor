interface MetricCardProps {
  title: string;
  value?: number;
  unit: string;
  critical?: boolean;
}

export default function MetricCard({ title, value, unit, critical }: MetricCardProps) {
  const displayValue = value != null ? value.toFixed(1) : '--';

  return (
    <div className={`p-6 rounded-lg shadow-lg ${critical ? 'bg-red-50 border-2 border-red-500' : 'bg-white border border-gray-200'
      }`}>
      <div className="flex flex-col">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {title}
        </h3>
        <div className="mt-2 flex items-baseline">
          <span className={`text-3xl font-bold ${critical ? 'text-red-600' : 'text-gray-900'
            }`}>
            {displayValue}
          </span>
          <span className="ml-2 text-xl text-gray-500">{unit}</span>
        </div>
        {critical && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-red-600 text-sm font-semibold">⚠️ Critical</span>
          </div>
        )}
      </div>
    </div>
  );
}
