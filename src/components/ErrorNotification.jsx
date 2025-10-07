import React, { useState, useEffect } from 'react';
import './ErrorNotification.css';

const ErrorNotification = ({ 
  error, 
  onClose, 
  onRetry, 
  autoClose = true, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      setIsClosing(false);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [error, autoClose, duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const handleRetry = () => {
    onRetry?.();
    handleClose();
  };

  if (!isVisible || !error) return null;

  const { title, message, action, type = 'error' } = error;

  return (
    <div className={`error-notification ${isClosing ? 'closing' : ''} ${type}`}>
      <div className="error-notification-content">
        <div className="error-notification-icon">
          {type === 'error' && '⚠️'}
          {type === 'warning' && '⚠️'}
          {type === 'success' && '✅'}
          {type === 'info' && 'ℹ️'}
        </div>
        
        <div className="error-notification-text">
          <h4 className="error-notification-title">{title}</h4>
          <p className="error-notification-message">{message}</p>
        </div>
        
        <div className="error-notification-actions">
          {action === 'Reintentar' && onRetry && (
            <button 
              className="error-notification-retry-btn"
              onClick={handleRetry}
            >
              Reintentar
            </button>
          )}
          
          <button 
            className="error-notification-close-btn"
            onClick={handleClose}
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="error-notification-progress">
        <div 
          className="error-notification-progress-bar"
          style={{ 
            animationDuration: `${duration}ms`,
            animationPlayState: autoClose ? 'running' : 'paused'
          }}
        />
      </div>
    </div>
  );
};

export default ErrorNotification;
