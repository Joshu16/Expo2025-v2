// Configuración de seguridad para Firebase
// Este archivo debe ser importado en la nueva cuenta para prevenir problemas

export const SECURITY_CONFIG = {
  // Límites estrictos para prevenir abuso
  MAX_SHELTERS_PER_USER: 3,           // Máximo 3 refugios por usuario
  MAX_PETS_PER_USER: 10,              // Máximo 10 mascotas por usuario
  MAX_DAILY_CREATIONS: 5,             // Máximo 5 creaciones por día
  MAX_SHELTERS_TOTAL: 100,            // Máximo 100 refugios en total
  MAX_PETS_TOTAL: 500,                // Máximo 500 mascotas en total
  
  // Timeouts y límites de rendimiento
  REQUEST_TIMEOUT: 10000,             // 10 segundos
  BATCH_SIZE: 50,                     // Máximo 50 operaciones por lote
  RETRY_ATTEMPTS: 3,                  // Máximo 3 intentos
  
  // Patrones de datos sospechosos
  SUSPICIOUS_PATTERNS: [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /function\s*\(/i,
    /while\s*\(/i,
    /for\s*\(/i,
    /setInterval/i,
    /setTimeout/i
  ],
  
  // Palabras clave que indican datos de prueba
  TEST_KEYWORDS: [
    'test', 'demo', 'ejemplo', 'sample', 'prueba',
    'fake', 'dummy', 'mock', 'placeholder'
  ],
  
  // Configuración de alertas
  ALERT_THRESHOLDS: {
    SHELTERS_WARNING: 50,             // Advertir a los 50 refugios
    SHELTERS_CRITICAL: 100,           // Crítico a los 100 refugios
    PETS_WARNING: 200,                // Advertir a las 200 mascotas
    PETS_CRITICAL: 400                // Crítico a las 400 mascotas
  }
};

// Función para validar datos de entrada
export const validateInput = (data, type) => {
  const errors = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Datos inválidos');
    return errors;
  }
  
  // Validar longitud de strings
  const stringFields = ['name', 'description', 'location', 'address'];
  stringFields.forEach(field => {
    if (data[field] && typeof data[field] === 'string') {
      if (data[field].length > 500) {
        errors.push(`${field} no puede exceder 500 caracteres`);
      }
    }
  });
  
  // Validar patrones sospechosos
  const dataString = JSON.stringify(data);
  SECURITY_CONFIG.SUSPICIOUS_PATTERNS.forEach(pattern => {
    if (pattern.test(dataString)) {
      errors.push('Datos contienen contenido sospechoso');
    }
  });
  
  // Validar palabras clave de prueba
  const name = (data.name || '').toLowerCase();
  const isTestData = SECURITY_CONFIG.TEST_KEYWORDS.some(keyword => 
    name.includes(keyword)
  );
  
  if (isTestData) {
    errors.push('No se permiten datos de prueba en producción');
  }
  
  return errors;
};

// Función para verificar límites de usuario
export const checkUserLimits = async (userId, collectionName, currentCount) => {
  const limits = {
    shelters: SECURITY_CONFIG.MAX_SHELTERS_PER_USER,
    pets: SECURITY_CONFIG.MAX_PETS_PER_USER
  };
  
  const maxAllowed = limits[collectionName] || 10;
  
  if (currentCount >= maxAllowed) {
    throw new Error(`Límite alcanzado: Máximo ${maxAllowed} ${collectionName} por usuario`);
  }
  
  return true;
};

// Función para verificar límites globales
export const checkGlobalLimits = async (collectionName, currentCount) => {
  const limits = {
    shelters: SECURITY_CONFIG.MAX_SHELTERS_TOTAL,
    pets: SECURITY_CONFIG.MAX_PETS_TOTAL
  };
  
  const maxAllowed = limits[collectionName] || 1000;
  
  if (currentCount >= maxAllowed) {
    throw new Error(`Límite global alcanzado: Máximo ${maxAllowed} ${collectionName} en total`);
  }
  
  return true;
};

// Función para generar alertas
export const generateAlert = (type, count, threshold) => {
  const alerts = {
    warning: `⚠️ ADVERTENCIA: ${count} ${type} detectados (límite: ${threshold})`,
    critical: `🚨 CRÍTICO: ${count} ${type} detectados (límite: ${threshold})`
  };
  
  return alerts[count >= threshold ? 'critical' : 'warning'];
};


export default {
  SECURITY_CONFIG,
  validateInput,
  checkUserLimits,
  checkGlobalLimits,
  generateAlert
};
