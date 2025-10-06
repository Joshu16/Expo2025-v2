// Monitoreo MANUAL de la base de datos
// Solo usar cuando sea necesario para evitar consumo de cuota

import { collection, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config.js';

// Función para verificar el estado de la base de datos (MANUAL)
export const checkDatabaseStatus = async () => {
  try {
    console.log('🔍 Verificando estado de la base de datos...');
    
    const collections = ['shelters', 'pets', 'users'];
    const counts = {};
    
    for (const collectionName of collections) {
      try {
        // Solo obtener una muestra pequeña para no consumir cuota
        const snapshot = await getDocs(collection(db, collectionName));
        counts[collectionName] = snapshot.size;
        console.log(`📚 ${collectionName}: ${snapshot.size} documentos`);
      } catch (error) {
        console.error(`Error contando ${collectionName}:`, error);
        counts[collectionName] = 'error';
      }
    }
    
    // Alertar si hay demasiados documentos
    const shelterCount = counts.shelters || 0;
    if (shelterCount > 50) {
      console.warn(`⚠️ ADVERTENCIA: ${shelterCount} refugios detectados`);
    }
    
    if (shelterCount > 100) {
      console.error(`🚨 CRÍTICO: ${shelterCount} refugios detectados`);
      console.log('💡 Considera limpiar datos de prueba');
    }
    
    return counts;
    
  } catch (error) {
    console.error('Error verificando base de datos:', error);
    return {};
  }
};

// Función para limpiar datos de prueba (MANUAL)
export const cleanTestData = async () => {
  try {
    console.log('🧹 Iniciando limpieza de datos de prueba...');
    
    // Buscar refugios de prueba
    const sheltersSnapshot = await getDocs(collection(db, 'shelters'));
    const testPatterns = ['test', 'demo', 'ejemplo', 'sample', 'prueba'];
    
    let testShelters = [];
    sheltersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const name = (data.name || '').toLowerCase();
      if (testPatterns.some(pattern => name.includes(pattern))) {
        testShelters.push({ id: doc.id, name: data.name });
      }
    });
    
    console.log(`🔍 Encontrados ${testShelters.length} refugios de prueba:`);
    testShelters.forEach(shelter => {
      console.log(`  - ${shelter.name} (${shelter.id})`);
    });
    
    if (testShelters.length > 0) {
      console.log('⚠️ Para eliminar estos refugios, ejecuta:');
      console.log('cleanShelters() o emergencyClean()');
    }
    
    return { found: testShelters.length, shelters: testShelters };
    
  } catch (error) {
    console.error('Error limpiando datos de prueba:', error);
    return { found: 0, shelters: [] };
  }
};

// Función para obtener estadísticas básicas (MANUAL)
export const getBasicStats = async () => {
  try {
    console.log('📊 Obteniendo estadísticas básicas...');
    
    const stats = {
      shelters: 0,
      pets: 0,
      users: 0,
      lastChecked: new Date().toISOString()
    };
    
    // Solo contar, no obtener todos los datos
    const collections = ['shelters', 'pets', 'users'];
    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        stats[collectionName] = snapshot.size;
      } catch (error) {
        console.error(`Error contando ${collectionName}:`, error);
        stats[collectionName] = 'error';
      }
    }
    
    console.log('📈 Estadísticas:');
    console.log(`  Refugios: ${stats.shelters}`);
    console.log(`  Mascotas: ${stats.pets}`);
    console.log(`  Usuarios: ${stats.users}`);
    
    return stats;
    
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {};
  }
};

// Hacer funciones disponibles globalmente para uso manual
if (typeof window !== 'undefined') {
  window.checkDatabaseStatus = checkDatabaseStatus;
  window.cleanTestData = cleanTestData;
  window.getBasicStats = getBasicStats;
  
  console.log('💡 Funciones de monitoreo manual disponibles:');
  console.log('   - checkDatabaseStatus() - Verificar estado');
  console.log('   - cleanTestData() - Buscar datos de prueba');
  console.log('   - getBasicStats() - Estadísticas básicas');
}

export default {
  checkDatabaseStatus,
  cleanTestData,
  getBasicStats
};
