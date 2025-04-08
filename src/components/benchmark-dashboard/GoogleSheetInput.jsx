import React from 'react';

const GoogleSheetInput = ({
  sheetUrl,
  handleSheetUrlChange,
  handleSheetUrlSubmit,
  error,
  defaultUrl,
  renderOptions
}) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow mb-6">
      <h2 className="font-bold text-lg mb-2">Google Sheet URL</h2>
      <form onSubmit={handleSheetUrlSubmit} className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          value={sheetUrl}
          onChange={handleSheetUrlChange}
          placeholder="Paste Google Sheets URL here (e.g., https://docs.google.com/spreadsheets/d/...)"
          className="flex-grow p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Load Sheet
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-2">
        Just paste the URL from your browser - we'll automatically format it and skip the instruction row.
      </p>
      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {renderOptions && renderOptions()}
    </div>
  );
};

export default GoogleSheetInput;