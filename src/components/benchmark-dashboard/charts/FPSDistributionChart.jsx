// components/charts/FPSDistributionChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

const FPSDistributionChart = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Ensure we have valid data in the expected format
  const validData = Array.isArray(data) && data.length > 0 && data.every(item =>
    item && typeof item === 'object' &&
    'range' in item &&
    'count' in item &&
    !isNaN(item.count)
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="font-bold text-lg mb-4">FPS Distribution</h2>
      {validData ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis
              label={{ value: 'Number of Results', angle: -90, position: 'insideLeft' }}
              allowDecimals={false}
            />
            <Tooltip formatter={(value) => [`${value} results`, 'Count']} />
            <Bar dataKey="count" fill="#82ca9d" name="Results in Range">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No FPS distribution data available with current filters
        </div>
      )}
    </div>
  );
};

export default FPSDistributionChart;