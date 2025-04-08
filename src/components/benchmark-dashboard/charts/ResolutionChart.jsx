// components/charts/ResolutionChart.jsx
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const ResolutionChart = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const renderCustomizedLabel = ({ name, percent }) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  // Calculate resolution category percentages dynamically
  const resolutionCategories = useMemo(() => {
    if (!data || data.length === 0) return [];

    const totalEntries = data.reduce((sum, item) => sum + item.value, 0);

    // Define resolution categories
    const categories = [
      {
        name: '1440p',
        pattern: /(2560x1440|1440p)/i,
        count: 0,
        color: 'blue-100'
      },
      {
        name: '1080p',
        pattern: /(1920x1080|1080p)/i,
        count: 0,
        color: 'green-100'
      },
      {
        name: 'Ultrawide',
        pattern: /(3440x|ultrawide|ultra-wide|uwqhd)/i,
        count: 0,
        color: 'yellow-100'
      },
      {
        name: '4K',
        pattern: /(3840x2160|4k|uhd|2160p)/i,
        count: 0,
        color: 'purple-100'
      },
      {
        name: 'Other',
        pattern: /.*/,
        count: 0,
        color: 'gray-100'
      }
    ];

    // Count entries for each category
    data.forEach(item => {
      // Find the first matching category
      const matchedCategory = categories.find(cat =>
        cat.pattern.test(item.name)
      );

      if (matchedCategory) {
        matchedCategory.count += item.value;
      }
    });

    // Calculate percentages
    categories.forEach(cat => {
      cat.percentage = totalEntries > 0 ? (cat.count / totalEntries * 100).toFixed(0) : 0;
    });

    // Sort by count (descending) and keep categories with non-zero counts
    return categories
      .filter(cat => cat.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [data]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="font-bold text-lg mb-4">Screen Resolutions</h2>
      {data && data.length > 0 ? (
        <div>
          <div className="w-full">
            <PieChart width={400} height={300}>
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

          {resolutionCategories.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-center">Common Resolutions</h3>
              <div className="grid grid-cols-5 gap-2 text-center mt-2">
                {resolutionCategories.slice(0, 5).map((category, index) => (
                  <div key={index} className={`bg-${category.color} p-2 rounded`}>
                    <div className="font-bold">{category.name}</div>
                    <div className="text-sm">~{category.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">No data available with current filters</div>
      )}
    </div>
  );
};

export default ResolutionChart;