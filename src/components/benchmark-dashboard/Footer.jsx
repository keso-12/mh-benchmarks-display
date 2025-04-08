import React from 'react';

const Footer = () => {
  return (
    <div className="mt-8 border-t pt-4 text-sm text-gray-500">
      <p className="mb-2">This dashboard connects directly to the Google Sheet and updates in real-time. Click the Refresh button to pull the latest data.</p>
      <p>Source data: <a href="https://docs.google.com/spreadsheets/d/1kvCL6cRc8BZf5hkXQwSKiStXLoQm3vB8J8NKCRh6nLY/edit" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Google Sheets</a></p>
    </div>
  );
};

export default Footer;