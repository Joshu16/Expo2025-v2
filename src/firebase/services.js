import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './config.js';

// Servicios para Notificaciones
export const notificationService = {
  // Obtener todas las notificaciones de un usuario
  getNotifications: async (userId) => {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },

  // Crear nueva notificación
  createNotification: async (notificationData) => {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        timestamp: new Date().toISOString(),
        read: false
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Marcar notificación como leída
  markAsRead: async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Escuchar cambios en notificaciones en tiempo real
  subscribeToNotifications: (userId, callback) => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(notifications);
    });
  }
};

// Servicios para Conversaciones/Chat
export const chatService = {
  // Obtener conversaciones de un usuario
  getConversations: async (userId) => {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  },

  // Crear nueva conversación
  createConversation: async (participants, petId = null) => {
    try {
      const conversationData = {
        participants,
        petId,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Obtener mensajes de una conversación
  getMessages: async (conversationId) => {
    try {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },

  // Enviar mensaje
  sendMessage: async (conversationId, messageData) => {
    try {
      const message = {
        ...messageData,
        conversationId,
        timestamp: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'messages'), message);
      
      // Actualizar la conversación con el último mensaje
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: messageData.content,
        lastMessageTime: message.timestamp
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Escuchar mensajes en tiempo real
  subscribeToMessages: (conversationId, callback) => {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
  }
};

// Servicios para Mascotas
export const petService = {
  // Obtener todas las mascotas
  getPets: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'pets'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting pets:', error);
      return [];
    }
  },

  // Obtener mascota por ID
  getPetById: async (petId) => {
    try {
      const docRef = doc(db, 'pets', petId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting pet:', error);
      return null;
    }
  },

  // Crear nueva mascota
  createPet: async (petData) => {
    try {
      const docRef = await addDoc(collection(db, 'pets'), {
        ...petData,
        createdAt: new Date().toISOString(),
        status: 'available'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating pet:', error);
      throw error;
    }
  },

  // Actualizar mascota
  updatePet: async (petId, updateData) => {
    try {
      await updateDoc(doc(db, 'pets', petId), updateData);
    } catch (error) {
      console.error('Error updating pet:', error);
      throw error;
    }
  }
};

// Servicios para Usuarios
export const userService = {
  // Crear perfil de usuario
  createUserProfile: async (userId, userData) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  // Obtener perfil de usuario
  getUserProfile: async (userId) => {
    try {
      console.log('getUserProfile called with userId:', userId);
      const docRef = doc(db, 'users', userId);
      console.log('Document reference created:', docRef.path);
      const docSnap = await getDoc(docRef);
      console.log('Document snapshot:', docSnap.exists() ? 'exists' : 'does not exist');
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        console.log('User profile data:', data);
        return data;
      }
      console.log('No user profile found');
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  // Actualizar perfil de usuario
  updateUserProfile: async (userId, updateData) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
};
