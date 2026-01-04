import { Metrics } from '@/types';

interface TrendChartProps {
  title: string;
  data: Metrics[];
  dataKey: keyof Metrics;
}

export default function TrendChart({ title, data, dataKey }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="text-center text-gray-500 py-8">No data available</div>
      </div>
    );
  }

  // Reverse data to show oldest to newest (backend returns descending order)
  const chartData = [...data].reverse();

  // Calculate min and max for scaling
  const values = chartData.map((d) => {
    const value = d[dataKey];
    return typeof value === 'number' ? value : 0;
  });
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  // Create SVG path for the chart
  const width = 100; // percentage
  const height = 150; // pixels

  // Handle single data point edge case (avoid division by zero)
  const divisor = chartData.length > 1 ? chartData.length - 1 : 1;

  const points = chartData.map((d, i) => {
    const value = typeof d[dataKey] === 'number' ? d[dataKey] : 0;
    const x = (i / divisor) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-red-500">{title}</h3>

      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <line x1="0" y1={height / 4} x2={width} y2={height / 4} stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1="0" y1={(3 * height) / 4} x2={width} y2={(3 * height) / 4} stroke="#e5e7eb" strokeWidth="0.5" />

          {/* Trend line */}
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Fill area under the line */}
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill="url(#gradient)"
            opacity="0.2"
          />

          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>Min: {min.toFixed(2)}</span>
        <span>Max: {max.toFixed(2)}</span>
        <span>Latest: {values[values.length - 1].toFixed(2)}</span>
      </div>
    </div>
  );
}
