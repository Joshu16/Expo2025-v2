import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Conversations.css';
import NavBar from '../components/navbar.jsx';
import { chatService, userService, petService } from '../firebase/services.js';

function Conversations({ user }) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swipedItem, setSwipedItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!user?.uid) {
      navigate('/login');
      return;
    }

    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const conversationsData = await chatService.getConversations(user.uid);
      
      // Enriquecer las conversaciones con información del otro usuario y la mascota
      const enrichedConversations = await Promise.all(
        conversationsData.map(async (conversation) => {
          const otherUserId = conversation.participants.find(id => id !== user.uid);
          const otherUser = otherUserId ? await userService.getUserProfile(otherUserId) : null;
          const pet = conversation.petId ? await petService.getPetById(conversation.petId) : null;
          
          return {
            ...conversation,
            otherUser: otherUser || { uid: otherUserId, name: 'Usuario' },
            pet
          };
        })
      );
      
      setConversations(enrichedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 días
      return date.toLocaleDateString('es-ES', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const handleConversationClick = (conversationId) => {
    navigate(`/chat/${conversationId}`);
  };

  // Funciones para manejar el swipe
  const handleTouchStart = (e, conversationId) => {
    if (swipedItem && swipedItem !== conversationId) {
      setSwipedItem(null);
    }
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    isDragging.current = false;
  };

  const handleTouchMove = (e, conversationId) => {
    if (!touchStartX.current) return;
    
    touchCurrentX.current = e.touches[0].clientX;
    const deltaX = touchStartX.current - touchCurrentX.current;
    
    if (Math.abs(deltaX) > 10) {
      isDragging.current = true;
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e, conversationId) => {
    if (!isDragging.current) return;
    
    const deltaX = touchStartX.current - touchCurrentX.current;
    const threshold = 80; // Píxeles necesarios para activar el swipe
    
    if (deltaX > threshold) {
      // Swipe hacia la izquierda - mostrar opción de borrar
      setSwipedItem(conversationId);
    } else {
      // Swipe insuficiente - resetear
      setSwipedItem(null);
    }
    
    touchStartX.current = 0;
    touchCurrentX.current = 0;
    isDragging.current = false;
  };

  const handleDeleteClick = (e, conversationId) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!conversationToDelete) return;
    
    try {
      // Eliminar conversación de la base de datos
      const result = await chatService.deleteConversation(conversationToDelete);
      
      // Remover del estado local
      setConversations(prev => prev.filter(conv => conv.id !== conversationToDelete));
      setShowDeleteConfirm(false);
      setConversationToDelete(null);
      setSwipedItem(null);
      
      console.log('Conversación eliminada:', conversationToDelete, 'Mensajes eliminados:', result.deletedMessages);
    } catch (error) {
      console.error('Error al eliminar conversación:', error);
      // En caso de error, también removemos del estado local para mantener consistencia
      setConversations(prev => prev.filter(conv => conv.id !== conversationToDelete));
      setShowDeleteConfirm(false);
      setConversationToDelete(null);
      setSwipedItem(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setConversationToDelete(null);
    setSwipedItem(null);
  };

  if (loading) {
    return (
      <div className="conversations-container">
        <NavBar />
        <div className="conversations-loading">
          <div className="loading-spinner"></div>
          <p>Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversations-container">
      <NavBar />
      
      <div className="conversations-header">
        <h1>Conversaciones</h1>
        <p>Gestiona tus mensajes con otros usuarios</p>
      </div>

      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <div className="no-conversations-icon">💬</div>
            <h3>No tienes conversaciones</h3>
            <p>Las conversaciones aparecerán aquí cuando alguien te envíe un mensaje</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div 
              key={conversation.id}
              className={`conversation-item ${swipedItem === conversation.id ? 'swiped' : ''}`}
              onClick={() => !isDragging.current && handleConversationClick(conversation.id)}
              onTouchStart={(e) => handleTouchStart(e, conversation.id)}
              onTouchMove={(e) => handleTouchMove(e, conversation.id)}
              onTouchEnd={(e) => handleTouchEnd(e, conversation.id)}
            >
              <div className="conversation-avatar">
                {conversation.otherUser.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="conversation-content">
                <div className="conversation-header">
                  <h3>{conversation.otherUser.name}</h3>
                  <span className="conversation-time">
                    {formatTime(conversation.lastMessageTime)}
                  </span>
                </div>
                
                {conversation.pet && (
                  <div className="conversation-pet">
                    <span className="pet-label">Sobre:</span>
                    <span className="pet-name">{conversation.pet.name}</span>
                  </div>
                )}
                
                <p className="conversation-preview">
                  {conversation.lastMessage || 'Sin mensajes'}
                </p>
              </div>
              
              {swipedItem === conversation.id && (
                <div className="conversation-actions">
                  <button 
                    className="delete-button"
                    onClick={(e) => handleDeleteClick(e, conversation.id)}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>¿Eliminar conversación?</h3>
            </div>
            <div className="delete-modal-content">
              <p>Esta acción no se puede deshacer. Se eliminarán todos los mensajes de esta conversación.</p>
            </div>
            <div className="delete-modal-actions">
              <button 
                className="cancel-button"
                onClick={cancelDelete}
              >
                Cancelar
              </button>
              <button 
                className="confirm-delete-button"
                onClick={confirmDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Conversations;
