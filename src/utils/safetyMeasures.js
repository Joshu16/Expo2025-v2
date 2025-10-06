// Medidas de seguridad para evitar creación masiva de datos
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase/config.js';

// Límites de seguridad CONSERVADORES para evitar consumo de cuota
export const SAFETY_LIMITS = {
  MAX_SHELTERS_PER_USER: 3,        // Máximo 3 refugios por usuario
  MAX_PETS_PER_USER: 10,           // Máximo 10 mascotas por usuario
  MAX_DAILY_CREATIONS: 5,          // Máximo 5 creaciones por día por usuario
  BATCH_SIZE: 50,                  // Tamaño máximo de lotes (reducido)
  TIMEOUT_MS: 10000                // Timeout de 10 segundos (reducido)
};

// Función para verificar límites antes de crear
export const checkCreationLimits = async (userId, collectionName) => {
  try {
    console.log(`🔒 Verificando límites para usuario ${userId} en ${collectionName}`);
    
    // Verificar límites por usuario
    const userQuery = query(
      collection(db, collectionName),
      where('ownerId', '==', userId),
      limit(SAFETY_LIMITS.MAX_SHELTERS_PER_USER + 1)
    );
    
    const snapshot = await getDocs(userQuery);
    const userCount = snapshot.size;
    
    console.log(`📊 Usuario ${userId} tiene ${userCount} ${collectionName}`);
    
    // Verificar límites específicos por colección
    let maxAllowed = 0;
    switch (collectionName) {
      case 'shelters':
        maxAllowed = SAFETY_LIMITS.MAX_SHELTERS_PER_USER;
        break;
      case 'pets':
        maxAllowed = SAFETY_LIMITS.MAX_PETS_PER_USER;
        break;
      default:
        maxAllowed = 50; // Límite genérico
    }
    
    if (userCount >= maxAllowed) {
      throw new Error(`❌ Límite alcanzado: Has creado el máximo de ${maxAllowed} ${collectionName}. Contacta al administrador si necesitas más.`);
    }
    
    console.log(`✅ Límites verificados. Usuario puede crear más ${collectionName}`);
    return { allowed: true, current: userCount, max: maxAllowed };
    
  } catch (error) {
    console.error('Error verificando límites:', error);
    throw error;
  }
};

// Función para verificar límites diarios
export const checkDailyLimits = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(today + 'T00:00:00.000Z').toISOString();
    
    // Verificar creaciones de hoy
    const todayQuery = query(
      collection(db, 'userActivity'),
      where('userId', '==', userId),
      where('date', '==', today),
      limit(SAFETY_LIMITS.MAX_DAILY_CREATIONS + 1)
    );
    
    const snapshot = await getDocs(todayQuery);
    const todayCount = snapshot.size;
    
    if (todayCount >= SAFETY_LIMITS.MAX_DAILY_CREATIONS) {
      throw new Error(`❌ Límite diario alcanzado: Has creado ${todayCount} elementos hoy. Intenta mañana.`);
    }
    
    return { allowed: true, today: todayCount, max: SAFETY_LIMITS.MAX_DAILY_CREATIONS };
    
  } catch (error) {
    console.error('Error verificando límites diarios:', error);
    throw error;
  }
};

// Función para registrar actividad del usuario
export const logUserActivity = async (userId, action, details = {}) => {
  try {
    const activityData = {
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      ip: 'unknown' // En un entorno real, obtendrías la IP
    };
    
    // Aquí podrías guardar en una colección de actividad
    console.log('📝 Actividad registrada:', activityData);
    return true;
    
  } catch (error) {
    console.error('Error registrando actividad:', error);
    return false;
  }
};

// Función para verificar si un usuario es administrador
export const isAdmin = (userId) => {
  // Lista de administradores (en producción, esto vendría de la base de datos)
  const adminUsers = [
    'admin-user-id-1',
    'admin-user-id-2'
  ];
  
  return adminUsers.includes(userId);
};

