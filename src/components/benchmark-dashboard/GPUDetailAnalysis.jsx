// src/components/benchmark-dashboard/GPUDetailAnalysis.jsx
import React, { useState } from 'react';

const GPUDetailAnalysis = ({ gpu, data, onClose }) => {
  const [expandedCpu, setExpandedCpu] = useState(null);

  const toggleCpuDetails = (cpu) => {
    setExpandedCpu(expandedCpu === cpu ? null : cpu);
  };

  if (!data || data.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white p-4 rounded-lg shadow-lg max-w-2xl w-full">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium text-gray-800">
              {gpu} - CPU Performance Analysis
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            <p className="text-sm text-gray-700">No data available for this GPU with the current filters.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-blue-600 text-white p-3 flex justify-between items-center">
          <h2 className="text-lg font-medium">
            {gpu} - CPU Performance Analysis
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded mb-4 text-sm">
            <p className="text-gray-700">
              This analysis shows how different CPUs perform with the <span className="font-medium">{gpu}</span> GPU.
              Click on a CPU to see detailed test configurations.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="py-2 px-3 text-left font-medium">CPU Model</th>
                  <th className="py-2 px-3 text-right font-medium">Avg FPS</th>
                  <th className="py-2 px-3 text-right font-medium">Avg Score</th>
                  <th className="py-2 px-3 text-right font-medium">Entries</th>
                  <th className="py-2 px-3 text-center font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr className={`border-t border-gray-200 text-sm ${expandedCpu === item.cpu ? 'bg-blue-50' : ''}`}>
                      <td className="py-2 px-3 text-gray-800 font-medium">{item.cpu}</td>
                      <td className="py-2 px-3 text-right text-green-600 font-medium">{item.avgFps.toFixed(1)}</td>
                      <td className="py-2 px-3 text-right font-medium">{item.avgScore.toFixed(1)}</td>
                      <td className="py-2 px-3 text-right">{item.entries}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => toggleCpuDetails(item.cpu)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs"
                        >
                          {expandedCpu === item.cpu ? 'Hide' : 'Show'}
                        </button>
                      </td>
                    </tr>
                    {expandedCpu === item.cpu && (
                      <tr>
                        <td colSpan="5" className="py-3 px-3 bg-blue-50">
                          <div className="text-xs">
                            <h4 className="font-medium mb-2 text-blue-800">Test Configurations:</h4>
                            <div className="overflow-x-auto bg-white rounded border border-gray-200">
                              <table className="min-w-full border-collapse">
                                <thead>
                                  <tr className="bg-gray-100 text-gray-700 text-xs">
                                    <th className="py-1 px-2 text-left font-medium">Resolution</th>
                                    <th className="py-1 px-2 text-left font-medium">Graphics</th>
                                    <th className="py-1 px-2 text-left font-medium">Ray Tracing</th>
                                    <th className="py-1 px-2 text-left font-medium">Upscaling</th>
                                    <th className="py-1 px-2 text-left font-medium">Frame Gen</th>
                                    <th className="py-1 px-2 text-right font-medium">FPS</th>
                                    <th className="py-1 px-2 text-right font-medium">Score</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.settings.map((setting, settingIndex) => (
                                    <tr key={settingIndex} className="border-t border-gray-200 text-xs">
                                      <td className="py-1 px-2">{setting.resolution}</td>
                                      <td className="py-1 px-2">{setting.graphics}</td>
                                      <td className="py-1 px-2">{setting.rayTracing}</td>
                                      <td className="py-1 px-2">{setting.upscaling}</td>
                                      <td className="py-1 px-2">{setting.frameGen}</td>
                                      <td className="py-1 px-2 text-right text-green-600 font-medium">{setting.fps.toFixed(1)}</td>
                                      <td className="py-1 px-2 text-right font-medium">{setting.score.toFixed(1)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPUDetailAnalysis;