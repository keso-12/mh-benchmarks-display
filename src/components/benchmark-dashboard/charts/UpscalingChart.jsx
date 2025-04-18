import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const UpscalingChart = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const renderCustomizedLabel = ({ name, percent }) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
      <h2 className="font-bold text-lg mb-4 self-start">Upscaling Technologies</h2>
      {data && data.length > 0 ? (
        <div className="w-full flex justify-center">
          <PieChart width={300} height={300}>
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
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">No data available with current filters</div>
      )}
    </div>
  );
};

export default UpscalingChart;