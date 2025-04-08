// components/charts/GPUPerformanceChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const GPUPerformanceChart = ({ data, onGpuSelect }) => {
  const [width, setWidth] = React.useState(0);
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    if (chartRef.current) {
      setWidth(chartRef.current.clientWidth);
    }

    const handleResize = () => {
      if (chartRef.current) {
        setWidth(chartRef.current.clientWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

  // Ensure we have valid data in the expected format
  const validData = Array.isArray(data) && data.length > 0 && data.every(item =>
    item && typeof item === 'object' &&
    'name' in item &&
    'avgFPS' in item &&
    !isNaN(item.avgFPS)
  );

  const handleBarClick = (data, index) => {
    if (onGpuSelect && data && data.name) {
      onGpuSelect(data.name);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-xs">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p>Average FPS: <span className="font-medium">{payload[0].value.toFixed(1)}</span></p>
          <p>Sample Size: {payload[0].payload.count}</p>
          <p className="text-blue-600 text-xs mt-1">Click for details</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm w-full" ref={chartRef}>
      <div className="flex flex-col mb-3">
        <h2 className="font-medium text-base text-gray-800">Top 15 GPUs by Average FPS</h2>
        <p className="text-xs text-blue-600 mt-1">Click on any GPU bar for detailed analysis</p>
      </div>
      {validData ? (
        <div className="w-full">
          <BarChart
            width={width || 500}
            height={350}
            data={data}
            margin={{ top: 5, right: 20, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              label={{ value: 'Average FPS', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
              tick={{ fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="avgFPS"
              fill="#82ca9d"
              name="Average FPS"
              onClick={handleBarClick}
              cursor="pointer"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center p-4">
            <p className="text-sm">No GPU performance data available</p>
            <p className="text-xs mt-1 text-gray-400">Try adjusting your filter settings</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GPUPerformanceChart;

