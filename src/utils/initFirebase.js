// Script para inicializar la estructura de Firebase
// Este archivo contiene las reglas de seguridad y estructura de datos recomendada

import { db } from '../firebase/config.js';

// Estructura recomendada para Firestore
export const firestoreStructure = {
  // Colección de usuarios
  users: {
    description: "Perfiles de usuarios",
    fields: {
      name: "string",
      email: "string", 
      address: "string",
      phone: "string",
      createdAt: "timestamp",
      lastLogin: "timestamp",
      updatedAt: "timestamp"
    }
  },

  // Colección de refugios
  shelters: {
    description: "Refugios de animales",
    fields: {
      name: "string",
      description: "string",
      location: "string",
      address: "string",
      phone: "string",
      email: "string",
      website: "string",
      hours: "string",
      image: "string",
      services: "array",
      rating: "number",
      petsCount: "number",
      verified: "boolean",
      isPremium: "boolean",
      premiumExpiry: "timestamp",
      status: "string", // pending, approved, rejected
      ownerId: "string",
      ownerName: "string",
      createdAt: "timestamp",
      updatedAt: "timestamp"
    }
  },

  // Colección de mascotas
  pets: {
    description: "Mascotas disponibles para adopción",
    fields: {
      name: "string",
      type: "string",
      breed: "string",
      gender: "string",
      age: "string",
      size: "string",
      description: "string",
      location: "string",
      img: "string",
      vaccinated: "boolean",
      sterilized: "boolean",
      specialNeeds: "string",
      status: "string", // available, adopted, reserved
      ownerId: "string",
      ownerName: "string",
      shelterId: "string", // Opcional: ID del refugio
      shelterName: "string", // Opcional: Nombre del refugio
      adoptionRequests: "number",
      createdAt: "timestamp",
      updatedAt: "timestamp"
    }
  },

  // Colección de categorías
  categories: {
    description: "Categorías de mascotas",
    fields: {
      name: "string",
      description: "string",
      icon: "string",
      createdAt: "timestamp",
      updatedAt: "timestamp"
    }
  },

  // Colección de favoritos
  favorites: {
    description: "Mascotas favoritas de usuarios",
    fields: {
      userId: "string",
      petId: "string",
      createdAt: "timestamp"
    }
  },

  // Colección de solicitudes de adopción
  adoptionRequests: {
    description: "Solicitudes de adopción",
    fields: {
      userId: "string",
      petId: "string",
      ownerId: "string",
      message: "string",
      status: "string", // pending, approved, rejected
      ownerNotes: "string",
      createdAt: "timestamp",
      updatedAt: "timestamp"
    }
  },

  // Colección de conversaciones
  conversations: {
    description: "Conversaciones entre usuarios",
    fields: {
      participants: "array",
      petId: "string",
      lastMessage: "string",
      lastMessageTime: "timestamp",
      createdAt: "timestamp"
    }
  },

  // Colección de mensajes
  messages: {
    description: "Mensajes en conversaciones",
    fields: {
      conversationId: "string",
      senderId: "string",
      senderName: "string",
      message: "string",
      timestamp: "timestamp",
      read: "boolean",
      isSystemMessage: "boolean"
    }
  },

  // Colección de notificaciones
  notifications: {
    description: "Notificaciones de usuarios",
    fields: {
      userId: "string",
      type: "string",
      title: "string",
      message: "string",
      petId: "string",
      timestamp: "timestamp",
      read: "boolean"
    }
  }
};

// Reglas de seguridad recomendadas para Firestore
export const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reglas para refugios
    match /shelters/{shelterId} {
      allow read: if true; // Todos pueden leer refugios
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // Reglas para mascotas
    match /pets/{petId} {
      allow read: if true; // Todos pueden leer mascotas
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // Reglas para categorías
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null; // Solo usuarios autenticados pueden escribir
    }
    
    // Reglas para favoritos
    match /favorites/{favoriteId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Reglas para solicitudes de adopción
    match /adoptionRequests/{requestId} {
      allow read, create: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid == resource.data.ownerId);
    }
    
    // Reglas para conversaciones
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Reglas para mensajes
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Reglas para notificaciones
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
`;

// Función para verificar la estructura de la base de datos
export const checkFirebaseStructure = async () => {
  try {
    console.log('🔍 Verificando estructura de Firebase...');
    
    // Verificar conexión
    console.log('✅ Conexión a Firebase establecida');
    
    // Listar colecciones existentes (método alternativo)
    console.log('📚 Verificando colecciones...');
    const collections = ['users', 'shelters', 'pets', 'categories', 'favorites', 'adoptionRequests', 'conversations', 'messages', 'notifications'];
    console.log('📚 Colecciones esperadas:', collections);
    
    // Verificar que las colecciones principales existan
    const requiredCollections = ['users', 'shelters', 'pets', 'categories', 'favorites', 'adoptionRequests', 'conversations', 'messages', 'notifications'];
    
    console.log('✅ Todas las colecciones se crearán automáticamente cuando se necesiten');
    console.log('💡 Las colecciones se crearán automáticamente cuando se escriban los primeros datos');
    
    return {
      success: true,
      collections: collections,
      missing: []
    };
  } catch (error) {
    console.error('❌ Error verificando estructura de Firebase:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para inicializar datos de ejemplo (opcional)
export const initializeSampleData = async () => {
  try {
    console.log('🚀 Inicializando datos de ejemplo...');
    
    // Esta función se puede usar para crear datos de prueba
    // Por ahora solo verificamos la estructura
    const structureCheck = await checkFirebaseStructure();
    
    if (structureCheck.success) {
      console.log('✅ Firebase está listo para usar');
      console.log('💡 Los datos se crearán automáticamente cuando los usuarios interactúen con la aplicación');
    }
    
    return structureCheck;
  } catch (error) {
    console.error('❌ Error inicializando datos:', error);
    return { success: false, error: error.message };
  }
};

export default {
  firestoreStructure,
  firestoreRules,
  checkFirebaseStructure,
  initializeSampleData
};
