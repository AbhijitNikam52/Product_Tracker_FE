import React from 'react';

const LoadingSpinner = ({ size = 32, color = '#7C3AED', label }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <svg
        className="animate-spin"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill={color}
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && (
        <span className="mt-3 text-sm font-medium text-ag-muted animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
