import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config.js';

// Script para limpiar refugios de ejemplo de la base de datos
export const cleanShelters = async () => {
  try {
    console.log('🧹 Iniciando limpieza de refugios...');
    
    // Obtener todos los refugios
    const sheltersRef = collection(db, 'shelters');
    const querySnapshot = await getDocs(sheltersRef);
    
    console.log(`📊 Encontrados ${querySnapshot.size} refugios en la base de datos`);
    
    if (querySnapshot.size === 0) {
      console.log('✅ No hay refugios para eliminar');
      return 0;
    }
    
    // Usar batch para eliminar más rápido
    let totalDeleted = 0;
    const BATCH_SIZE = 500; // Límite de Firestore
    const totalDocs = querySnapshot.docs.length;
    
    for (let i = 0; i < totalDocs; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const batchDocs = querySnapshot.docs.slice(i, i + BATCH_SIZE);
      
      for (const shelterDoc of batchDocs) {
        batch.delete(doc(db, 'shelters', shelterDoc.id));
      }
      
      await batch.commit();
      totalDeleted += batchDocs.length;
      console.log(`✅ Eliminados ${batchDocs.length} refugios en lote ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(totalDocs/BATCH_SIZE)}`);
    }
    
    console.log(`🎉 Limpieza completada. Se eliminaron ${querySnapshot.size} refugios.`);
    return querySnapshot.size;
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  }
};

// Función para ejecutar la limpieza desde la consola del navegador
if (typeof window !== 'undefined') {
  window.cleanShelters = cleanShelters;
  console.log('💡 Para limpiar los refugios, ejecuta: cleanShelters()');
}
