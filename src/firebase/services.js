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
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from './config.js';

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
      console.log('notificationService.createNotification called with:', notificationData);
      
      const notificationDoc = {
        ...notificationData,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      console.log('Creating notification document:', notificationDoc);
      
      const docRef = await addDoc(collection(db, 'notifications'), notificationDoc);
      console.log('✅ Notification created with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
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
  },

  // Obtener todas las notificaciones (para debug)
  getAllNotifications: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'notifications'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all notifications:', error);
      return [];
    }
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

  // Escuchar mensajes en tiempo real
  subscribeToMessages: (conversationId, callback) => {
    console.log('chatService.subscribeToMessages called for:', conversationId);
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      console.log('chatService.subscribeToMessages: received snapshot with', querySnapshot.docs.length, 'messages');
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('chatService.subscribeToMessages: processed messages:', messages);
      callback(messages);
    }, (error) => {
      console.error('chatService.subscribeToMessages error:', error);
    });
  },

  // Enviar mensaje
  sendMessage: async (conversationId, senderId, messageText) => {
    try {
      console.log('chatService.sendMessage called:', { conversationId, senderId, messageText });
      
      // Obtener nombre del remitente
      const senderProfile = await userService.getUserProfile(senderId);
      const senderName = senderProfile?.name || 'Usuario';
      
      const messageData = {
        conversationId,
        senderId,
        senderName,
        message: messageText,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      const docRef = await addDoc(collection(db, 'messages'), messageData);
      console.log('✅ Message sent with ID:', docRef.id);
      
      // Actualizar la conversación con el último mensaje
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: messageText,
        lastMessageTime: new Date().toISOString()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Obtener o crear conversación entre dos usuarios
  getOrCreateConversation: async (userId1, userId2, petId = null) => {
    try {
      console.log('chatService.getOrCreateConversation called:', { userId1, userId2, petId });
      
      // Buscar conversación existente entre estos dos usuarios (sin importar el petId)
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId1)
      );
      const querySnapshot = await getDocs(q);
      
      const existingConversation = querySnapshot.docs.find(doc => {
        const data = doc.data();
        // Buscar conversación que contenga ambos usuarios, independientemente del petId
        return data.participants.includes(userId2) && data.participants.includes(userId1);
      });
      
      if (existingConversation) {
        console.log('✅ Found existing conversation:', existingConversation.id);
        
        // Si se proporciona un petId y la conversación no lo tiene, actualizarlo
        if (petId && existingConversation.data().petId !== petId) {
          console.log('Updating conversation with new petId:', petId);
          await updateDoc(doc(db, 'conversations', existingConversation.id), {
            petId: petId,
            lastMessageTime: new Date().toISOString()
          });
        }
        
        return existingConversation.id;
      }
      
      // Crear nueva conversación solo si no existe ninguna entre estos usuarios
      const conversationId = await chatService.createConversation([userId1, userId2], petId);
      console.log('✅ Created new conversation:', conversationId);
      return conversationId;
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
      throw error;
    }
  },

  // Marcar mensajes como leídos
  markMessagesAsRead: async (conversationId, userId) => {
    try {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        where('senderId', '!=', userId),
        where('read', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );
      
      await Promise.all(updatePromises);
      console.log(`✅ Marked ${updatePromises.length} messages as read`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  // Eliminar conversación y todos sus mensajes
  deleteConversation: async (conversationId) => {
    try {
      console.log('chatService.deleteConversation called for:', conversationId);
      
      // 1. Eliminar todos los mensajes de la conversación
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      
      console.log(`Found ${messagesSnapshot.size} messages to delete`);
      const deleteMessagesPromises = messagesSnapshot.docs.map(doc => {
        console.log('Deleting message:', doc.id);
        return deleteDoc(doc.ref);
      });
      
      if (deleteMessagesPromises.length > 0) {
        await Promise.all(deleteMessagesPromises);
        console.log('✅ Deleted all messages');
      }
      
      // 2. Eliminar la conversación
      console.log('Deleting conversation:', conversationId);
      await deleteDoc(doc(db, 'conversations', conversationId));
      console.log('✅ Conversation deleted successfully');
      
      return { success: true, deletedMessages: messagesSnapshot.size };
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
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

  // Obtener mascotas por dueño (sin orderBy para evitar índices)
  getPetsByOwner: async (ownerId) => {
    try {
      console.log('petService.getPetsByOwner called for ownerId:', ownerId);
      
      const q = query(
        collection(db, 'pets'),
        where('ownerId', '==', ownerId)
      );
      const querySnapshot = await getDocs(q);
      const pets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar manualmente por fecha de creación
      pets.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      console.log('Pets found for owner:', pets);
      return pets;
    } catch (error) {
      console.error('Error getting pets by owner:', error);
      return [];
    }
  },

  // Obtener mascotas por refugio (sin orderBy para evitar índices)
  getPetsByShelter: async (shelterId) => {
    try {
      console.log('petService.getPetsByShelter called for shelterId:', shelterId);
      
      const q = query(
        collection(db, 'pets'),
        where('shelterId', '==', shelterId)
      );
      const querySnapshot = await getDocs(q);
      const pets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar manualmente por fecha de creación
      pets.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      console.log('Pets found for shelter:', pets);
      return pets;
    } catch (error) {
      console.error('Error getting pets by shelter:', error);
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

  // Subir imagen a Firebase Storage
  uploadPetImage: async (file, petId) => {
    try {
      const imageRef = ref(storage, `pets/${petId}/${file.name}`);
      
      // Agregar timeout para evitar que se cuelgue
      const uploadPromise = uploadBytes(imageRef, file);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout')), 10000)
      );
      
      const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Crear nueva mascota
  createPet: async (petData, imageFile = null) => {
    try {
      // Si hay una imagen, intentar subirla a Firebase Storage primero
      let finalImageUrl = petData.img || '';
      
      if (imageFile && !petData.img) {
        try {
          console.log('Attempting to upload image to Firebase Storage...');
          const imageUrl = await petService.uploadPetImage(imageFile, 'temp-' + Date.now());
          finalImageUrl = imageUrl;
          console.log('Image uploaded successfully:', imageUrl);
        } catch (imageError) {
          console.error('Firebase Storage failed, using placeholder:', imageError);
          // Si falla Firebase Storage, usar una URL placeholder
          finalImageUrl = 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=400&auto=format&fit=crop';
          console.log('Using placeholder image:', finalImageUrl);
        }
      }

      // Crear el documento de la mascota con la imagen final
      const docRef = await addDoc(collection(db, 'pets'), {
        ...petData,
        img: finalImageUrl,
        createdAt: new Date().toISOString(),
        status: 'available',
        adoptionRequests: 0,
        ownerId: petData.ownerId || '',
        ownerName: petData.ownerName || '',
        shelterId: petData.shelterId || null,
        shelterName: petData.shelterName || null
      });

      console.log('Pet created successfully with ID:', docRef.id);
      
      // Si la mascota pertenece a un refugio, simular revisión del refugio
      if (petData.shelterId) {
        await shelterService.simulateShelterReview(petData.shelterId);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating pet:', error);
      throw error;
    }
  },

  // Actualizar mascota
  updatePet: async (petId, updateData) => {
    try {
      await updateDoc(doc(db, 'pets', petId), {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating pet:', error);
      throw error;
    }
  },

  // Actualizar solo el estado de una mascota
  updatePetStatus: async (petId, status) => {
    try {
      console.log('petService.updatePetStatus called for petId:', petId, 'status:', status);
      await updateDoc(doc(db, 'pets', petId), {
        status,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Pet status updated successfully');
    } catch (error) {
      console.error('Error updating pet status:', error);
      throw error;
    }
  },

  // Eliminar mascota
  deletePet: async (petId) => {
    try {
      console.log('petService.deletePet called for petId:', petId);
      
      // Primero obtener la información de la mascota
      const petDoc = await getDoc(doc(db, 'pets', petId));
      if (!petDoc.exists()) {
        throw new Error('Mascota no encontrada');
      }
      
      const petData = petDoc.data();
      const petName = petData.name;
      console.log('Deleting pet:', petName);
      
      // 1. Eliminar todas las solicitudes de adopción relacionadas
      console.log('Deleting adoption requests for pet:', petId);
      const adoptionRequestsQuery = query(
        collection(db, 'adoptionRequests'),
        where('petId', '==', petId)
      );
      const adoptionRequestsSnapshot = await getDocs(adoptionRequestsQuery);
      const adoptionRequests = adoptionRequestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Found ${adoptionRequests.length} adoption requests to delete`);
      const deleteAdoptionRequestsPromises = adoptionRequests.map(request => {
        console.log('Deleting adoption request:', request.id);
        return deleteDoc(doc(db, 'adoptionRequests', request.id));
      });
      
      if (deleteAdoptionRequestsPromises.length > 0) {
        await Promise.all(deleteAdoptionRequestsPromises);
        console.log('✅ Deleted all adoption requests');
      }
      
      // 2. Eliminar todas las notificaciones relacionadas
      console.log('Deleting notifications for pet:', petId);
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('petId', '==', petId)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const notifications = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Found ${notifications.length} notifications to delete`);
      const deleteNotificationsPromises = notifications.map(notification => {
        console.log('Deleting notification:', notification.id);
        return deleteDoc(doc(db, 'notifications', notification.id));
      });
      
      if (deleteNotificationsPromises.length > 0) {
        await Promise.all(deleteNotificationsPromises);
        console.log('✅ Deleted all notifications');
      }
      
      // 3. Actualizar conversaciones relacionadas con mensaje de mascota no disponible
      console.log('Updating conversations for pet:', petId);
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('petId', '==', petId)
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);
      const conversations = conversationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Found ${conversations.length} conversations to update`);
      const updateConversationsPromises = conversations.map(conversation => {
        console.log('Updating conversation:', conversation.id);
        // Agregar mensaje de sistema sobre mascota no disponible
        return addDoc(collection(db, 'messages'), {
          conversationId: conversation.id,
          senderId: 'system',
          message: `⚠️ ${petName} ya no está disponible para adopción.`,
          timestamp: new Date().toISOString(),
          read: false,
          isSystemMessage: true
        });
      });
      
      if (updateConversationsPromises.length > 0) {
        await Promise.all(updateConversationsPromises);
        console.log('✅ Added system messages to conversations');
      }
      
      // 4. Eliminar favoritos relacionados
      console.log('Deleting favorites for pet:', petId);
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('petId', '==', petId)
      );
      const favoritesSnapshot = await getDocs(favoritesQuery);
      const favorites = favoritesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Found ${favorites.length} favorites to delete`);
      const deleteFavoritesPromises = favorites.map(favorite => {
        console.log('Deleting favorite:', favorite.id);
        return deleteDoc(doc(db, 'favorites', favorite.id));
      });
      
      if (deleteFavoritesPromises.length > 0) {
        await Promise.all(deleteFavoritesPromises);
        console.log('✅ Deleted all favorites');
      }
      
      // 5. Finalmente, eliminar la mascota
      console.log('Deleting pet document:', petId);
      await deleteDoc(doc(db, 'pets', petId));
      console.log('✅ Pet deleted successfully');
      
      return {
        success: true,
        deleted: {
          adoptionRequests: adoptionRequests.length,
          notifications: notifications.length,
          conversations: conversations.length,
          favorites: favorites.length
        }
      };
      
    } catch (error) {
      console.error('Error deleting pet:', error);
      throw error;
    }
  }
};

// Servicios para Categorías
export const categoryService = {
  // Obtener todas las categorías
  getCategories: async () => {
    try {
      console.log('categoryService.getCategories called');
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Categories loaded from Firestore:', categories);
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  },

  // Crear nueva categoría
  createCategory: async (categoryData) => {
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...categoryData,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Actualizar categoría
  updateCategory: async (categoryId, updateData) => {
    try {
      await updateDoc(doc(db, 'categories', categoryId), {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }
};

// Servicios para Favoritos
export const favoriteService = {
  // Obtener favoritos de un usuario
  getFavorites: async (userId) => {
    try {
      console.log('favoriteService.getFavorites called for userId:', userId);
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const favorites = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Favorites loaded from Firestore:', favorites);
      return favorites;
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },

  // Agregar a favoritos
  addFavorite: async (userId, petId) => {
    try {
      console.log('favoriteService.addFavorite called for userId:', userId, 'petId:', petId);
      const docRef = await addDoc(collection(db, 'favorites'), {
        userId,
        petId,
        createdAt: new Date().toISOString()
      });
      console.log('Favorite added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  },

  // Remover de favoritos
  removeFavorite: async (userId, petId) => {
    try {
      console.log('favoriteService.removeFavorite called for userId:', userId, 'petId:', petId);
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('petId', '==', petId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('No favorite found to remove');
        return false;
      }

      // Eliminar todos los favoritos que coincidan (por si hay duplicados)
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log('Favorite removed successfully');
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  },

  // Verificar si una mascota está en favoritos
  isFavorite: async (userId, petId) => {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('petId', '==', petId)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }
};

// Servicios para Solicitudes de Adopción
export const adoptionRequestService = {
  // Crear solicitud de adopción
  createAdoptionRequest: async (adoptionData) => {
    try {
      console.log('adoptionRequestService.createAdoptionRequest called:', adoptionData);
      const docRef = await addDoc(collection(db, 'adoptionRequests'), {
        ...adoptionData,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      console.log('Adoption request created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating adoption request:', error);
      throw error;
    }
  },

  // Obtener solicitudes de adopción de un usuario
  getAdoptionRequests: async (userId) => {
    try {
      console.log('adoptionRequestService.getAdoptionRequests called for userId:', userId);
      const q = query(
        collection(db, 'adoptionRequests'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Adoption requests loaded from Firestore:', requests);
      return requests;
    } catch (error) {
      console.error('Error getting adoption requests:', error);
      return [];
    }
  },

  // Obtener solicitudes de adopción para las mascotas de un dueño
  getAdoptionRequestsForOwner: async (ownerId) => {
    try {
      console.log('adoptionRequestService.getAdoptionRequestsForOwner called for ownerId:', ownerId);
      const q = query(
        collection(db, 'adoptionRequests'),
        where('ownerId', '==', ownerId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Adoption requests for owner loaded from Firestore:', requests);
      console.log('Number of requests found:', requests.length);
      return requests;
    } catch (error) {
      console.error('Error getting adoption requests for owner:', error);
      return [];
    }
  },

  // Obtener solicitud de adopción por ID
  getAdoptionRequestById: async (requestId) => {
    try {
      console.log('adoptionRequestService.getAdoptionRequestById called for requestId:', requestId);
      const docRef = doc(db, 'adoptionRequests', requestId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const request = { id: docSnap.id, ...docSnap.data() };
        console.log('Adoption request loaded from Firestore:', request);
        return request;
      }
      return null;
    } catch (error) {
      console.error('Error getting adoption request:', error);
      return null;
    }
  },

  // Actualizar estado de solicitud de adopción
  updateAdoptionRequestStatus: async (requestId, status, ownerNotes = '') => {
    try {
      console.log('adoptionRequestService.updateAdoptionRequestStatus called for requestId:', requestId, 'status:', status);
      const updateData = {
        status,
        updatedAt: new Date().toISOString()
      };
      
      if (ownerNotes) {
        updateData.ownerNotes = ownerNotes;
      }
      
      await updateDoc(doc(db, 'adoptionRequests', requestId), updateData);
      console.log('Adoption request status updated successfully');
    } catch (error) {
      console.error('Error updating adoption request status:', error);
      throw error;
    }
  },

  // Aprobar solicitud y rechazar automáticamente las demás para la misma mascota
  approveAdoptionRequest: async (requestId, ownerNotes = '') => {
    try {
      console.log('adoptionRequestService.approveAdoptionRequest called for requestId:', requestId);
      
      // Primero obtener la solicitud para saber qué mascota es
      const request = await adoptionRequestService.getAdoptionRequestById(requestId);
      if (!request) {
        throw new Error('Solicitud no encontrada');
      }

      const petId = request.petId;
      console.log('Approving request for petId:', petId);

      // Aprobar la solicitud seleccionada
      await adoptionRequestService.updateAdoptionRequestStatus(requestId, 'approved', ownerNotes);
      console.log('✅ Request approved:', requestId);

      // Obtener todas las solicitudes pendientes para la misma mascota
      const q = query(
        collection(db, 'adoptionRequests'),
        where('petId', '==', petId),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      const pendingRequests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Found ${pendingRequests.length} pending requests for the same pet`);

      // Rechazar todas las demás solicitudes pendientes
      const rejectPromises = pendingRequests
        .filter(req => req.id !== requestId)
        .map(req => {
          console.log('Auto-rejecting request:', req.id);
          return adoptionRequestService.updateAdoptionRequestStatus(
            req.id, 
            'rejected', 
            'Esta solicitud fue rechazada automáticamente porque se aprobó otra solicitud para la misma mascota.'
          );
        });

      if (rejectPromises.length > 0) {
        await Promise.all(rejectPromises);
        console.log(`✅ Auto-rejected ${rejectPromises.length} other requests`);
      }

      // Actualizar el estado de la mascota a "adopted"
      await petService.updatePetStatus(petId, 'adopted');
      console.log('✅ Pet status updated to adopted');

      return { approved: requestId, rejected: pendingRequests.filter(req => req.id !== requestId).map(req => req.id) };
    } catch (error) {
      console.error('Error approving adoption request:', error);
      throw error;
    }
  },

  // Limpiar solicitudes rechazadas antiguas (más de 30 días)
  cleanOldRejectedRequests: async () => {
    try {
      console.log('adoptionRequestService.cleanOldRejectedRequests called');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

      const q = query(
        collection(db, 'adoptionRequests'),
        where('status', '==', 'rejected'),
        where('updatedAt', '<', thirtyDaysAgoISO)
      );
      
      const querySnapshot = await getDocs(q);
      const oldRejectedRequests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Found ${oldRejectedRequests.length} old rejected requests to clean`);

      const deletePromises = oldRejectedRequests.map(req => {
        console.log('Deleting old rejected request:', req.id);
        return deleteDoc(doc(db, 'adoptionRequests', req.id));
      });

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        console.log(`✅ Cleaned ${deletePromises.length} old rejected requests`);
      }

      return oldRejectedRequests.length;
    } catch (error) {
      console.error('Error cleaning old rejected requests:', error);
      throw error;
    }
  },

  // Obtener solicitudes pendientes para una mascota específica
  getPendingRequestsForPet: async (petId) => {
    try {
      console.log('adoptionRequestService.getPendingRequestsForPet called for petId:', petId);
      const q = query(
        collection(db, 'adoptionRequests'),
        where('petId', '==', petId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`Found ${requests.length} pending requests for pet ${petId}`);
      return requests;
    } catch (error) {
      console.error('Error getting pending requests for pet:', error);
      return [];
    }
  },

  // Rechazar solicitud de adopción
  rejectAdoptionRequest: async (requestId, ownerNotes = '') => {
    try {
      await adoptionRequestService.updateAdoptionRequestStatus(requestId, 'rejected', ownerNotes);
    } catch (error) {
      console.error('Error rejecting adoption request:', error);
      throw error;
    }
  }
};

// Servicios para Refugios
export const shelterService = {
  // Obtener todos los refugios
  getShelters: async () => {
    try {
      console.log('shelterService.getShelters called');
      const querySnapshot = await getDocs(collection(db, 'shelters'));
      const shelters = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Shelters loaded from Firestore:', shelters);
      return shelters;
    } catch (error) {
      console.error('Error getting shelters:', error);
      return [];
    }
  },

  // Obtener refugio por ID
  getShelterById: async (shelterId) => {
    try {
      console.log('shelterService.getShelterById called for shelterId:', shelterId);
      const docRef = doc(db, 'shelters', shelterId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const shelter = { id: docSnap.id, ...docSnap.data() };
        console.log('Shelter loaded from Firestore:', shelter);
        return shelter;
      }
      return null;
    } catch (error) {
      console.error('Error getting shelter:', error);
      return null;
    }
  },

  // Obtener refugios por dueño (sin orderBy para evitar índices)
  getSheltersByOwner: async (ownerId) => {
    try {
      console.log('shelterService.getSheltersByOwner called for ownerId:', ownerId);
      const q = query(
        collection(db, 'shelters'),
        where('ownerId', '==', ownerId)
      );
      const querySnapshot = await getDocs(q);
      const shelters = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar manualmente por fecha de creación
      shelters.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      console.log('Shelters for owner loaded from Firestore:', shelters);
      return shelters;
    } catch (error) {
      console.error('Error getting shelters by owner:', error);
      return [];
    }
  },

  // Crear nuevo refugio con validaciones básicas (SIN consultas a BD)
  createShelter: async (shelterData) => {
    try {
      console.log('shelterService.createShelter called:', shelterData);
      
      // Validaciones básicas SIN consultar la base de datos
      if (!shelterData.ownerId) {
        throw new Error('❌ Error: ownerId es requerido para crear un refugio');
      }
      
      if (!shelterData.name || shelterData.name.length < 3) {
        throw new Error('❌ Error: Nombre del refugio debe tener al menos 3 caracteres');
      }
      
      if (shelterData.name && shelterData.name.length > 100) {
        throw new Error('❌ Error: Nombre del refugio no puede exceder 100 caracteres');
      }
      
      // Validar que no contenga datos sospechosos
      const suspiciousPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i, /eval\(/i];
      const dataString = JSON.stringify(shelterData);
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(dataString)) {
          throw new Error('❌ Error: Datos contienen contenido sospechoso');
        }
      }
      
      const docRef = await addDoc(collection(db, 'shelters'), {
        ...shelterData,
        createdAt: new Date().toISOString(),
        verified: false,
        rating: 0,
        petsCount: 0,
        isPremium: false,
        premiumExpiry: null,
        status: 'pending' // pending, approved, rejected
      });
      console.log('✅ Shelter created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating shelter:', error);
      throw error;
    }
  },

  // Actualizar refugio
  updateShelter: async (shelterId, updateData) => {
    try {
      console.log('shelterService.updateShelter called for shelterId:', shelterId, 'updateData:', updateData);
      await updateDoc(doc(db, 'shelters', shelterId), {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      console.log('Shelter updated successfully');
    } catch (error) {
      console.error('Error updating shelter:', error);
      throw error;
    }
  },

  // Actualizar estado de verificación del refugio
  updateShelterStatus: async (shelterId, status) => {
    try {
      console.log('shelterService.updateShelterStatus called for shelterId:', shelterId, 'status:', status);
      await updateDoc(doc(db, 'shelters', shelterId), {
        status,
        updatedAt: new Date().toISOString()
      });
      console.log('Shelter status updated successfully');
    } catch (error) {
      console.error('Error updating shelter status:', error);
      throw error;
    }
  },

  // Activar suscripción premium
  activatePremium: async (shelterId, months = 1) => {
    try {
      console.log('shelterService.activatePremium called for shelterId:', shelterId, 'months:', months);
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + months);
      
      await updateDoc(doc(db, 'shelters', shelterId), {
        isPremium: true,
        premiumExpiry: expiryDate.toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('Premium subscription activated successfully');
    } catch (error) {
      console.error('Error activating premium subscription:', error);
      throw error;
    }
  },

  // Desactivar suscripción premium
  deactivatePremium: async (shelterId) => {
    try {
      console.log('shelterService.deactivatePremium called for shelterId:', shelterId);
      await updateDoc(doc(db, 'shelters', shelterId), {
        isPremium: false,
        premiumExpiry: null,
        updatedAt: new Date().toISOString()
      });
      console.log('Premium subscription deactivated successfully');
    } catch (error) {
      console.error('Error deactivating premium subscription:', error);
      throw error;
    }
  },

  // Verificar si un refugio tiene premium activo
  isPremiumActive: async (shelterId) => {
    try {
      const shelter = await shelterService.getShelterById(shelterId);
      if (!shelter) return false;
      
      if (!shelter.isPremium) return false;
      
      if (shelter.premiumExpiry) {
        const expiryDate = new Date(shelter.premiumExpiry);
        const now = new Date();
        return expiryDate > now;
      }
      
      return shelter.isPremium;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  },

  // Obtener refugios premium
  getPremiumShelters: async () => {
    try {
      console.log('shelterService.getPremiumShelters called');
      const q = query(
        collection(db, 'shelters'),
        where('isPremium', '==', true)
      );
      const querySnapshot = await getDocs(q);
      const shelters = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(shelter => shelter.status === 'approved')
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      console.log('Premium shelters loaded from Firestore:', shelters);
      return shelters;
    } catch (error) {
      console.error('Error getting premium shelters:', error);
      return [];
    }
  },

  // Obtener refugios regulares (no premium)
  getRegularShelters: async () => {
    try {
      console.log('shelterService.getRegularShelters called');
      const q = query(
        collection(db, 'shelters'),
        where('isPremium', '==', false)
      );
      const querySnapshot = await getDocs(q);
      const shelters = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(shelter => shelter.status === 'approved')
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      console.log('Regular shelters loaded from Firestore:', shelters);
      return shelters;
    } catch (error) {
      console.error('Error getting regular shelters:', error);
      return [];
    }
  },

  // Eliminar refugio
  deleteShelter: async (shelterId) => {
    try {
      console.log('shelterService.deleteShelter called for shelterId:', shelterId);
      
      // Obtener información del refugio
      const shelter = await shelterService.getShelterById(shelterId);
      if (!shelter) {
        throw new Error('Refugio no encontrado');
      }
      
      // Eliminar todas las mascotas del refugio
      const petsQuery = query(
        collection(db, 'pets'),
        where('shelterId', '==', shelterId)
      );
      const petsSnapshot = await getDocs(petsQuery);
      
      console.log(`Found ${petsSnapshot.size} pets to delete for shelter`);
      const deletePetsPromises = petsSnapshot.docs.map(petDoc => {
        console.log('Deleting pet:', petDoc.id);
        return deleteDoc(petDoc.ref);
      });
      
      if (deletePetsPromises.length > 0) {
        await Promise.all(deletePetsPromises);
        console.log('✅ Deleted all shelter pets');
      }
      
      // Eliminar el refugio
      await deleteDoc(doc(db, 'shelters', shelterId));
      console.log('✅ Shelter deleted successfully');
      
      return { success: true, deletedPets: petsSnapshot.size };
    } catch (error) {
      console.error('Error deleting shelter:', error);
      throw error;
    }
  },

  // Subir imagen del refugio a Firebase Storage
  uploadShelterImage: async (file, shelterId) => {
    try {
      const imageRef = ref(storage, `shelters/${shelterId}/${file.name}`);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading shelter image:', error);
      throw error;
    }
  },

  // Simular revisión del refugio después de subir primera mascota
  simulateShelterReview: async (shelterId) => {
    try {
      console.log('🔍 Simulando revisión del refugio:', shelterId);
      
      // Obtener el refugio
      const shelter = await shelterService.getShelterById(shelterId);
      if (!shelter) {
        console.log('❌ Refugio no encontrado para revisión');
        return;
      }

      // Simular tiempo de procesamiento (2-5 segundos)
      const reviewTime = Math.random() * 3000 + 2000;
      await new Promise(resolve => setTimeout(resolve, reviewTime));

      // Simular resultado de la revisión (90% aprobado, 10% pendiente)
      const isApproved = Math.random() > 0.1;
      const newStatus = isApproved ? 'active' : 'pending';
      
      // Actualizar estado del refugio
      await shelterService.updateShelterStatus(shelterId, newStatus);
      
      // Crear notificación para el dueño del refugio
      const notificationData = {
        userId: shelter.ownerId,
        type: 'shelter_review',
        title: isApproved ? '✅ Refugio Aprobado' : '⏳ Refugio en Revisión',
        message: isApproved 
          ? `¡Felicidades! Tu refugio "${shelter.name}" ha sido aprobado y está activo.`
          : `Tu refugio "${shelter.name}" está siendo revisado. Te notificaremos cuando esté listo.`,
        shelterId: shelterId,
        shelterName: shelter.name
      };
      
      await notificationService.createNotification(notificationData);
      
      console.log(`✅ Simulación de revisión completada: ${newStatus}`);
    } catch (error) {
      console.error('❌ Error en simulación de revisión:', error);
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

  // Obtener todos los usuarios (para búsqueda)
  getAllUsers: async () => {
    try {
      console.log('getAllUsers called');
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      console.log(`Found ${users.length} users`);
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
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
