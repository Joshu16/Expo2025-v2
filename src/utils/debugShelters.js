import { collection, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config.js';

// Script para debuggear los refugios en la base de datos
export const debugShelters = async () => {
  try {
    console.log('🔍 Iniciando debug de refugios...');
    
    // Obtener algunos refugios para ver su estructura
    const sheltersRef = collection(db, 'shelters');
    const querySnapshot = await getDocs(sheltersRef);
    
    console.log(`📊 Total de refugios en BD: ${querySnapshot.size}`);
    
    // Analizar los primeros 10 refugios
    const sampleShelters = querySnapshot.docs.slice(0, 10).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('📋 Muestra de refugios (primeros 10):');
    sampleShelters.forEach((shelter, index) => {
      console.log(`\n--- Refugio ${index + 1} ---`);
      console.log('ID:', shelter.id);
      console.log('Nombre:', shelter.name);
      console.log('Status:', shelter.status);
      console.log('isPremium:', shelter.isPremium);
      console.log('ownerId:', shelter.ownerId);
      console.log('createdAt:', shelter.createdAt);
      console.log('Campos disponibles:', Object.keys(shelter));
    });
    
    // Contar por status
    const statusCounts = {};
    const premiumCounts = { premium: 0, regular: 0, undefined: 0 };
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const status = data.status || 'undefined';
      const isPremium = data.isPremium;
      
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      if (isPremium === true) premiumCounts.premium++;
      else if (isPremium === false) premiumCounts.regular++;
      else premiumCounts.undefined++;
    });
    
    console.log('\n📊 Conteo por status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status}: ${count}`);
    });
    
    console.log('\n📊 Conteo por premium:');
    Object.entries(premiumCounts).forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });
    
    return {
      total: querySnapshot.size,
      sample: sampleShelters,
      statusCounts,
      premiumCounts
    };
    
  } catch (error) {
    console.error('❌ Error durante el debug:', error);
    throw error;
  }
};

// Función para ejecutar desde la consola del navegador
if (typeof window !== 'undefined') {
  window.debugShelters = debugShelters;
  console.log('💡 Para debuggear los refugios, ejecuta: debugShelters()');
}
