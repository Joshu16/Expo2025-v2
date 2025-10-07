#!/usr/bin/env node

/**
 * Script para desplegar las reglas de Firestore
 * Uso: node deploy-rules.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Desplegando reglas de Firestore...');

try {
  // Verificar que el archivo de reglas existe
  const rulesPath = path.join(__dirname, 'firestore.rules');
  if (!fs.existsSync(rulesPath)) {
    throw new Error('❌ Archivo firestore.rules no encontrado');
  }

  console.log('📋 Reglas encontradas en:', rulesPath);

  // Verificar que Firebase CLI está instalado
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI está instalado');
  } catch (error) {
    throw new Error('❌ Firebase CLI no está instalado. Instálalo con: npm install -g firebase-tools');
  }

  // Verificar que estamos en un proyecto Firebase
  try {
    execSync('firebase projects:list', { stdio: 'pipe' });
    console.log('✅ Conectado a Firebase');
  } catch (error) {
    throw new Error('❌ No estás conectado a Firebase. Ejecuta: firebase login');
  }

  // Desplegar las reglas
  console.log('📤 Desplegando reglas...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });

  console.log('✅ Reglas desplegadas exitosamente!');
  console.log('🔗 Ve a la consola de Firebase para verificar: https://console.firebase.google.com');

} catch (error) {
  console.error('❌ Error desplegando reglas:', error.message);
  process.exit(1);
}
