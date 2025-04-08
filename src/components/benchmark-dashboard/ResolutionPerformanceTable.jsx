// components/ResolutionPerformanceTable.jsx
import React, { useMemo } from 'react';

const ResolutionPerformanceTable = ({ data }) => {
  // Calculate resolution performance statistics from the actual data
  const resolutionStats = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group data by resolution
    const resolutionGroups = {};

    data.forEach(row => {
      const resolution = row['Screen Resolution'];
      const fps = row['Average FPS Score'];

      if (resolution && fps !== null && !isNaN(fps)) {
        if (!resolutionGroups[resolution]) {
          resolutionGroups[resolution] = {
            resolution,
            totalFps: 0,
            count: 0
          };
        }

        resolutionGroups[resolution].totalFps += fps;
        resolutionGroups[resolution].count++;
      }
    });

    // Calculate average FPS for each resolution
    const stats = Object.values(resolutionGroups)
      .map(group => ({
        resolution: group.resolution,
        avgFps: group.count > 0 ? (group.totalFps / group.count).toFixed(1) : 0,
        sampleSize: group.count
      }))
      .filter(stat => stat.count >= 10) // Only include resolutions with at least 10 samples
      .sort((a, b) => b.sampleSize - a.sampleSize); // Sort by sample size

    return stats;
  }, [data]);

  const hasData = resolutionStats.length > 0;

  // Determine if there are any interesting patterns in the data (e.g., ultrawide showing better performance than 1080p)
  const hasUltrawideAnomaly = useMemo(() => {
    if (resolutionStats.length < 3) return false;

    const ultrawideRes = resolutionStats.find(stat =>
      stat.resolution.includes('3440x1440') ||
      stat.resolution.toLowerCase().includes('ultrawide')
    );

    const fullHDRes = resolutionStats.find(stat =>
      stat.resolution.includes('1920x1080') ||
      stat.resolution.toLowerCase().includes('1080p')
    );

    return ultrawideRes && fullHDRes && parseFloat(ultrawideRes.avgFps) > parseFloat(fullHDRes.avgFps);
  }, [resolutionStats]);

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-bold text-lg mb-4">Performance by Resolution</h2>
        {hasData ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average FPS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Size</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resolutionStats.map((stat, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{stat.resolution}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{stat.avgFps}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{stat.sampleSize.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasUltrawideAnomaly && (
              <div className="mt-4 text-sm text-gray-500 italic">
                Note: Surprisingly, ultrawide resolutions show higher average FPS than 1080p, likely due to correlation with high-end hardware.
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">
            No resolution data available with current filters
          </div>
        )}
      </div>
    </div>
  );
};

export default ResolutionPerformanceTable;