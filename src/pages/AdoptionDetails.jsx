import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import "../styles/App.css";
import "../styles/AdoptionDetails.css";
import NavBar from "../components/navbar.jsx";
import { adoptionRequestService, chatService } from "../firebase/services.js";

function AdoptionDetails() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { requestId } = useParams();
  const adoptionFromState = location.state?.adoption;
  
  const [adoption, setAdoption] = useState(adoptionFromState);
  const [loading, setLoading] = useState(!adoptionFromState);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    if (adoptionFromState) {
      // Si la adopción viene del estado, usarla directamente
      setAdoption(adoptionFromState);
      setLoading(false);
      loadMessages(adoptionFromState.id);
    } else if (requestId) {
      // Si solo tenemos el ID, cargar la adopción desde Firebase
      loadAdoptionFromFirebase(requestId);
    } else {
      // Si no hay adopción ni ID, redirigir al tracking
      navigate("/tracking");
      return;
    }
  }, [adoptionFromState, requestId, navigate, user]);

  const loadAdoptionFromFirebase = async (requestId) => {
    try {
      console.log('Loading adoption request from Firebase with ID:', requestId);
      setLoading(true);
      const adoptionData = await adoptionRequestService.getAdoptionRequestById(requestId);
      
      if (adoptionData) {
        console.log('Adoption request loaded from Firebase:', adoptionData);
        setAdoption(adoptionData);
        loadMessages(adoptionData.id);
      } else {
        console.log('Adoption request not found in Firebase');
        navigate("/tracking");
      }
    } catch (error) {
      console.error('Error loading adoption request from Firebase:', error);
      navigate("/tracking");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (adoptionId) => {
    try {
      // Buscar conversación existente para esta adopción
      const conversations = await chatService.getConversations(user?.uid);
      const existingConversation = conversations.find(conv => 
        conv.petId === adoption.petId || conv.adoptionRequestId === adoptionId
      );

      if (existingConversation) {
        setConversationId(existingConversation.id);
        const messagesData = await chatService.getMessages(existingConversation.id);
        setMessages(messagesData);
      } else {
        // Crear nueva conversación si no existe
        const newConversationId = await chatService.createConversation(
          [user.uid, adoption.pet.ownerId || 'admin'], // Asumiendo que hay un ownerId en pet
          adoption.petId,
          adoptionId
        );
        setConversationId(newConversationId);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      // Fallback a localStorage si hay error
      try {
        const storedMessages = JSON.parse(localStorage.getItem(`messages_${adoptionId}`) || "[]");
        setMessages(storedMessages);
      } catch (e) {
        console.error("Error loading messages from localStorage:", e);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#f59e0b";
      case "approved": return "#10b981";
      case "rejected": return "#ef4444";
      case "completed": return "#3b82f6";
      default: return "#6b7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Pendiente de revisión";
      case "approved": return "Aprobada - Contacta al dueño";
      case "rejected": return "Rechazada";
      case "completed": return "Adopción completada";
      default: return "Desconocido";
    }
  };

  const handleStartChat = async () => {
    try {
      if (!adoption || !user?.uid) return;

      // Determinar el otro usuario (adoptador o dueño)
      const otherUserId = adoption.userId === user.uid ? adoption.pet.ownerId : adoption.userId;
      
      if (!otherUserId) {
        alert('No se pudo identificar al otro usuario');
        return;
      }

      // Obtener o crear conversación
      const conversationId = await chatService.getOrCreateConversation(
        user.uid, 
        otherUserId, 
        adoption.pet.id
      );

      // Navegar al chat
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Error al iniciar el chat');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    try {
      const messageData = {
        content: newMessage,
        senderId: user.uid,
        senderName: user.displayName || 'Usuario',
        type: 'text'
      };

      await chatService.sendMessage(conversationId, messageData);
      setNewMessage("");
      
      // Recargar mensajes para mostrar el nuevo
      const updatedMessages = await chatService.getMessages(conversationId);
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error sending message:", error);
      // Fallback a localStorage si hay error
      const message = {
        id: Date.now(),
        content: newMessage,
        sender: "user",
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, message];
      setMessages(updatedMessages);
      setNewMessage("");

      try {
        localStorage.setItem(`messages_${adoption.id}`, JSON.stringify(updatedMessages));
      } catch (e) {
        console.error("Error saving message to localStorage", e);
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    // Verificar si el usuario es el dueño de la mascota
    if (adoption.pet.ownerId !== user?.uid) {
      alert("Solo el dueño de la mascota puede aprobar o rechazar solicitudes de adopción");
      return;
    }

    if (window.confirm(`¿Cambiar estado a ${newStatus}?`)) {
      try {
        await adoptionRequestService.updateAdoptionRequestStatus(adoption.id, newStatus);
        
        // Actualizar la adopción local
        setAdoption(prev => ({ ...prev, status: newStatus }));
        alert("Estado actualizado correctamente");
      } catch (error) {
        console.error("Error updating status:", error);
        alert("Error al actualizar el estado");
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <header>
          <button className="back-button" onClick={() => navigate("/tracking")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Volver
          </button>
          <h2 className="logo-text">Detalles de Adopción</h2>
        </header>
        <main>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando detalles de adopción...</p>
          </div>
        </main>
        <NavBar />
      </div>
    );
  }

  if (!adoption) {
    return (
      <div className="container">
        <header>
          <button className="back-button" onClick={() => navigate("/tracking")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Volver
          </button>
          <h2 className="logo-text">Detalles de Adopción</h2>
        </header>
        <main>
          <div className="error-message">
            <p>No se encontró la solicitud de adopción.</p>
            <button onClick={() => navigate("/tracking")}>Volver al seguimiento</button>
          </div>
        </main>
        <NavBar />
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <button className="back-button" onClick={() => navigate("/tracking")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Volver
        </button>
        <h2 className="logo-text">Detalles de Adopción</h2>
      </header>

      <main className="adoption-details-main">
        {/* Información de la mascota */}
        <div className="pet-section">
          <div className="pet-image-container">
            <img src={adoption.pet.img} alt={adoption.pet.name} className="pet-detail-image" />
          </div>
          <div className="pet-info">
            <h1>{adoption.pet.name}</h1>
            <p className="pet-breed">{adoption.pet.breed}</p>
            <div className="pet-details">
              <span>🐾 {adoption.pet.age}</span>
              <span>⚥ {adoption.pet.gender}</span>
              <span>📍 {adoption.pet.location}</span>
            </div>
          </div>
        </div>

        {/* Estado de la adopción */}
        <div className="status-section">
          <div className="status-header">
            <h3>Estado de la Adopción</h3>
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(adoption.status) }}
            >
              {getStatusText(adoption.status)}
            </span>
          </div>
          
          {adoption.status === "pending" && adoption.pet.ownerId === user?.uid && (
            <div className="status-actions">
              <button 
                className="action-button approve"
                onClick={() => handleStatusChange("approved")}
              >
                Aprobar Adopción
              </button>
              <button 
                className="action-button reject"
                onClick={() => handleStatusChange("rejected")}
              >
                Rechazar
              </button>
            </div>
          )}

          {/* Botón de chat para comunicarse */}
          {adoption && user?.uid && (
            <div className="chat-actions">
              <button 
                className="action-button chat"
                onClick={handleStartChat}
              >
                💬 Iniciar Chat
              </button>
            </div>
          )}

          {adoption.status === "approved" && adoption.pet.ownerId === user?.uid && (
            <div className="status-actions">
              <button 
                className="action-button complete"
                onClick={() => handleStatusChange("completed")}
              >
                Marcar como Completada
              </button>
            </div>
          )}

          {adoption.pet.ownerId !== user?.uid && (
            <div className="status-info">
              <p>Esta solicitud está siendo revisada por el dueño de la mascota.</p>
            </div>
          )}
        </div>

        {/* Información del adoptante */}
        <div className="adopter-section">
          <h3>Información del Adoptante</h3>
          <div className="adopter-info">
            <div className="info-item">
              <label>Nombre:</label>
              <span>{adoption.adopterName}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{adoption.adopterEmail}</span>
            </div>
            <div className="info-item">
              <label>Teléfono:</label>
              <span>{adoption.adopterPhone}</span>
            </div>
            <div className="info-item">
              <label>Fecha de solicitud:</label>
              <span>{new Date(adoption.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Chat/Mensajes */}
        <div className="messages-section">
          <h3>Conversación</h3>
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No hay mensajes aún. ¡Inicia la conversación!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.sender === "user" ? "user-message" : "other-message"}`}
                >
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="message-input"
            />
            <button type="submit" className="send-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
        </div>
      </main>

      <NavBar />
    </div>
  );
}

export default AdoptionDetails;
