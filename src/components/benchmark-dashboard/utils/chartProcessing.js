/**
 * Utility functions for chart data processing
 */
import { standardizeGPUName, standardizeCPUName, standardizeVerdict } from './dataProcessing';

// Process data for all charts
export const processData = (dataToProcess) => {
  if (!dataToProcess || dataToProcess.length === 0) {
    // Return empty data for all charts
    return {
      gpuPerformance: [],
      cpuData: [],
      verdictData: [],
      rtData: [],
      resolutionData: [],
      fpsRangeData: [],
      upscalingData: []
    };
  }

  console.log("Processing data for charts, total rows:", dataToProcess.length);

  // 1. Process GPU Performance
  const gpuMap = {};
  dataToProcess.forEach(row => {
    const gpu = row['GPU'];
    const fps = row['Average FPS Score'];
    if (gpu && fps !== null && !isNaN(fps)) {
      // Standardize the GPU name
      const standardizedGpu = standardizeGPUName(gpu);

      if (!gpuMap[standardizedGpu]) {
        gpuMap[standardizedGpu] = { total: 0, count: 0 };
      }
      gpuMap[standardizedGpu].total += parseFloat(fps);
      gpuMap[standardizedGpu].count++;
    }
  });

  const gpuPerformance = Object.entries(gpuMap)
    .filter(([_, data]) => data.count >= 1) // Only GPUs with at least 1 sample
    .map(([gpu, data]) => ({
      name: gpu,
      avgFPS: Math.round(data.total / data.count * 100) / 100,
      count: data.count
    }))
    .sort((a, b) => b.avgFPS - a.avgFPS)
    .slice(0, 15);

  // 2. Process CPU Data
  const cpuMap = {};
  dataToProcess.forEach(row => {
    let cpu = row['CPU Model'];
    if (cpu) {
      // Standardize CPU names
      cpu = standardizeCPUName(cpu);

      if (!cpuMap[cpu]) {
        cpuMap[cpu] = 0;
      }
      cpuMap[cpu]++;
    }
  });

  const cpuData = Object.entries(cpuMap)
    .map(([cpu, count]) => ({
      name: cpu,
      count: count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 3. Process Verdict Data
  const verdictMap = {};
  dataToProcess.forEach(row => {
    let verdict = row['Verdict'];
    if (verdict) {
      // Standardize verdict values
      verdict = standardizeVerdict(verdict);

      if (!verdictMap[verdict]) {
        verdictMap[verdict] = 0;
      }
      verdictMap[verdict]++;
    }
  });

  const verdictData = Object.entries(verdictMap)
    .map(([verdict, count]) => ({
      name: verdict,
      value: count
    }))
    .sort((a, b) => b.value - a.value);

  // 4. Process Ray Tracing Data
  const rtMap = {};
  dataToProcess.forEach(row => {
    let rt = row['Ray Tracing'];
    if (!rt || rt === "") {
      rt = "Off"; // Default value if missing
    }

    if (!rtMap[rt]) {
      rtMap[rt] = 0;
    }
    rtMap[rt]++;
  });

  const rtData = Object.entries(rtMap)
    .map(([setting, count]) => ({
      name: setting,
      value: count
    }))
    .sort((a, b) => b.value - a.value);

  // 5. Process Resolution Data
  const resMap = {};
  dataToProcess.forEach(row => {
    let res = row['Screen Resolution'];
    if (!res || res === "") {
      res = "Unknown"; // Default value if missing
    }

    if (!resMap[res]) {
      resMap[res] = 0;
    }
resMap[res]++;
});

const resolutionData = Object.entries(resMap)
.map(([res, count]) => ({
name: res,
value: count
}))
.sort((a, b) => b.value - a.value)
.slice(0, 6);

// 6. Process FPS Range Data
const fpsRanges = [
{ range: '0-30', min: 0, max: 30, count: 0 },
{ range: '31-60', min: 31, max: 60, count: 0 },
{ range: '61-90', min: 61, max: 90, count: 0 },
{ range: '91-120', min: 91, max: 120, count: 0 },
{ range: '121-144', min: 121, max: 144, count: 0 },
{ range: '145+', min: 145, max: Infinity, count: 0 }
];

dataToProcess.forEach(row => {
let fpsValue = row['Average FPS Score'];

// Ensure it's a number
if (typeof fpsValue === 'string') {
fpsValue = parseFloat(fpsValue.replace(/[^\d.-]/g, ''));
}

if (fpsValue !== null && !isNaN(fpsValue)) {
const range = fpsRanges.find(r => fpsValue >= r.min && fpsValue <= r.max);
if (range) {
range.count++;
}
}
});

// 7. Process Upscaling Data
const upscalingMap = {};
dataToProcess.forEach(row => {
let upscaling = row['Upscaling'];
if (!upscaling || upscaling === "") {
upscaling = "None"; // Default value if missing
} else {
// Standardize upscaling values
if (typeof upscaling === 'string') {
if (upscaling.toUpperCase().includes('DLSS')) {
upscaling = 'DLSS';
} else if (upscaling.toUpperCase().includes('FSR')) {
upscaling = 'FSR';
} else if (upscaling.toUpperCase().includes('XESS')) {
upscaling = 'XESS';
} else if (upscaling.toUpperCase().includes('NONE') ||
upscaling.toUpperCase() === 'IDK' ||
upscaling.toUpperCase() === 'I GOT NO IDEA' ||
upscaling.toUpperCase() === 'NOT APPLICABLE') {
upscaling = 'None';
}
}
}

if (!upscalingMap[upscaling]) {
upscalingMap[upscaling] = 0;
}
upscalingMap[upscaling]++;
});

const upscalingData = Object.entries(upscalingMap)
.map(([upscaling, count]) => ({
name: upscaling,
value: count
}))
.sort((a, b) => b.value - a.value);

console.log("Chart data processing complete.");
console.log("- GPU Performance:", gpuPerformance.length);
console.log("- CPU Data:", cpuData.length);
console.log("- Verdict Data:", verdictData.length);
console.log("- Ray Tracing Data:", rtData.length);
console.log("- Resolution Data:", resolutionData.length);
console.log("- FPS Range Data:", fpsRanges.length);
console.log("- Upscaling Data:", upscalingData.length);

// Return all processed data
return {
gpuPerformance,
cpuData,
verdictData,
rtData,
resolutionData,
fpsRangeData: fpsRanges,
upscalingData
};
}; 