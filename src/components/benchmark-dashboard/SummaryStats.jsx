import React from 'react';

const SummaryStats = ({ totalEntries, avgFps, avgScore, mostCommonGpu }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-100 p-4 rounded-lg shadow">
        <h2 className="font-bold text-lg mb-2">Filtered Results</h2>
        <p className="text-3xl font-bold text-blue-600">{totalEntries.toLocaleString()}</p>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg shadow">
        <h2 className="font-bold text-lg mb-2">Average FPS</h2>
        <p className="text-3xl font-bold text-green-600">{avgFps.toFixed(2)}</p>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg shadow">
        <h2 className="font-bold text-lg mb-2">Average Score</h2>
        <p className="text-3xl font-bold text-green-600">{avgScore.toFixed(0)}</p>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg shadow">
        <h2 className="font-bold text-lg mb-2">Most Common GPU</h2>
        <p className="text-xl font-bold text-purple-600">{mostCommonGpu}</p>
      </div>
    </div>
  );
};

export default SummaryStats;