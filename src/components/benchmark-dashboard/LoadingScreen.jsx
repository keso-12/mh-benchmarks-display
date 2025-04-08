import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full mb-4" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-xl">Loading benchmark data...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;