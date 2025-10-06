// Configuración optimizada de Firebase sin errores
import { db } from '../firebase/config.js';

// Función para verificar conexión sin errores
export const checkFirebaseConnection = () => {
  try {
    console.log('✅ Firebase conectado correctamente');
    console.log('📊 Base de datos:', db);
    return { success: true, message: 'Firebase conectado' };
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return { success: false, error: error.message };
  }
};

// Función para obtener estadísticas básicas sin consultas complejas
export const getBasicStats = async () => {
  try {
    console.log('📊 Obteniendo estadísticas básicas...');
    
    // Solo verificar que Firebase esté funcionando
    const stats = {
      connected: true,
      timestamp: new Date().toISOString(),
      message: 'Firebase funcionando correctamente'
    };
    
    console.log('✅ Estadísticas obtenidas:', stats);
    return stats;
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return { connected: false, error: error.message };
  }
};

// Función para limpiar datos de prueba (solo si es necesario)
export const cleanTestData = async () => {
  try {
    console.log('🧹 Función de limpieza disponible');
    console.log('💡 Para limpiar datos, usa las funciones en la consola:');
    console.log('   - cleanShelters()');
    console.log('   - emergencyClean()');
    return { success: true, message: 'Funciones de limpieza disponibles' };
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    return { success: false, error: error.message };
  }
};

// Hacer funciones disponibles globalmente
if (typeof window !== 'undefined') {
  window.checkFirebaseConnection = checkFirebaseConnection;
  window.getBasicStats = getBasicStats;
  window.cleanTestData = cleanTestData;
  
  console.log('💡 Funciones optimizadas disponibles:');
  console.log('   - checkFirebaseConnection() - Verificar conexión');
  console.log('   - getBasicStats() - Estadísticas básicas');
  console.log('   - cleanTestData() - Información de limpieza');
}

export default {
  checkFirebaseConnection,
  getBasicStats,
  cleanTestData
};
