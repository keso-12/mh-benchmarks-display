import React from 'react';

const FilterSection = ({ filterOptions, filters, setters, handleFilterChange }) => {
  const {
    upscalingFilter,
    graphicsFilter,
    rayTracingFilter,
    frameGenFilter,
    gpuBrandFilter
  } = filters;

  const {
    setUpscalingFilter,
    setGraphicsFilter,
    setRayTracingFilter,
    setFrameGenFilter,
    setGpuBrandFilter
  } = setters;

  const {
    upscalingOptions,
    graphicsOptions,
    rayTracingOptions,
    frameGenOptions,
    gpuBrandOptions
  } = filterOptions;

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow mb-6">
      <h2 className="font-bold text-lg mb-2">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upscaling</label>
          <select
            value={upscalingFilter}
            onChange={handleFilterChange(setUpscalingFilter)}
            className="w-full p-2 border rounded"
          >
            {upscalingOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Graphics Settings</label>
          <select
            value={graphicsFilter}
            onChange={handleFilterChange(setGraphicsFilter)}
            className="w-full p-2 border rounded"
          >
            {graphicsOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ray Tracing</label>
          <select
            value={rayTracingFilter}
            onChange={handleFilterChange(setRayTracingFilter)}
            className="w-full p-2 border rounded"
          >
            {rayTracingOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Frame Generation</label>
          <select
            value={frameGenFilter}
            onChange={handleFilterChange(setFrameGenFilter)}
            className="w-full p-2 border rounded"
          >
            {frameGenOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GPU Brand</label>
          <select
            value={gpuBrandFilter}
            onChange={handleFilterChange(setGpuBrandFilter)}
            className="w-full p-2 border rounded"
          >
            {gpuBrandOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
