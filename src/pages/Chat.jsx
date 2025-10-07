import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import '../styles/Chat.css';
import NavBar from '../components/navbar.jsx';
import { chatService, userService } from '../firebase/services.js';

function Chat() {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) {
      navigate('/login');
      return;
    }

    if (conversationId) {
      loadMessages();
      loadOtherUser();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [conversationId, user]);

  // Efecto para hacer scroll automático cuando cambian los mensajes
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      console.log('Chat: Loading messages for conversation:', conversationId);
      
      // Suscribirse a mensajes en tiempo real
      unsubscribeRef.current = chatService.subscribeToMessages(conversationId, (newMessages) => {
        console.log('Chat: Received messages:', newMessages);
        setMessages(newMessages);
        
        // Scroll al final después de que se actualice el DOM
        setTimeout(() => {
          scrollToBottom();
        }, 100);
        
        // Marcar mensajes como leídos
        chatService.markMessagesAsRead(conversationId, user.uid);
      });
      
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOtherUser = async () => {
    try {
      // Obtener información de la conversación para identificar al otro usuario
      const conversations = await chatService.getConversations(user.uid);
      const currentConversation = conversations.find(conv => conv.id === conversationId);
      
      if (currentConversation) {
        const otherUserId = currentConversation.participants.find(id => id !== user.uid);
        if (otherUserId) {
          try {
            const otherUserData = await userService.getUserProfile(otherUserId);
            console.log('Chat: Other user loaded:', otherUserData);
            
            // Si no tiene nombre, usar displayName o email
            if (otherUserData && !otherUserData.name) {
              otherUserData.name = otherUserData.displayName || 
                                  otherUserData.email?.split('@')[0] || 
                                  'Usuario';
            }
            
            setOtherUser(otherUserData || { 
              uid: otherUserId, 
              name: 'Usuario' // Solo "Usuario" como fallback, no el ID
            });
          } catch (error) {
            console.error('Error loading other user profile:', error);
            setOtherUser({ 
              uid: otherUserId, 
              name: 'Usuario' // Solo "Usuario" como fallback, no el ID
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading other user:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      console.log('Chat: Sending message:', { conversationId, message: newMessage.trim() });
      await chatService.sendMessage(conversationId, user.uid, newMessage.trim());
      console.log('Chat: Message sent successfully');
      setNewMessage('');
      
      // Scroll al final después de enviar mensaje
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  if (loading) {
    return (
      <div className="chat-container">
        <NavBar />
        <div className="chat-loading">
          <div className="loading-spinner"></div>
          <p>Cargando conversación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <NavBar />
      
      <div className="chat-header">
        <button 
          className="back-button"
          onClick={() => navigate('/conversations')}
        >
          ← Volver
        </button>
        <div className="chat-user-info">
          <div className="user-avatar">
            {otherUser?.name ? otherUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-details">
            <h3>{otherUser?.name || 'Usuario'}</h3>
            <p>En línea</p>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No hay mensajes aún. ¡Envía el primero!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.senderId === user.uid;
            const isSystem = message.senderId === 'system' || message.isSystemMessage;
            const showDate = index === 0 || 
              formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
            
            // Mensaje del sistema
            if (isSystem) {
              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="message-date">
                      {formatDate(message.timestamp)}
                    </div>
                  )}
                  <div className="message system">
                    <div className="message-content">
                      <p>{message.message}</p>
                      <span className="message-time">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            
            // Mensaje normal
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="message-date">
                    {formatDate(message.timestamp)}
                  </div>
                )}
                <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                  {!isOwn && (
                    <div className="message-sender">
                      {message.senderName || 'Usuario'}
                    </div>
                  )}
                  <div className="bubble-content">
                    <p>{message.message}</p>
                    <span className="bubble-time">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          disabled={sending}
          maxLength={500}
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim() || sending}
          className="send-button"
        >
          {sending ? '⏳' : '📤'}
        </button>
      </form>
    </div>
  );
}

export default Chat;