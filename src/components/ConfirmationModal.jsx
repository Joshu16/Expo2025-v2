import React, { useState, useEffect } from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Acción',
  message = '¿Estás seguro de que quieres realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  isLoading = false,
  destructive = false
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!isLoading) {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isLoading) {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isLoading]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '❓';
    }
  };

  return (
    <div 
      className={`confirmation-modal-backdrop ${isVisible ? 'visible' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`confirmation-modal ${destructive ? 'destructive' : ''} ${type}`}>
        <div className="confirmation-modal-header">
          <div className="confirmation-modal-icon">
            {getIcon()}
          </div>
          <h3 className="confirmation-modal-title">{title}</h3>
        </div>
        
        <div className="confirmation-modal-body">
          <p className="confirmation-modal-message">{message}</p>
        </div>
        
        <div className="confirmation-modal-footer">
          <button
            className="confirmation-modal-cancel-btn"
            onClick={handleClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          
          <button
            className={`confirmation-modal-confirm-btn ${destructive ? 'destructive' : ''}`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="confirmation-modal-loading">
                <div className="confirmation-modal-spinner"></div>
                Procesando...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
