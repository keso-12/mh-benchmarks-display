import React from 'react';

const FilterSection = ({
  upscalingFilter, setUpscalingFilter,
  graphicsFilter, setGraphicsFilter,
  rayTracingFilter, setRayTracingFilter,
  frameGenFilter, setFrameGenFilter,
  gpuBrandFilter, setGpuBrandFilter,
  upscalingOptions = [], graphicsOptions = [], rayTracingOptions = [], frameGenOptions = [], gpuBrandOptions = [],
  handleFilterChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="font-medium text-base text-gray-800 mb-3">Filter Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <FilterDropdown
          label="Upscaling"
          value={upscalingFilter}
          options={upscalingOptions}
          onChange={handleFilterChange(setUpscalingFilter)}
        />

        <FilterDropdown
          label="Graphics Settings"
          value={graphicsFilter}
          options={graphicsOptions}
          onChange={handleFilterChange(setGraphicsFilter)}
        />

        <FilterDropdown
          label="Ray Tracing"
          value={rayTracingFilter}
          options={rayTracingOptions}
          onChange={handleFilterChange(setRayTracingFilter)}
        />

        <FilterDropdown
          label="Frame Generation"
          value={frameGenFilter}
          options={frameGenOptions}
          onChange={handleFilterChange(setFrameGenFilter)}
        />

        <FilterDropdown
          label="GPU Brand"
          value={gpuBrandFilter}
          options={gpuBrandOptions}
          onChange={handleFilterChange(setGpuBrandFilter)}
        />
      </div>
    </div>
  );
};

const FilterDropdown = ({ label, value, options = [], onChange }) => (
  <div className="flex flex-col">
    <label className="text-xs font-medium text-gray-600 mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    >
      {(options || []).map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

export default FilterSection;
