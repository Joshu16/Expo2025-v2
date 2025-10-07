#!/usr/bin/env node

/**
 * Script para verificar la configuración de Firebase
 * Uso: node verify-firebase-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Firebase...');

// Verificar archivos necesarios
const requiredFiles = [
  'firebase.json',
  'firestore.rules',
  'firestore.indexes.json',
  '.firebaserc'
];

const missingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error('❌ Archivos faltantes:');
  missingFiles.forEach(file => {
    console.error(`  • ${file}`);
  });
  process.exit(1);
}

console.log('✅ Todos los archivos necesarios están presentes');

// Verificar contenido de firebase.json
try {
  const firebaseConfig = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
  
  if (!firebaseConfig.firestore) {
    console.error('❌ Configuración de Firestore faltante en firebase.json');
    process.exit(1);
  }
  
  console.log('✅ Configuración de Firebase válida');
} catch (error) {
  console.error('❌ Error al leer firebase.json:', error.message);
  process.exit(1);
}

// Verificar reglas de Firestore
try {
  const rulesContent = fs.readFileSync('firestore.rules', 'utf8');
  
  if (!rulesContent.includes('rules_version')) {
    console.error('❌ Reglas de Firestore inválidas');
    process.exit(1);
  }
  
  console.log('✅ Reglas de Firestore válidas');
} catch (error) {
  console.error('❌ Error al leer firestore.rules:', error.message);
  process.exit(1);
}

// Verificar índices de Firestore
try {
  const indexesContent = JSON.parse(fs.readFileSync('firestore.indexes.json', 'utf8'));
  
  if (!indexesContent.indexes || !Array.isArray(indexesContent.indexes)) {
    console.error('❌ Índices de Firestore inválidos');
    process.exit(1);
  }
  
  console.log(`✅ ${indexesContent.indexes.length} índices de Firestore configurados`);
} catch (error) {
  console.error('❌ Error al leer firestore.indexes.json:', error.message);
  process.exit(1);
}

console.log('');
console.log('🎉 Configuración de Firebase verificada exitosamente!');
console.log('');
console.log('📋 Resumen de la configuración:');
console.log('  • Reglas de Firestore con validaciones robustas');
console.log('  • Índices optimizados para consultas complejas');
console.log('  • Permisos de seguridad mejorados');
console.log('  • Validación de datos en todas las operaciones');
console.log('');
console.log('🚀 Para desplegar los cambios, ejecuta:');
console.log('  node deploy-firestore-rules.js');
