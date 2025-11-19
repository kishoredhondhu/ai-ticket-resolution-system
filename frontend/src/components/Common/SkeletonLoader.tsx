import React from "react";

import "./SkeletonLoader.css";

interface SkeletonLoaderProps {
  type?: "card" | "text" | "circle" | "header";

  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = "card",
  count = 1,
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className="skeleton-card">
            <div className="skeleton-header">
              <div className="skeleton-badge"></div>

              <div className="skeleton-badge-small"></div>
            </div>

            <div className="skeleton-line"></div>

            <div className="skeleton-line short"></div>

            <div className="skeleton-footer">
              <div className="skeleton-circle"></div>

              <div className="skeleton-text"></div>
            </div>
          </div>
        );

      case "header":
        return (
          <div className="skeleton-page-header">
            <div className="skeleton-title"></div>

            <div className="skeleton-subtitle"></div>
          </div>
        );

      case "text":
        return <div className="skeleton-line"></div>;

      case "circle":
        return <div className="skeleton-circle"></div>;

      default:
        return null;
    }
  };

  return (
    <div className="skeleton-container">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-item">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
