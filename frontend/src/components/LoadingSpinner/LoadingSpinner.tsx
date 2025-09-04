import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = '로딩 중...', 
  size = 'medium',
  overlay = false 
}) => {
  const content = (
    <div className={`loading-spinner-content ${size}`}>
      <div className="loading-spinner-wheel"></div>
      <p className="loading-spinner-message">{message}</p>
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-spinner-overlay">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;