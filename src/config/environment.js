// Configuración de variables de entorno
// En producción, estas variables deben venir del servidor o variables de entorno

export const ENV_CONFIG = {
  // Firebase Configuration (Solo Database y Auth)
  FIREBASE: {
    API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBnil9YV9LpAVA4GLUjoPoq7PSgq3DYYgk",
    AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "animals-adoption-app-v2.firebaseapp.com",
    PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || "animals-adoption-app-v2",
    MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "702758490735",
    APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || "1:702758490735:web:animals-adoption-app-v2"
  },
  
  // App Configuration
  APP: {
    NAME: import.meta.env.VITE_APP_NAME || "Expo2025 - Adopción de Mascotas",
    VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
    ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT || "development"
  },
  
  // Security Configuration
  SECURITY: {
    MAX_SHELTERS_PER_USER: parseInt(import.meta.env.VITE_MAX_SHELTERS_PER_USER) || 3,
    MAX_PETS_PER_USER: parseInt(import.meta.env.VITE_MAX_PETS_PER_USER) || 10,
    MAX_DAILY_CREATIONS: parseInt(import.meta.env.VITE_MAX_DAILY_CREATIONS) || 5,
    REQUEST_TIMEOUT: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT) || 10000
  },
  
  // Features Configuration
  FEATURES: {
    ENABLE_STORAGE: import.meta.env.VITE_ENABLE_STORAGE === 'true' || false,
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || false,
    ENABLE_MESSAGING: import.meta.env.VITE_ENABLE_MESSAGING === 'true' || false
  }
};

// Función para validar que todas las variables necesarias estén presentes
export const validateEnvironment = () => {
  const requiredVars = [
    'FIREBASE.API_KEY',
    'FIREBASE.AUTH_DOMAIN',
    'FIREBASE.PROJECT_ID',
    'FIREBASE.MESSAGING_SENDER_ID',
    'FIREBASE.APP_ID'
  ];
  
  const missing = [];
  
  requiredVars.forEach(varPath => {
    const keys = varPath.split('.');
    let value = ENV_CONFIG;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    if (!value) {
      missing.push(varPath);
    }
  });
  
  if (missing.length > 0) {
    console.warn('⚠️ Variables de entorno faltantes:', missing);
    console.warn('💡 Usando valores por defecto. En producción, configura las variables de entorno.');
  }
  
  return missing.length === 0;
};

// Validar al importar
validateEnvironment();

export default ENV_CONFIG;
