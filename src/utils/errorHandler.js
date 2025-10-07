// Sistema de manejo de errores centralizado
import { ENV_CONFIG } from '../config/environment.js';

// Tipos de errores
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Códigos de error de Firebase
const FIREBASE_ERROR_CODES = {
  'auth/user-not-found': ERROR_TYPES.AUTH,
  'auth/wrong-password': ERROR_TYPES.AUTH,
  'auth/email-already-in-use': ERROR_TYPES.AUTH,
  'auth/weak-password': ERROR_TYPES.VALIDATION,
  'auth/invalid-email': ERROR_TYPES.VALIDATION,
  'permission-denied': ERROR_TYPES.PERMISSION,
  'not-found': ERROR_TYPES.NOT_FOUND,
  'unavailable': ERROR_TYPES.NETWORK,
  'deadline-exceeded': ERROR_TYPES.NETWORK,
  'resource-exhausted': ERROR_TYPES.RATE_LIMIT
};

// Mensajes de error amigables
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: {
    title: 'Error de Conexión',
    message: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
    action: 'Reintentar'
  },
  [ERROR_TYPES.AUTH]: {
    title: 'Error de Autenticación',
    message: 'Credenciales incorrectas o sesión expirada.',
    action: 'Iniciar Sesión'
  },
  [ERROR_TYPES.VALIDATION]: {
    title: 'Datos Inválidos',
    message: 'Por favor, verifica que todos los campos estén correctamente completados.',
    action: 'Corregir'
  },
  [ERROR_TYPES.PERMISSION]: {
    title: 'Sin Permisos',
    message: 'No tienes permisos para realizar esta acción.',
    action: 'Volver'
  },
  [ERROR_TYPES.NOT_FOUND]: {
    title: 'No Encontrado',
    message: 'El recurso solicitado no existe.',
    action: 'Volver'
  },
  [ERROR_TYPES.RATE_LIMIT]: {
    title: 'Demasiadas Solicitudes',
    message: 'Has realizado demasiadas solicitudes. Espera un momento antes de intentar nuevamente.',
    action: 'Esperar'
  },
  [ERROR_TYPES.UNKNOWN]: {
    title: 'Error Inesperado',
    message: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
    action: 'Reintentar'
  }
};

// Clase principal para manejo de errores
export class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  // Procesar error y determinar tipo
  processError(error) {
    console.error('ErrorHandler: Processing error:', error);
    
    let errorType = ERROR_TYPES.UNKNOWN;
    let originalMessage = error.message || 'Error desconocido';
    
    // Determinar tipo de error basado en el código
    if (error.code && FIREBASE_ERROR_CODES[error.code]) {
      errorType = FIREBASE_ERROR_CODES[error.code];
    } else if (error.name === 'FirebaseError') {
      errorType = ERROR_TYPES.NETWORK;
    } else if (error.message?.includes('permission')) {
      errorType = ERROR_TYPES.PERMISSION;
    } else if (error.message?.includes('not found')) {
      errorType = ERROR_TYPES.NOT_FOUND;
    } else if (error.message?.includes('validation')) {
      errorType = ERROR_TYPES.VALIDATION;
    }
    
    // Crear objeto de error estructurado
    const processedError = {
      id: Date.now().toString(),
      type: errorType,
      originalError: error,
      message: originalMessage,
      timestamp: new Date().toISOString(),
      userFriendly: ERROR_MESSAGES[errorType],
      stack: error.stack
    };
    
    // Agregar al log
    this.addToLog(processedError);
    
    return processedError;
  }

  // Agregar error al log
  addToLog(error) {
    this.errorLog.unshift(error);
    
    // Mantener solo los últimos errores
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }
  }

  // Obtener mensaje amigable para el usuario
  getUserFriendlyMessage(error) {
    const processedError = this.processError(error);
    return processedError.userFriendly;
  }

  // Mostrar notificación de error
  showErrorNotification(error, options = {}) {
    const processedError = this.processError(error);
    const { title, message, action } = processedError.userFriendly;
    
    // Crear notificación personalizada
    const notification = {
      id: processedError.id,
      type: 'error',
      title,
      message,
      action,
      timestamp: processedError.timestamp,
      ...options
    };
    
    // En un entorno real, esto se conectaría con un sistema de notificaciones
    console.error('Error Notification:', notification);
    
    // Disparar evento personalizado para que los componentes puedan escucharlo
    window.dispatchEvent(new CustomEvent('error-notification', {
      detail: notification
    }));
    
    return notification;
  }

  // Retry automático con backoff exponencial
  async retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Calcular delay con backoff exponencial
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Retry attempt ${attempt}/${maxRetries} in ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  // Obtener estadísticas de errores
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      recent: this.errorLog.slice(0, 10)
    };
    
    this.errorLog.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    });
    
    return stats;
  }

  // Limpiar log de errores
  clearLog() {
    this.errorLog = [];
  }
}

// Instancia global del manejador de errores
export const errorHandler = new ErrorHandler();

// Función de conveniencia para manejar errores
export const handleError = (error, options = {}) => {
  return errorHandler.showErrorNotification(error, options);
};

// Función para manejar errores de Firebase específicamente
export const handleFirebaseError = (error, context = '') => {
  console.error(`Firebase Error in ${context}:`, error);
  
  // Procesar error específico de Firebase
  const processedError = errorHandler.processError(error);
  
  // Mostrar notificación
  return errorHandler.showErrorNotification(processedError, {
    context,
    showRetry: processedError.type === ERROR_TYPES.NETWORK
  });
};

// Hook para React (si se usa)
export const useErrorHandler = () => {
  return {
    handleError,
    handleFirebaseError,
    errorHandler,
    errorStats: errorHandler.getErrorStats()
  };
};

export default errorHandler;
