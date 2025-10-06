import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase/config.js';

// Script de emergencia para limpiar TODA la base de datos
export const emergencyClean = async () => {
  try {
    console.log('🚨 INICIANDO LIMPIEZA DE EMERGENCIA...');
    
    // Limpiar refugios
    console.log('🧹 Limpiando refugios...');
    const sheltersRef = collection(db, 'shelters');
    const sheltersSnapshot = await getDocs(sheltersRef);
    
    if (sheltersSnapshot.size > 0) {
      const batch = writeBatch(db);
      sheltersSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ Eliminados ${sheltersSnapshot.size} refugios`);
    }
    
    // Limpiar mascotas de ejemplo
    console.log('🐾 Limpiando mascotas de ejemplo...');
    const petsRef = collection(db, 'pets');
    const petsSnapshot = await getDocs(petsRef);
    
    if (petsSnapshot.size > 0) {
      const batch = writeBatch(db);
      petsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ Eliminadas ${petsSnapshot.size} mascotas`);
    }
    
    // Limpiar otros datos de ejemplo si existen
    const collections = ['favorites', 'conversations', 'messages', 'notifications'];
    
    for (const collectionName of collections) {
      try {
        const ref = collection(db, collectionName);
        const snapshot = await getDocs(ref);
        
        if (snapshot.size > 0) {
          const batch = writeBatch(db);
          snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          console.log(`✅ Eliminados ${snapshot.size} ${collectionName}`);
        }
      } catch (error) {
        console.log(`⚠️ No se pudo limpiar ${collectionName}:`, error.message);
      }
    }
    
    console.log('🎉 LIMPIEZA DE EMERGENCIA COMPLETADA');
    console.log('💡 Tu quota de Firebase debería estar liberada ahora');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error en limpieza de emergencia:', error);
    throw error;
  }
};

// Función para ejecutar desde la consola del navegador
if (typeof window !== 'undefined') {
  window.emergencyClean = emergencyClean;
  console.log('🚨 Para limpieza de emergencia, ejecuta: emergencyClean()');
}
