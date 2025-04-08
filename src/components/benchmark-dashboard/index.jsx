// BenchmarkDashboard.jsx - Main Component
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

// Import components
import LoadingScreen from './LoadingScreen';
import HeaderSection from './HeaderSection';
import GoogleSheetInput from './GoogleSheetInput';
import FilterSection from './FilterSection';
import SummaryStats from './SummaryStats';
import GPUPerformanceChart from './charts/GPUPerformanceChart';
import FPSDistributionChart from './charts/FPSDistributionChart';
import VerdictChart from './charts/VerdictChart';
import UpscalingChart from './charts/UpscalingChart';
import RayTracingChart from './charts/RayTracingChart';
import CPUChart from './charts/CPUChart';
import ResolutionChart from './charts/ResolutionChart';
import ResolutionPerformanceTable from './ResolutionPerformanceTable';
import Footer from './Footer';

// Import utility functions
import {
  parseCSVLine,
  standardizeGPUName,
  formatGoogleSheetUrl
} from './utils/dataProcessing';
import { processData } from './utils/chartProcessing';

// Add a debug component to help troubleshoot data issues
const DebugPanel = ({ isOpen, data, toggleDebug }) => {
  if (!isOpen) return (
    <button
      onClick={toggleDebug}
      className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full opacity-50 hover:opacity-100"
    >
      Debug
    </button>
  );

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-1/2 h-1/2 bg-gray-900 text-white overflow-auto p-4 z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">Debug Panel</h3>
        <button
          onClick={toggleDebug}
          className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
        >
          Close
        </button>
      </div>
      <div>
        <p>Data Length: {Array.isArray(data) ? data.length : 'Not an array'}</p>
        <p>Data Type: {typeof data}</p>
        {Array.isArray(data) && data.length > 0 && (
          <>
            <p>First Row Keys: {Object.keys(data[0]).join(', ')}</p>
            <p>Sample Values:</p>
            <pre className="text-xs bg-gray-800 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(data.slice(0, 1), null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
};

const BenchmarkDashboard = () => {
  // States
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [sheetUrl, setSheetUrl] = useState("");
  const [debugMode, setDebugMode] = useState(false);

  // Chart data states
  const [gpuPerformance, setGpuPerformance] = useState([]);
  const [cpuData, setCpuData] = useState([]);
  const [verdictData, setVerdictData] = useState([]);
  const [rtData, setRtData] = useState([]);
  const [resolutionData, setResolutionData] = useState([]);
  const [fpsRangeData, setFpsRangeData] = useState([]);
  const [upscalingData, setUpscalingData] = useState([]);

  // Filter states
  const [upscalingFilter, setUpscalingFilter] = useState("All");
  const [graphicsFilter, setGraphicsFilter] = useState("All");
  const [rayTracingFilter, setRayTracingFilter] = useState("All");
  const [frameGenFilter, setFrameGenFilter] = useState("All");
  const [gpuBrandFilter, setGpuBrandFilter] = useState("All");

  // Default Google Sheet URL
  const DEFAULT_GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1kvCL6cRc8BZf5hkXQwSKiStXLoQm3vB8J8NKCRh6nLY/export?format=csv&gid=393311431";

  // Toggle debug mode
  const toggleDebug = () => setDebugMode(!debugMode);

  const fetchData = async (urlToFetch = null) => {
    try {
      setError(null);
      setRefreshing(true);

      // Use the provided URL or the default if none is given
      const csvUrl = formatGoogleSheetUrl(urlToFetch || sheetUrl, DEFAULT_GOOGLE_SHEET_URL);
      if (!csvUrl) {
        setRefreshing(false);
        return;
      }

      console.log("Fetching data from URL:", csvUrl);

      const response = await fetch(csvUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
          'Cache-Control': 'no-cache'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      let text = await response.text();
      console.log("CSV Data received, length:", text.length);

      if (!text || text.trim() === "") {
        throw new Error("Received empty data from the Google Sheet");
      }

      // Process the CSV file manually to ensure correct parsing
      const lines = text.split('\n');

      // Skip the first row (instructions)
      if (lines.length <= 1) {
        throw new Error("CSV file does not have enough rows");
      }

      // Find the header row - it should be row 7 (index 6) based on our analysis
      let headerRowIndex = -1;

      // Look for the header row by searching for common column names
      for (let i = 1; i < Math.min(15, lines.length); i++) {
        const line = lines[i];
        if (line.includes('CPU Model') && line.includes('GPU') && line.includes('Resolution')) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        console.warn("Could not find header row, defaulting to line 7");
        headerRowIndex = 7; // Default to line 7 (index 7-1=6)
      }

      console.log(`Using header row at index ${headerRowIndex}`);

      // Get the headers
      const headers = lines[headerRowIndex].split(',').map(h => h.trim());
      console.log("Found headers:", headers);

      // Find the indices of important columns
      const gpuColIndex = headers.findIndex(h => h === 'GPU');
      const cpuColIndex = headers.findIndex(h => h === 'CPU Model');
      const fpsColIndex = headers.findIndex(h => h === 'Average FPS Score');
      const scoreColIndex = headers.findIndex(h => h === 'Score');
      const rtColIndex = headers.findIndex(h => h === 'Ray Tracing');
      const upscalingColIndex = headers.findIndex(h => h === 'Upscaling');
      const resolutionColIndex = headers.findIndex(h => h === 'Screen Resolution');
      const graphicsSettingsColIndex = headers.findIndex(h => h === 'Graphics Settings');
      const frameGenColIndex = headers.findIndex(h => h === 'Frame Generation');
      const verdictColIndex = headers.findIndex(h => h === 'Verdict');

      // Check if we found the required columns
      if (gpuColIndex === -1 || cpuColIndex === -1) {
        throw new Error("Could not find required columns (GPU, CPU Model) in the CSV data");
      }

      // Process the data rows (all rows after the header)
      const parsedData = [];

      for (let i = headerRowIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        // Split the line by commas, handling quoted fields properly
        const fields = parseCSVLine(line);

        // Skip rows that don't have enough fields
        if (fields.length <= gpuColIndex || fields.length <= cpuColIndex) {
          continue;
        }

        // Get the GPU and CPU values
        const gpu = fields[gpuColIndex] ? fields[gpuColIndex].trim() : '';
        const cpu = fields[cpuColIndex] ? fields[cpuColIndex].trim() : '';

        // Skip rows without GPU or CPU
        if (!gpu || !cpu) {
          continue;
        }

        // Create a data object with the values we have
        const dataObj = {
          'GPU': gpu,
          'CPU Model': cpu,
          'Average FPS Score': fpsColIndex >= 0 && fields[fpsColIndex] ? parseFloat(fields[fpsColIndex]) || 0 : 0,
          'Score': scoreColIndex >= 0 && fields[scoreColIndex] ? parseFloat(fields[scoreColIndex]) || 0 : 0,
          'Ray Tracing': rtColIndex >= 0 && fields[rtColIndex] ? fields[rtColIndex].trim() : 'Off',
          'Upscaling': upscalingColIndex >= 0 && fields[upscalingColIndex] ? fields[upscalingColIndex].trim() : 'None',
          'Screen Resolution': resolutionColIndex >= 0 && fields[resolutionColIndex] ? fields[resolutionColIndex].trim() : '',
          'Graphics Settings': graphicsSettingsColIndex >= 0 && fields[graphicsSettingsColIndex] ? fields[graphicsSettingsColIndex].trim() : '',
          'Frame Generation': frameGenColIndex >= 0 && fields[frameGenColIndex] ? fields[frameGenColIndex].trim() : 'Disabled',
          'Verdict': verdictColIndex >= 0 && fields[verdictColIndex] ? fields[verdictColIndex].trim() : ''
        };

        // Special handling for GPU variations with proper differentiation
        dataObj['GPU'] = standardizeGPUName(dataObj['GPU']);

        // Standardize upscaling values
        if (dataObj['Upscaling']) {
          if (typeof dataObj['Upscaling'] === 'string') {
            if (dataObj['Upscaling'].toUpperCase().includes('DLSS')) {
              dataObj['Upscaling'] = 'DLSS';
            } else if (dataObj['Upscaling'].toUpperCase().includes('FSR')) {
              dataObj['Upscaling'] = 'FSR';
            } else if (dataObj['Upscaling'].toUpperCase().includes('XESS')) {
              dataObj['Upscaling'] = 'XESS';
            } else if (dataObj['Upscaling'].toUpperCase().includes('NONE') ||
              dataObj['Upscaling'].toUpperCase() === 'IDK' ||
              dataObj['Upscaling'].toUpperCase() === 'I GOT NO IDEA' ||
              dataObj['Upscaling'].toUpperCase() === 'NOT APPLICABLE') {
              dataObj['Upscaling'] = 'None';
            }
          }
        } else {
          dataObj['Upscaling'] = 'None';
        }

        parsedData.push(dataObj);
      }

      console.log(`Successfully parsed ${parsedData.length} rows of data`);

      if (parsedData.length === 0) {
        throw new Error("No valid data rows found in the CSV");
      }

      // Set the data and process it
      setData(parsedData);
      setFilteredData(parsedData);

      // Process data for charts
      const chartData = processData(parsedData);
      setGpuPerformance(chartData.gpuPerformance);
      setCpuData(chartData.cpuData);
      setVerdictData(chartData.verdictData);
      setRtData(chartData.rtData);
      setResolutionData(chartData.resolutionData);
      setFpsRangeData(chartData.fpsRangeData);
      setUpscalingData(chartData.upscalingData);

      setLastUpdated(new Date());
      setLoading(false);
      setRefreshing(false);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Error fetching data: ${error.message}`);
      setLoading(false);
      setRefreshing(false);
      // Use sample data as fallback
      handleManualDataEntry();
    }
  };

  useEffect(() => {
    // Load data from the default URL on initial load
    fetchData(DEFAULT_GOOGLE_SHEET_URL);
  }, []);

  useEffect(() => {
    // Apply filters
    if (!data || data.length === 0) return;

    let newFilteredData = [...data];

    if (upscalingFilter !== "All") {
      newFilteredData = newFilteredData.filter(row =>
        row['Upscaling'] === upscalingFilter
      );
    }

    if (graphicsFilter !== "All") {
      newFilteredData = newFilteredData.filter(row =>
        row['Graphics Settings'] === graphicsFilter
      );
    }

    if (rayTracingFilter !== "All") {
      newFilteredData = newFilteredData.filter(row =>
        row['Ray Tracing'] === rayTracingFilter
      );
    }

    if (frameGenFilter !== "All") {
      newFilteredData = newFilteredData.filter(row =>
        row['Frame Generation'] === frameGenFilter
      );
    }

    if (gpuBrandFilter !== "All") {
      newFilteredData = newFilteredData.filter(row => {
        const gpu = String(row['GPU'] || '');
        if (gpuBrandFilter === "NVIDIA") {
          return gpu.toUpperCase().includes('NVIDIA') || gpu.toUpperCase().includes('RTX') || gpu.toUpperCase().includes('GTX');
        } else if (gpuBrandFilter === "AMD") {
          return gpu.toUpperCase().includes('AMD') || gpu.toUpperCase().includes('RADEON') || gpu.toUpperCase().includes('RX');
        } else if (gpuBrandFilter === "Intel") {
          return gpu.toUpperCase().includes('INTEL') || gpu.toUpperCase().includes('ARC');
        }
        return true;
      });
    }

    setFilteredData(newFilteredData);

    // Process filtered data for charts
    const chartData = processData(newFilteredData);
    setGpuPerformance(chartData.gpuPerformance);
    setCpuData(chartData.cpuData);
    setVerdictData(chartData.verdictData);
    setRtData(chartData.rtData);
    setResolutionData(chartData.resolutionData);
    setFpsRangeData(chartData.fpsRangeData);
    setUpscalingData(chartData.upscalingData);

  }, [data, upscalingFilter, graphicsFilter, rayTracingFilter, frameGenFilter, gpuBrandFilter]);

  // Filter Options
  const filterOptions = {
    upscalingOptions: ["All", "None", "DLSS", "FSR", "XESS"],
    graphicsOptions: ["All", "Ultra", "High", "Medium", "Low", "Lowest"],
    rayTracingOptions: ["All", "High", "Medium", "Low", "Off"],
    frameGenOptions: ["All", "Enabled", "Disabled"],
    gpuBrandOptions: ["All", "NVIDIA", "AMD", "Intel"]
  };

  // Simplified average FPS calculation
  const calculateAvgFps = (data) => {
    if (!data || data.length === 0) return 0;

    const validFpsValues = data
      .map(row => parseFloat(row['Average FPS Score']))
      .filter(val => !isNaN(val));

    if (validFpsValues.length === 0) return 0;

    const sum = validFpsValues.reduce((acc, val) => acc + val, 0);
    return sum / validFpsValues.length;
  };

  // Use this function instead of the inline calculation
  const avgFps = calculateAvgFps(filteredData);
  const avgScore = calculateAvgFps(filteredData.map(row => ({ ...row, 'Average FPS Score': row['Score'] })));

  // Stats for summary section
  const totalEntries = filteredData.length;

  // Add a function to calculate the most common GPU
  const getMostCommonGpu = (data) => {
    if (!data || data.length === 0) return 'N/A';

    // Count occurrences of each GPU
    const gpuCounts = {};
    data.forEach(row => {
      const gpu = row['GPU'];
      if (gpu) {
        if (!gpuCounts[gpu]) {
          gpuCounts[gpu] = 0;
        }
        gpuCounts[gpu]++;
      }
    });

    // Find the GPU with the highest count
    let mostCommonGpu = 'N/A';
    let highestCount = 0;

    Object.entries(gpuCounts).forEach(([gpu, count]) => {
      if (count > highestCount) {
        mostCommonGpu = gpu;
        highestCount = count;
      }
    });

    return mostCommonGpu;
  };

  // Handler functions
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleSheetUrlChange = (e) => {
    setSheetUrl(e.target.value);
  };

  const handleSheetUrlSubmit = (e) => {
    e.preventDefault();
    fetchData(sheetUrl);
  };

  const handleManualDataEntry = () => {
    // Instead of using sample data, just show an empty state
    const emptyData = [];

    setData(emptyData);
    setFilteredData(emptyData);

    // Process empty data for charts (will result in empty charts)
    const chartData = processData(emptyData);
    setGpuPerformance(chartData.gpuPerformance);
    setCpuData(chartData.cpuData);
    setVerdictData(chartData.verdictData);
    setRtData(chartData.rtData);
    setResolutionData(chartData.resolutionData);
    setFpsRangeData(chartData.fpsRangeData);
    setUpscalingData(chartData.upscalingData);

    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
    setError("Unable to load data. Please check the Google Sheet URL and format, then try again.");
  };

  // Render data options
  const renderDataOptions = () => (
    <div className="mt-2 flex space-x-2">
      <button
        onClick={() => fetchData(DEFAULT_GOOGLE_SHEET_URL)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
      >
        Use Default URL
      </button>
    </div>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto bg-white">
      <HeaderSection
        lastUpdated={lastUpdated}
        handleRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <GoogleSheetInput
        sheetUrl={sheetUrl}
        handleSheetUrlChange={handleSheetUrlChange}
        handleSheetUrlSubmit={handleSheetUrlSubmit}
        error={error}
        defaultUrl={DEFAULT_GOOGLE_SHEET_URL}
        renderOptions={renderDataOptions}
      />

      {error && (
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
          <h3 className="font-bold mb-2">Troubleshooting</h3>
          <p className="mb-2">{error}</p>
          <div className="flex space-x-2">
            <button
              onClick={toggleDebug}
              className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded"
            >
              Debug Mode
            </button>
          </div>
        </div>
      )}

      <FilterSection
        filterOptions={filterOptions}
        filters={{
          upscalingFilter,
          graphicsFilter,
          rayTracingFilter,
          frameGenFilter,
          gpuBrandFilter
        }}
        setters={{
          setUpscalingFilter,
          setGraphicsFilter,
          setRayTracingFilter,
          setFrameGenFilter,
          setGpuBrandFilter
        }}
        handleFilterChange={handleFilterChange}
      />

      <SummaryStats
        totalEntries={totalEntries}
        avgFps={avgFps}
        avgScore={avgScore}
        mostCommonGpu={getMostCommonGpu(filteredData)}
      />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GPUPerformanceChart data={gpuPerformance} />
        <FPSDistributionChart data={fpsRangeData} />
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <VerdictChart data={verdictData} />
        <UpscalingChart data={upscalingData} />
        <RayTracingChart data={rtData} />
      </div>

      {/* Third Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CPUChart data={cpuData} />
        <ResolutionChart data={resolutionData} />
      </div>

      {/* Fourth Row - Resolution Performance - Now uses actual data */}
      <ResolutionPerformanceTable data={filteredData} />

      <Footer />

      {/* Debug panel */}
      <DebugPanel
        isOpen={debugMode}
        data={data}
        toggleDebug={toggleDebug}
      />
    </div>
  );
};

export default BenchmarkDashboard;