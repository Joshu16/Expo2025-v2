// Monitor de base de datos para prevenir problemas
import { monitorDatabaseSize, autoCleanupTestData } from './safetyMeasures.js';

// Función para monitorear la base de datos periódicamente
export const startDatabaseMonitoring = () => {
  console.log('🔍 Iniciando monitoreo de base de datos...');
  
  // Monitorear cada 5 minutos
  const monitoringInterval = setInterval(async () => {
    try {
      console.log('📊 Verificando estado de la base de datos...');
      
      // Verificar tamaño de la base de datos
      const counts = await monitorDatabaseSize();
      
      // Si hay demasiados refugios, alertar
      const shelterCount = counts.shelters || 0;
      if (shelterCount > 500) {
        console.warn(`⚠️ ADVERTENCIA: ${shelterCount} refugios detectados. Considera limpiar datos de prueba.`);
        
        // Si hay más de 1000, sugerir limpieza automática
        if (shelterCount > 1000) {
          console.error(`🚨 CRÍTICO: ${shelterCount} refugios detectados. Ejecuta limpieza de emergencia.`);
          console.log('💡 Ejecuta: emergencyClean() en la consola');
        }
      }
      
      // Verificar datos de prueba
      const cleanupResult = await autoCleanupTestData();
      if (cleanupResult.found > 0) {
        console.log(`🧹 Se encontraron ${cleanupResult.found} elementos de prueba`);
      }
      
    } catch (error) {
      console.error('❌ Error en monitoreo:', error);
    }
  }, 5 * 60 * 1000); // 5 minutos
  
  // Guardar el intervalo para poder detenerlo
  window.databaseMonitoringInterval = monitoringInterval;
  
  console.log('✅ Monitoreo iniciado. Se verificará cada 5 minutos.');
  return monitoringInterval;
};

// Función para detener el monitoreo
export const stopDatabaseMonitoring = () => {
  if (window.databaseMonitoringInterval) {
    clearInterval(window.databaseMonitoringInterval);
    window.databaseMonitoringInterval = null;
    console.log('⏹️ Monitoreo detenido');
  }
};

// Función para verificación inmediata
export const checkDatabaseNow = async () => {
  try {
    console.log('🔍 Verificación inmediata de la base de datos...');
    
    const counts = await monitorDatabaseSize();
    const cleanupResult = await autoCleanupTestData();
    
    console.log('📊 Resumen de la base de datos:');
    Object.entries(counts).forEach(([collection, count]) => {
      console.log(`  ${collection}: ${count} documentos`);
    });
    
    if (cleanupResult.found > 0) {
      console.log(`🧹 Datos de prueba encontrados: ${cleanupResult.found}`);
    }
    
    return { counts, cleanup: cleanupResult };
    
  } catch (error) {
    console.error('❌ Error en verificación:', error);
    return { error: error.message };
  }
};

// Función para alertar sobre problemas
export const alertOnProblems = (counts) => {
  const shelterCount = counts.shelters || 0;
  
  if (shelterCount > 1000) {
    console.error('🚨 PROBLEMA CRÍTICO DETECTADO:');
    console.error(`   - ${shelterCount} refugios en la base de datos`);
    console.error('   - Esto puede agotar tu cuota de Firebase');
    console.error('   - Ejecuta emergencyClean() para limpiar');
    return true;
  }
  
  if (shelterCount > 500) {
    console.warn('⚠️ ADVERTENCIA:');
    console.warn(`   - ${shelterCount} refugios en la base de datos`);
    console.warn('   - Considera limpiar datos de prueba');
    return true;
  }
  
  return false;
};

// Auto-iniciar monitoreo si estamos en el navegador
if (typeof window !== 'undefined') {
  // Esperar un poco antes de iniciar
  setTimeout(() => {
    startDatabaseMonitoring();
  }, 10000); // 10 segundos después de cargar
  
  // Hacer funciones disponibles globalmente
  window.startDatabaseMonitoring = startDatabaseMonitoring;
  window.stopDatabaseMonitoring = stopDatabaseMonitoring;
  window.checkDatabaseNow = checkDatabaseNow;
  
  console.log('💡 Funciones de monitoreo disponibles:');
  console.log('   - checkDatabaseNow() - Verificar ahora');
  console.log('   - startDatabaseMonitoring() - Iniciar monitoreo');
  console.log('   - stopDatabaseMonitoring() - Detener monitoreo');
}

export default {
  startDatabaseMonitoring,
  stopDatabaseMonitoring,
  checkDatabaseNow,
  alertOnProblems
};
