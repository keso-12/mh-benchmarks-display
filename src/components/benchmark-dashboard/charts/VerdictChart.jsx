

// components/charts/VerdictChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const VerdictChart = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Ensure we have valid data in the expected format
  const validData = Array.isArray(data) && data.length > 0 && data.every(item =>
    item && typeof item === 'object' &&
    'name' in item &&
    'value' in item &&
    !isNaN(item.value)
  );

  const renderCustomizedLabel = ({ name, percent }) => {
    // Check if name is valid before trying to use it
    if (typeof name !== 'string' || name.length === 0) {
      return `${(percent * 100).toFixed(0)}%`;
    }

    // Truncate long names in the label
    const displayName = name.length > 15 ? name.substring(0, 12) + '...' : name;
    return `${displayName}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="font-bold text-lg mb-4">Performance Verdict</h2>
      {validData ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} entries`, 'Count']} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No verdict data available with current filters
        </div>
      )}
    </div>
  );
};

export default VerdictChart;