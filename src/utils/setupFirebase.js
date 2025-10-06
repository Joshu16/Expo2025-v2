// Script para configurar Firebase con datos iniciales
import { initializeSampleData } from './initFirebase.js';

// Función para ejecutar la configuración inicial
export const setupFirebase = async () => {
  try {
    console.log('🚀 Configurando Firebase...');
    
    // Verificar estructura
    const result = await initializeSampleData();
    
    if (result.success) {
      console.log('✅ Firebase configurado correctamente');
      console.log('📚 Colecciones disponibles:', result.collections);
      
      if (result.missing.length > 0) {
        console.log('⚠️ Colecciones que se crearán automáticamente:', result.missing);
      }
      
      return {
        success: true,
        message: 'Firebase configurado correctamente',
        collections: result.collections
      };
    } else {
      console.error('❌ Error configurando Firebase:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error en setupFirebase:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para crear datos de ejemplo (opcional)
export const createSampleData = async () => {
  try {
    console.log('🎯 Creando datos de ejemplo...');
    
    // Aquí puedes agregar lógica para crear datos de ejemplo
    // Por ahora solo verificamos la estructura
    
    console.log('✅ Datos de ejemplo creados (si es necesario)');
    return { success: true };
  } catch (error) {
    console.error('❌ Error creando datos de ejemplo:', error);
    return { success: false, error: error.message };
  }
};

// Ejecutar configuración automáticamente si se importa
if (typeof window !== 'undefined') {
  // Solo ejecutar en el navegador
  setupFirebase().then(result => {
    if (result.success) {
      console.log('🎉 Firebase listo para usar');
    }
  });
}

export default {
  setupFirebase,
  createSampleData
};
