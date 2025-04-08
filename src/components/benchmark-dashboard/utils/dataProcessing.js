/**
 * Utility functions for data processing in the Benchmark Dashboard
 */

// Helper function to parse a CSV line, handling quoted fields properly
export const parseCSVLine = (line) => {
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

// Format Google Sheet URL for CSV export
export const formatGoogleSheetUrl = (url, defaultUrl) => {
  if (!url || url.trim() === "") return defaultUrl;

  // Check if URL is already in the correct format
  if (url.includes("/export?format=csv")) return url;

  // Extract the sheet ID
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    console.error("Invalid Google Sheets URL format");
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

// Comprehensive GPU name standardization function based on specific model list
export const standardizeGPUName = (gpuName) => {
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

// Helper function to standardize CPU names
export const standardizeCPUName = (cpuName) => {
  if (!cpuName) return 'Unknown';

  const name = cpuName.trim();

  // Handle common CPU naming patterns
  if (name.includes('Ryzen')) {
    // Simplify AMD Ryzen names
    const ryzenMatch = name.match(/Ryzen\s+(\d+)\s+(\d{4}X?3?D?)/i);
    if (ryzenMatch) {
      return `Ryzen ${ryzenMatch[1]} ${ryzenMatch[2]}`;
    }
  }

  if (name.includes('Core')) {
    // Simplify Intel Core names
    const intelMatch = name.match(/Core\s+i(\d+)[\-\s](\d{4,5}K?F?)/i);
    if (intelMatch) {
      return `Core i${intelMatch[1]}-${intelMatch[2]}`;
    }
  }

  return name;
};

// Helper function to standardize verdict values
export const standardizeVerdict = (verdict) => {
  if (!verdict) return 'Unknown';

  let standardized = verdict.toString().trim();

  // Remove trailing periods
  if (standardized.endsWith('.')) {
    standardized = standardized.slice(0, -1);
  }

  // Map common variations
  const verdictMap = {
    'EXCELLENT': 'Excellent',
    'GREAT': 'Great',
    'GOOD': 'Good',
    'AVERAGE': 'Average',
    'FAIR': 'Fair',
    'POOR': 'Poor',
    'BAD': 'Poor'
  };

  const upperVerdict = standardized.toUpperCase();
  for (const [key, value] of Object.entries(verdictMap)) {
    if (upperVerdict === key || upperVerdict.includes(key)) {
      return value;
    }
  }

  return standardized;
}; 