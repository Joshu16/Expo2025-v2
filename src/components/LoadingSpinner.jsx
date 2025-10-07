import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = '', 
  fullScreen = false,
  overlay = false 
}) => {
  const sizeClasses = {
    small: 'loading-spinner-small',
    medium: 'loading-spinner-medium',
    large: 'loading-spinner-large'
  };

  const colorClasses = {
    primary: 'loading-spinner-primary',
    secondary: 'loading-spinner-secondary',
    accent: 'loading-spinner-accent',
    white: 'loading-spinner-white'
  };

  const spinner = (
    <div className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]}`}>
      <div className="loading-spinner-circle">
        <div className="loading-spinner-inner"></div>
      </div>
      {text && (
        <div className="loading-spinner-text">
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-spinner-fullscreen">
        {spinner}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="loading-spinner-overlay">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
