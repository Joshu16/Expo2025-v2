#!/usr/bin/env node

/**
 * Script para desplegar reglas de Firestore
 * Uso: node deploy-firestore-rules.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando despliegue de reglas de Firestore...');

try {
  // Verificar que existe el archivo de reglas
  const rulesPath = path.join(__dirname, 'firestore.rules');
  if (!fs.existsSync(rulesPath)) {
    throw new Error('❌ No se encontró el archivo firestore.rules');
  }

  // Verificar que existe el archivo de configuración de Firebase
  const configPath = path.join(__dirname, 'firebase.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('❌ No se encontró el archivo firebase.json');
  }

  console.log('✅ Archivos de configuración encontrados');

  // Desplegar reglas de Firestore
  console.log('📝 Desplegando reglas de Firestore...');
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: __dirname 
  });

  console.log('✅ Reglas de Firestore desplegadas exitosamente');

  // Desplegar índices de Firestore
  console.log('📊 Desplegando índices de Firestore...');
  execSync('firebase deploy --only firestore:indexes', { 
    stdio: 'inherit',
    cwd: __dirname 
  });

  console.log('✅ Índices de Firestore desplegados exitosamente');

  console.log('🎉 Despliegue completado exitosamente!');
  console.log('');
  console.log('📋 Resumen de cambios:');
  console.log('  • Reglas de Firestore actualizadas con validaciones robustas');
  console.log('  • Permisos de mensajes mejorados para mayor seguridad');
  console.log('  • Índices agregados para consultas complejas');
  console.log('  • Validación de datos en todas las operaciones');
  console.log('');
  console.log('🔧 Próximos pasos:');
  console.log('  1. Probar la aplicación para verificar que no hay errores de permisos');
  console.log('  2. Verificar que las conversaciones se crean correctamente');
  console.log('  3. Probar la funcionalidad de chat');
  console.log('  4. Verificar que las validaciones funcionan en el frontend');

} catch (error) {
  console.error('❌ Error durante el despliegue:', error.message);
  process.exit(1);
}
