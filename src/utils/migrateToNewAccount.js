// Script para migrar datos importantes a nueva cuenta Firebase
// IMPORTANTE: Este script debe ejecutarse desde la consola del navegador
// cuando tengas acceso a la nueva cuenta

import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc, 
  doc 
} from 'firebase/firestore';
import { db as oldDb } from '../firebase/config.js';
import { db as newDb } from '../firebase/config-new.js';

// Función para migrar usuarios
export const migrateUsers = async () => {
  try {
    console.log('👥 Migrando usuarios...');
    
    // Obtener usuarios de la cuenta antigua
    const usersSnapshot = await getDocs(collection(oldDb, 'users'));
    console.log(`📊 Encontrados ${usersSnapshot.size} usuarios`);
    
    let migrated = 0;
    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data();
        await setDoc(doc(newDb, 'users', userDoc.id), userData);
        migrated++;
        console.log(`✅ Usuario migrado: ${userData.name || userData.email}`);
      } catch (error) {
        console.error(`❌ Error migrando usuario ${userDoc.id}:`, error);
      }
    }
    
    console.log(`🎉 Migrados ${migrated} usuarios`);
    return migrated;
  } catch (error) {
    console.error('❌ Error migrando usuarios:', error);
    return 0;
  }
};

// Función para migrar mascotas reales (no de ejemplo)
export const migrateRealPets = async () => {
  try {
    console.log('🐾 Migrando mascotas reales...');
    
    const petsSnapshot = await getDocs(collection(oldDb, 'pets'));
    console.log(`📊 Encontrados ${petsSnapshot.size} mascotas`);
    
    let migrated = 0;
    for (const petDoc of petsSnapshot.docs) {
      try {
        const petData = petDoc.data();
        
        // Solo migrar mascotas que parecen reales (no de ejemplo)
        const isRealPet = petData.ownerId && 
                         petData.ownerId !== 'demo' && 
                         petData.ownerId !== 'test' &&
                         !petData.name?.includes('Ejemplo') &&
                         !petData.name?.includes('Demo');
        
        if (isRealPet) {
          await setDoc(doc(newDb, 'pets', petDoc.id), petData);
          migrated++;
          console.log(`✅ Mascota migrada: ${petData.name}`);
        }
      } catch (error) {
        console.error(`❌ Error migrando mascota ${petDoc.id}:`, error);
      }
    }
    
    console.log(`🎉 Migradas ${migrated} mascotas reales`);
    return migrated;
  } catch (error) {
    console.error('❌ Error migrando mascotas:', error);
    return 0;
  }
};

// Función para migrar categorías
export const migrateCategories = async () => {
  try {
    console.log('📂 Migrando categorías...');
    
    const categoriesSnapshot = await getDocs(collection(oldDb, 'categories'));
    console.log(`📊 Encontradas ${categoriesSnapshot.size} categorías`);
    
    let migrated = 0;
    for (const categoryDoc of categoriesSnapshot.docs) {
      try {
        const categoryData = categoryDoc.data();
        await setDoc(doc(newDb, 'categories', categoryDoc.id), categoryData);
        migrated++;
        console.log(`✅ Categoría migrada: ${categoryData.name}`);
      } catch (error) {
        console.error(`❌ Error migrando categoría ${categoryDoc.id}:`, error);
      }
    }
    
    console.log(`🎉 Migradas ${migrated} categorías`);
    return migrated;
  } catch (error) {
    console.error('❌ Error migrando categorías:', error);
    return 0;
  }
};

// Función para migrar todo
export const migrateAll = async () => {
  try {
    console.log('🚀 Iniciando migración completa...');
    
    const results = {
      users: await migrateUsers(),
      pets: await migrateRealPets(),
      categories: await migrateCategories()
    };
    
    console.log('🎉 Migración completada:');
    console.log(`👥 Usuarios: ${results.users}`);
    console.log(`🐾 Mascotas: ${results.pets}`);
    console.log(`📂 Categorías: ${results.categories}`);
    
    return results;
  } catch (error) {
    console.error('❌ Error en migración completa:', error);
    throw error;
  }
};

// Función para ejecutar desde la consola del navegador
if (typeof window !== 'undefined') {
  window.migrateUsers = migrateUsers;
  window.migrateRealPets = migrateRealPets;
  window.migrateCategories = migrateCategories;
  window.migrateAll = migrateAll;
  console.log('💡 Para migrar datos, ejecuta: migrateAll()');
}
