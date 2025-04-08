import React, { useRef, useState, useEffect } from 'react';

const ChartContainer = ({ title, children, className = "" }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clone children and pass the width prop
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { width: containerWidth - 40 }); // Subtract padding
    }
    return child;
  });

  return (
    <div
      ref={containerRef}
      className={`bg-white p-4 rounded-lg shadow w-full ${className}`}
    >
      {title && <h2 className="font-bold text-lg mb-4">{title}</h2>}
      <div className="w-full flex justify-center">
        {childrenWithProps}
      </div>
    </div>
  );
};

export default ChartContainer; 