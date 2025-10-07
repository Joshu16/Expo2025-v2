import { useState, useCallback } from 'react';

// Hook personalizado para manejar confirmaciones
export const useConfirmation = () => {
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning',
    destructive: false,
    onConfirm: null,
    onCancel: null
  });

  const showConfirmation = useCallback((options) => {
    setConfirmation({
      isOpen: true,
      title: options.title || 'Confirmar Acción',
      message: options.message || '¿Estás seguro de que quieres realizar esta acción?',
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      type: options.type || 'warning',
      destructive: options.destructive || false,
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmation(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmation.onConfirm) {
      confirmation.onConfirm();
    }
    hideConfirmation();
  }, [confirmation, hideConfirmation]);

  const handleCancel = useCallback(() => {
    if (confirmation.onCancel) {
      confirmation.onCancel();
    }
    hideConfirmation();
  }, [confirmation, hideConfirmation]);

  // Funciones de conveniencia para diferentes tipos de confirmación
  const confirmDelete = useCallback((itemName, onConfirm) => {
    showConfirmation({
      title: 'Eliminar Elemento',
      message: `¿Estás seguro de que quieres eliminar "${itemName}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger',
      destructive: true,
      onConfirm
    });
  }, [showConfirmation]);

  const confirmAction = useCallback((actionName, onConfirm, options = {}) => {
    showConfirmation({
      title: `Confirmar ${actionName}`,
      message: `¿Estás seguro de que quieres ${actionName.toLowerCase()}?`,
      confirmText: actionName,
      cancelText: 'Cancelar',
      type: 'warning',
      ...options,
      onConfirm
    });
  }, [showConfirmation]);

  const confirmDangerousAction = useCallback((actionName, description, onConfirm) => {
    showConfirmation({
      title: `⚠️ ${actionName}`,
      message: description,
      confirmText: actionName,
      cancelText: 'Cancelar',
      type: 'danger',
      destructive: true,
      onConfirm
    });
  }, [showConfirmation]);

  return {
    confirmation,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
    handleCancel,
    confirmDelete,
    confirmAction,
    confirmDangerousAction
  };
};

export default useConfirmation;
