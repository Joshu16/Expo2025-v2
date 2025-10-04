// Script de prueba para verificar la conexión a Firebase
import { db } from '../firebase/config.js';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🧪 Probando conexión a Firebase...');
    
    // Intentar crear un documento de prueba
    const testData = {
      message: 'Test de conexión Firebase',
      timestamp: new Date().toISOString(),
      test: true
    };
    
    const docRef = await addDoc(collection(db, 'test'), testData);
    console.log('✅ Documento de prueba creado con ID:', docRef.id);
    
    // Intentar leer documentos de prueba
    const querySnapshot = await getDocs(collection(db, 'test'));
    console.log('✅ Documentos de prueba leídos:', querySnapshot.size);
    
    // Limpiar documentos de prueba
    querySnapshot.forEach(doc => {
      console.log('🧹 Limpiando documento de prueba:', doc.id);
    });
    
    console.log('🎉 ¡Conexión a Firebase exitosa!');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a Firebase:', error);
    return false;
  }
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  window.testFirebaseConnection = testFirebaseConnection;
}
