import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const CPUChart = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="font-bold text-lg mb-4">Top 10 CPUs by Frequency</h2>
      {data && data.length > 0 ? (
        <div className="w-full">
          <BarChart
            width={600}
            height={400}
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 120 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" name="Count">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">No data available with current filters</div>
      )}
    </div>
  );
};

export default CPUChart;