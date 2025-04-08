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

  // Format Google Sheet URL for CSV export
  const formatGoogleSheetUrl = (url) => {
    if (!url || url.trim() === "") return DEFAULT_GOOGLE_SHEET_URL;

    // Check if URL is already in the correct format
    if (url.includes("/export?format=csv")) return url;

    // Extract the sheet ID
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      setError("Invalid Google Sheets URL format. Please provide a valid URL.");
      return null;
    }

    const sheetId = match[1];

    // Extract gid if present, otherwise use 0 (first sheet)
    let gid = "0";
    const gidMatch = url.match(/[?&]gid=([0-9]+)/);
    if (gidMatch) {
      gid = gidMatch[1];
    }

    // Format the export URL
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  };

  const fetchData = async (urlToFetch = null) => {
    try {
      setError(null);
      setRefreshing(true);

      // Use the provided URL or the default if none is given
      const csvUrl = formatGoogleSheetUrl(urlToFetch || sheetUrl);
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
      processData(parsedData);
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

  // Helper function to parse a CSV line, handling quoted fields properly
  const parseCSVLine = (line) => {
    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        // Toggle the in-quotes flag when we hit a quote
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        // End of field, add to results
        fields.push(current);
        current = '';
      } else {
        // Add character to current field
        current += char;
      }
    }

    // Add the last field
    fields.push(current);

    return fields;
  };

  // Comprehensive GPU name standardization function based on specific model list
  const standardizeGPUName = (gpuName) => {
    if (!gpuName) return 'Unknown';

    // Convert to uppercase for case-insensitive matching
    const upperName = gpuName.toUpperCase();

    // NVIDIA RTX 5000 series
    if (upperName.includes('5090')) return 'RTX 5090';
    if (upperName.includes('5080')) return 'RTX 5080';
    if (upperName.includes('5070') && upperName.includes('TI')) return 'RTX 5070 Ti';
    if (upperName.includes('5070')) return 'RTX 5070';
    if (upperName.includes('5060')) return 'RTX 5060';

    // NVIDIA RTX 4000 series
    if (upperName.includes('4090')) return 'RTX 4090';
    if (upperName.includes('4080') && upperName.includes('SUPER')) return 'RTX 4080 Super';
    if (upperName.includes('4080')) return 'RTX 4080';
    if (upperName.includes('4070') && upperName.includes('TI') && upperName.includes('SUPER')) return 'RTX 4070 Ti Super';
    if (upperName.includes('4070') && upperName.includes('TI')) return 'RTX 4070 Ti';
    if (upperName.includes('4070') && upperName.includes('SUPER')) return 'RTX 4070 Super';
    if (upperName.includes('4070')) return 'RTX 4070';
    if (upperName.includes('4060') && upperName.includes('TI')) return 'RTX 4060 Ti';
    if (upperName.includes('4060')) return 'RTX 4060';

    // NVIDIA RTX 3000 series
    if (upperName.includes('3090') && upperName.includes('TI')) return 'RTX 3090 Ti';
    if (upperName.includes('3090')) return 'RTX 3090';
    if (upperName.includes('3080') && upperName.includes('TI')) return 'RTX 3080 Ti';
    if (upperName.includes('3080')) return 'RTX 3080';
    if (upperName.includes('3070') && upperName.includes('TI')) return 'RTX 3070 Ti';
    if (upperName.includes('3070')) return 'RTX 3070';
    if (upperName.includes('3060') && upperName.includes('TI')) return 'RTX 3060 Ti';
    if (upperName.includes('3060')) return 'RTX 3060';

    // AMD RX 9000 series
    if (upperName.includes('9070') && upperName.includes('XT')) return 'RX 9070 XT';
    if (upperName.includes('9070')) return 'RX 9070';

    // AMD RX 7000 series
    if (upperName.includes('7900') && upperName.includes('XTX')) return 'RX 7900 XTX';
    if (upperName.includes('7900') && upperName.includes('XT')) return 'RX 7900 XT';
    if (upperName.includes('7800') && upperName.includes('XT')) return 'RX 7800 XT';
    if (upperName.includes('7700') && upperName.includes('XT')) return 'RX 7700 XT';
    if (upperName.includes('7600')) return 'RX 7600';

    // AMD RX 6000 series
    if (upperName.includes('6950') && upperName.includes('XT')) return 'RX 6950 XT';
    if (upperName.includes('6900') && upperName.includes('XT')) return 'RX 6900 XT';
    if (upperName.includes('6800') && upperName.includes('XT')) return 'RX 6800 XT';
    if (upperName.includes('6800')) return 'RX 6800';
    if (upperName.includes('6700') && upperName.includes('XT')) return 'RX 6700 XT';
    if (upperName.includes('6700')) return 'RX 6700';
    if (upperName.includes('6600') && upperName.includes('XT')) return 'RX 6600 XT';
    if (upperName.includes('6600')) return 'RX 6600';
    if (upperName.includes('6500') && upperName.includes('XT')) return 'RX 6500 XT';
    if (upperName.includes('6500')) return 'RX 6500';

    // Intel Arc
    if (upperName.includes('ARC') && upperName.includes('B580')) return 'Arc B580';
    if (upperName.includes('ARC') && upperName.includes('A770')) return 'Arc A770';
    if (upperName.includes('ARC') && upperName.includes('A750')) return 'Arc A750';
    if (upperName.includes('ARC') && upperName.includes('A580')) return 'Arc A580';
    if (upperName.includes('ARC') && upperName.includes('A380')) return 'Arc A380';
    if (upperName.includes('ARC') && upperName.includes('A310')) return 'Arc A310';

    // Handle common misspellings or variations that might appear in your data
    if (upperName.includes('GEFORCE') || upperName.includes('NVIDIA')) {
      // Look for any 4-digit number pattern that might be a GPU model
      const modelMatch = upperName.match(/\b(\d{4})\b/);
      if (modelMatch) {
        const modelNumber = modelMatch[1];
        // Try to determine the series
        if (modelNumber.startsWith('5')) {
          return `RTX ${modelNumber}`;
        } else if (modelNumber.startsWith('4')) {
          return `RTX ${modelNumber}`;
        } else if (modelNumber.startsWith('3')) {
          return `RTX ${modelNumber}`;
        } else if (modelNumber.startsWith('2')) {
          return `RTX ${modelNumber}`;
        } else if (modelNumber.startsWith('1')) {
          return `GTX ${modelNumber}`;
        }
      }

      // If it has RTX or GTX but we couldn't extract a model number
      if (upperName.includes('RTX')) {
        return 'RTX GPU';
      } else if (upperName.includes('GTX')) {
        return 'GTX GPU';
      }

      // Generic NVIDIA GPU
      return 'NVIDIA GPU';
    }

    if (upperName.includes('RADEON') || upperName.includes('AMD')) {
      // Look for RX with a 4-digit number
      const modelMatch = upperName.match(/RX\s*(\d{4})/i);
      if (modelMatch) {
        const modelNumber = modelMatch[1];
        return `RX ${modelNumber}`;
      }

      // Generic AMD GPU
      return 'AMD GPU';
    }

    // For any other GPU that doesn't match our specific patterns
    if (upperName.includes('RTX ASTRAL')) {
      return 'RTX Astral';
    }

    // If the GPU name contains "mobile" or "laptop", add that designation
    if (upperName.includes('MOBILE') || upperName.includes('LAPTOP')) {
      // Try to extract the model number again
      const modelMatch = upperName.match(/\b(\d{4})\b/);
      if (modelMatch && upperName.includes('RTX')) {
        return `RTX ${modelMatch[1]} Laptop`;
      } else if (modelMatch && upperName.includes('GTX')) {
        return `GTX ${modelMatch[1]} Laptop`;
      } else if (modelMatch && upperName.includes('RX')) {
        return `RX ${modelMatch[1]} Laptop`;
      }
      return 'Laptop GPU';
    }

    // Handle GPUs with "TI" or "Super" without specific number identification
    if (upperName.includes('RTX') && upperName.includes('TI')) {
      const modelMatch = upperName.match(/RTX\s*(\d{4})/i);
      if (modelMatch) {
        return `RTX ${modelMatch[1]} Ti`;
      }
    }

    if (upperName.includes('RTX') && upperName.includes('SUPER')) {
      const modelMatch = upperName.match(/RTX\s*(\d{4})/i);
      if (modelMatch) {
        return `RTX ${modelMatch[1]} Super`;
      }
    }

    // If we can't match any specific pattern, just return the original name
    return gpuName;
  };

  // Function to clean up the processData function to use this new standardization
  const processData = (dataToProcess) => {
    if (!dataToProcess || dataToProcess.length === 0) {
      // Set empty data for all charts
      setGpuPerformance([]);
      setCpuData([]);
      setVerdictData([]);
      setRtData([]);
      setResolutionData([]);
      setFpsRangeData([]);
      setUpscalingData([]);
      return;
    }

    // Process GPU Performance with improved standardization
    const gpuMap = {};
    dataToProcess.forEach(row => {
      const gpu = row['GPU'];
      const fps = row['Average FPS Score'];
      if (gpu && fps !== null && !isNaN(fps)) {
        // Standardize the GPU name to group similar models together
        const standardizedGpu = standardizeGPUName(gpu);

        if (!gpuMap[standardizedGpu]) {
          gpuMap[standardizedGpu] = { total: 0, count: 0 };
        }
        gpuMap[standardizedGpu].total += parseFloat(fps);
        gpuMap[standardizedGpu].count++;
      }
    });

    const gpuPerf = Object.entries(gpuMap)
      .filter(([_, data]) => data.count >= 1) // Only GPUs with at least 1 sample
      .map(([gpu, data]) => ({
        name: gpu,
        avgFPS: Math.round(data.total / data.count * 100) / 100,
        count: data.count
      }))
      .sort((a, b) => b.avgFPS - a.avgFPS)
      .slice(0, 15);

    setGpuPerformance(gpuPerf);

    // Continue with the rest of the processData function...
    // (The rest of the processData function remains unchanged)
  };

  // Helper function to find a value by trying multiple possible key names
  const findValueByPossibleKeys = (obj, possibleKeys) => {
    for (const key of possibleKeys) {
      // Try the exact key
      if (obj[key] !== undefined) {
        return obj[key];
      }

      // Try case-insensitive match
      const lcKey = key.toLowerCase();
      for (const objKey in obj) {
        if (objKey.toLowerCase() === lcKey) {
          return obj[objKey];
        }
      }
    }
    return null;
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
    processData(newFilteredData);
  }, [data, upscalingFilter, graphicsFilter, rayTracingFilter, frameGenFilter, gpuBrandFilter]);


  // Filter Options
  const filterOptions = {
    upscalingOptions: ["All", "None", "DLSS", "FSR", "XESS"],
    graphicsOptions: ["All", "Ultra", "High", "Medium", "Low", "Lowest"],
    rayTracingOptions: ["All", "High", "Medium", "Low", "Off"],
    frameGenOptions: ["All", "Enabled", "Disabled"],
    gpuBrandOptions: ["All", "NVIDIA", "AMD", "Intel"]
  };

  // Stats for summary section
  const totalEntries = filteredData.length;
  const avgFps = filteredData
    .map(row => parseFloat(row['Average FPS Score']))
    .filter(val => val !== null && !isNaN(val))
    .reduce((sum, val) => sum + val, 0) / filteredData.filter(row => parseFloat(row['Average FPS Score']) !== null && !isNaN(parseFloat(row['Average FPS Score']))).length || 0;

  const avgScore = filteredData
    .map(row => parseFloat(row['Score']))
    .filter(val => val !== null && !isNaN(val))
    .reduce((sum, val) => sum + val, 0) / filteredData.filter(row => parseFloat(row['Score']) !== null && !isNaN(parseFloat(row['Score']))).length || 0;

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
    // Create sample data for when CSV parsing fails
    const sampleData = [
      {
        "GPU": "NVIDIA RTX 4090",
        "CPU Model": "Intel Core i9-13900K",
        "Screen Resolution": "2560x1440",
        "Graphics Settings": "Ultra",
        "Ray Tracing": "High",
        "Frame Generation": "Enabled",
        "Upscaling": "DLSS",
        "Average FPS Score": 120.5,
        "Score": 9500,
        "Verdict": "Excellent"
      },
      {
        "GPU": "AMD Radeon RX 7900 XTX",
        "CPU Model": "AMD Ryzen 9 7950X",
        "Screen Resolution": "3840x2160",
        "Graphics Settings": "High",
        "Ray Tracing": "Medium",
        "Frame Generation": "Enabled",
        "Upscaling": "FSR",
        "Average FPS Score": 95.3,
        "Score": 8800,
        "Verdict": "Great"
      },
      {
        "GPU": "NVIDIA RTX 4080",
        "CPU Model": "Intel Core i7-13700K",
        "Screen Resolution": "3440x1440",
        "Graphics Settings": "Ultra",
        "Ray Tracing": "High",
        "Frame Generation": "Enabled",
        "Upscaling": "DLSS",
        "Average FPS Score": 110.2,
        "Score": 9200,
        "Verdict": "Excellent"
      },
      {
        "GPU": "NVIDIA RTX 4070",
        "CPU Model": "AMD Ryzen 7 7800X3D",
        "Screen Resolution": "2560x1440",
        "Graphics Settings": "High",
        "Ray Tracing": "Medium",
        "Frame Generation": "Enabled",
        "Upscaling": "DLSS",
        "Average FPS Score": 98.7,
        "Score": 8500,
        "Verdict": "Great"
      },
      {
        "GPU": "AMD Radeon RX 7800 XT",
        "CPU Model": "AMD Ryzen 7 7700X",
        "Screen Resolution": "1920x1080",
        "Graphics Settings": "Ultra",
        "Ray Tracing": "Medium",
        "Frame Generation": "Disabled",
        "Upscaling": "FSR",
        "Average FPS Score": 144.2,
        "Score": 8700,
        "Verdict": "Great"
      }
    ];

    setData(sampleData);
    setFilteredData(sampleData);
    processData(sampleData);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
    setError("Using sample data because the CSV could not be properly parsed. Check the sheet format.");
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
      <button
        onClick={handleManualDataEntry}
        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
      >
        Load Sample Data
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
        mostCommonGpu={gpuPerformance.length > 0 ? gpuPerformance[0]?.name : 'N/A'}
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