// Función para validar datos antes de crear
export const validateCreationData = (data, collectionName) => {
  const errors = [];
  
  // Validaciones básicas
  if (!data || typeof data !== 'object') {
    errors.push('Datos inválidos');
  }
  
  // Validaciones específicas por colección
  switch (collectionName) {
    case 'shelters':
      if (!data.name || data.name.length < 3) {
        errors.push('Nombre del refugio debe tener al menos 3 caracteres');
      }
      if (data.name && data.name.length > 100) {
        errors.push('Nombre del refugio no puede exceder 100 caracteres');
      }
      break;
      
    case 'pets':
      if (!data.name || data.name.length < 2) {
        errors.push('Nombre de la mascota debe tener al menos 2 caracteres');
      }
      if (!data.type) {
        errors.push('Tipo de mascota es requerido');
      }
      break;
  }
  
  // Validar que no contenga datos maliciosos
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /function\s*\(/i
  ];
  
  const dataString = JSON.stringify(data);
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(dataString)) {
      errors.push('Datos contienen contenido sospechoso');
      break;
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`❌ Validación fallida: ${errors.join(', ')}`);
  }
  
  return true;
};

// Función para crear con medidas de seguridad
export const safeCreate = async (collectionName, data, userId) => {
  try {
    console.log(`🛡️ Creación segura en ${collectionName} para usuario ${userId}`);
    
    // 1. Validar datos
    validateCreationData(data, collectionName);
    
    // 2. Verificar límites
    await checkCreationLimits(userId, collectionName);
    await checkDailyLimits(userId);
    
    // 3. Registrar actividad
    await logUserActivity(userId, `create_${collectionName}`, { collectionName });
    
    console.log(`✅ Todas las verificaciones pasaron. Procediendo con la creación.`);
    return { success: true, message: 'Verificaciones completadas' };
    
  } catch (error) {
    console.error('❌ Error en verificación de seguridad:', error);
    throw error;
  }
};

// Función para monitorear el tamaño de la base de datos
export const monitorDatabaseSize = async () => {
  try {
    console.log('📊 Monitoreando tamaño de la base de datos...');
    
    const collections = ['shelters', 'pets', 'users', 'adoptionRequests'];
    const counts = {};
    
    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        counts[collectionName] = snapshot.size;
        console.log(`📚 ${collectionName}: ${snapshot.size} documentos`);
      } catch (error) {
        console.error(`Error contando ${collectionName}:`, error);
        counts[collectionName] = 'error';
      }
    }
    
    // Alertar si hay demasiados documentos
    const totalShelters = counts.shelters || 0;
    if (totalShelters > 1000) {
      console.warn(`⚠️ ADVERTENCIA: Hay ${totalShelters} refugios en la base de datos. Considera limpiar datos de prueba.`);
    }
    
    return counts;
    
  } catch (error) {
    console.error('Error monitoreando base de datos:', error);
    return {};
  }
};

// Función para limpiar datos de prueba automáticamente
export const autoCleanupTestData = async () => {
  try {
    console.log('🧹 Iniciando limpieza automática de datos de prueba...');
    
    // Buscar refugios de prueba (que contengan ciertos patrones)
    const testPatterns = ['test', 'demo', 'ejemplo', 'sample', 'prueba'];
    const sheltersQuery = query(collection(db, 'shelters'));
    const sheltersSnapshot = await getDocs(sheltersQuery);
    
    let cleanedCount = 0;
    const testShelters = sheltersSnapshot.docs.filter(doc => {
      const data = doc.data();
      const name = (data.name || '').toLowerCase();
      return testPatterns.some(pattern => name.includes(pattern));
    });
    
    console.log(`🔍 Encontrados ${testShelters.length} refugios de prueba`);
    
    if (testShelters.length > 0) {
      console.log('⚠️ Se encontraron refugios de prueba. Considera limpiarlos manualmente.');
      console.log('Refugios de prueba:', testShelters.map(doc => ({ id: doc.id, name: doc.data().name })));
    }
    
    return { cleaned: cleanedCount, found: testShelters.length };
    
  } catch (error) {
    console.error('Error en limpieza automática:', error);
    return { cleaned: 0, found: 0 };
  }
};

// Exportar todas las funciones
export default {
  SAFETY_LIMITS,
  checkCreationLimits,
  checkDailyLimits,
  logUserActivity,
  isAdmin,
  validateCreationData,
  safeCreate,
  monitorDatabaseSize,
  autoCleanupTestData
};
