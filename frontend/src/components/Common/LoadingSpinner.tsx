import React from "react";

import "./LoadingSpinner.css";

const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner" aria-label="Loading...">
    <svg width="20" height="20" viewBox="0 0 20 20">
      <circle
        cx="10"
        cy="10"
        r="8"
        stroke="#e5e7eb"
        strokeWidth="3"
        fill="none"
      />

      <circle
        cx="10"
        cy="10"
        r="8"
        stroke="#6366f1"
        strokeWidth="3"
        fill="none"
        strokeDasharray="50"
        strokeDashoffset="16"
      />
    </svg>
  </div>
);

export default LoadingSpinner;
