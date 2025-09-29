import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/AdoptionDetails.css";
import NavBar from "../components/navbar.jsx";

function AdoptionDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { adoption } = location.state || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!adoption) {
      navigate("/tracking");
      return;
    }

    // Cargar mensajes de la adopción
    try {
      const storedMessages = JSON.parse(localStorage.getItem(`messages_${adoption.id}`) || "[]");
      setMessages(storedMessages);
    } catch (e) {
      console.error("Error loading messages", e);
    }
  }, [adoption, navigate]);

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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      content: newMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    setNewMessage("");

    // Guardar en localStorage
    try {
      localStorage.setItem(`messages_${adoption.id}`, JSON.stringify(updatedMessages));
    } catch (e) {
      console.error("Error saving message", e);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (window.confirm(`¿Cambiar estado a ${newStatus}?`)) {
      try {
        const adoptions = JSON.parse(localStorage.getItem("adoptions") || "[]");
        const updatedAdoptions = adoptions.map(ad => 
          ad.id === adoption.id ? { ...ad, status: newStatus } : ad
        );
        localStorage.setItem("adoptions", JSON.stringify(updatedAdoptions));
        
        // Actualizar la adopción local
        adoption.status = newStatus;
        alert("Estado actualizado correctamente");
      } catch (e) {
        console.error("Error updating status", e);
        alert("Error al actualizar el estado");
      }
    }
  };

  if (!adoption) return null;

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
          <div className="pet-image">
            <img src={adoption.pet.img} alt={adoption.pet.name} />
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
          
          {adoption.status === "pending" && (
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

          {adoption.status === "approved" && (
            <div className="status-actions">
              <button 
                className="action-button complete"
                onClick={() => handleStatusChange("completed")}
              >
                Marcar como Completada
              </button>
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
