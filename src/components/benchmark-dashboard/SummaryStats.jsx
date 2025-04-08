import React from 'react';

const SummaryStats = ({ totalEntries, avgFps, avgScore, mostCommonGpu }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Filtered Results"
        value={totalEntries.toLocaleString()}
        color="blue"
      />

      <StatCard
        title="Average FPS"
        value={avgFps.toFixed(2)}
        color="green"
      />

      <StatCard
        title="Average Score"
        value={avgScore.toFixed(0)}
        color="green"
      />

      <StatCard
        title="Most Common GPU"
        value={mostCommonGpu}
        color="purple"
        isText={true}
      />
    </div>
  );
};

const StatCard = ({ title, value, color, isText = false }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200"
  };

  return (
    <div className={`p-4 rounded-lg shadow-sm border ${colorClasses[color]}`}>
      <h2 className="font-medium text-sm text-gray-700 mb-1">{title}</h2>
      <p className={`${isText ? 'text-base' : 'text-2xl'} font-bold ${colorClasses[color].split(' ')[1]}`}>
        {value}
      </p>
    </div>
  );
};

export default SummaryStats;