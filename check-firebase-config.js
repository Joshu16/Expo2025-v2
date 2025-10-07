#!/usr/bin/env node

/**
 * Script para verificar la configuración de Firebase
 * Uso: node check-firebase-config.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando configuración de Firebase...');
console.log('==========================================');

// Verificar archivos de configuración
const configFiles = [
  'firebase.json',
  '.firebaserc',
  'firestore.rules',
  'firestore.indexes.json'
];

console.log('\n📁 Archivos de configuración:');
configFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Verificar configuración de Firebase
console.log('\n⚙️ Configuración de Firebase:');
try {
  const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase.json'), 'utf8'));
  console.log('✅ firebase.json válido');
  console.log('  - Reglas de Firestore:', firebaseConfig.firestore?.rules || 'No definidas');
  console.log('  - Índices de Firestore:', firebaseConfig.firestore?.indexes || 'No definidos');
  console.log('  - Hosting configurado:', firebaseConfig.hosting ? 'Sí' : 'No');
} catch (error) {
  console.log('❌ Error en firebase.json:', error.message);
}

// Verificar configuración del proyecto
try {
  const firebaserc = JSON.parse(fs.readFileSync(path.join(__dirname, '.firebaserc'), 'utf8'));
  console.log('✅ .firebaserc válido');
  console.log('  - Proyecto:', firebaserc.projects?.default || 'No definido');
} catch (error) {
  console.log('❌ Error en .firebaserc:', error.message);
}

// Verificar reglas de Firestore
try {
  const rules = fs.readFileSync(path.join(__dirname, 'firestore.rules'), 'utf8');
  console.log('✅ firestore.rules válido');
  console.log('  - Tamaño:', rules.length, 'caracteres');
  console.log('  - Contiene función isAuthenticated:', rules.includes('isAuthenticated()'));
  console.log('  - Contiene función isOwner:', rules.includes('isOwner('));
} catch (error) {
  console.log('❌ Error en firestore.rules:', error.message);
}

// Verificar índices de Firestore
try {
  const indexes = JSON.parse(fs.readFileSync(path.join(__dirname, 'firestore.indexes.json'), 'utf8'));
  console.log('✅ firestore.indexes.json válido');
  console.log('  - Número de índices:', indexes.indexes?.length || 0);
} catch (error) {
  console.log('❌ Error en firestore.indexes.json:', error.message);
}

// Verificar variables de entorno
console.log('\n🔐 Variables de entorno:');
const envVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

envVars.forEach(envVar => {
  const value = process.env[envVar];
  console.log(`${value ? '✅' : '❌'} ${envVar}: ${value ? 'Definida' : 'No definida'}`);
});

// Verificar package.json
console.log('\n📦 Scripts de package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const scripts = packageJson.scripts || {};
  
  const firebaseScripts = [
    'deploy:rules',
    'firebase:login',
    'firebase:init',
    'firebase:deploy'
  ];
  
  firebaseScripts.forEach(script => {
    console.log(`${scripts[script] ? '✅' : '❌'} ${script}: ${scripts[script] || 'No definido'}`);
  });
} catch (error) {
  console.log('❌ Error en package.json:', error.message);
}

console.log('\n==========================================');
console.log('✅ Verificación completada');
console.log('\n💡 Próximos pasos:');
console.log('1. Si hay errores, corrígelos antes de continuar');
console.log('2. Ejecuta: npm run deploy:rules');
console.log('3. Verifica en la consola de Firebase');
console.log('4. Prueba la aplicación con diferentes usuarios');
