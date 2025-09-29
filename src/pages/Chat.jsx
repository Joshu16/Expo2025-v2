import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/Chat.css";
import NavBar from "../components/navbar.jsx";

function Chat() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Cargar conversaciones desde localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("conversations") || "[]");
      setConversations(stored);
    } catch (e) {
      console.error("Error loading conversations", e);
    }
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      // Cargar mensajes de la conversación seleccionada
      try {
        const storedMessages = JSON.parse(
          localStorage.getItem(`messages_${selectedConversation.id}`) || "[]"
        );
        setMessages(storedMessages);
      } catch (e) {
        console.error("Error loading messages", e);
      }
    }
  }, [selectedConversation]);

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

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
      localStorage.setItem(`messages_${selectedConversation.id}`, JSON.stringify(updatedMessages));
    } catch (e) {
      console.error("Error saving message", e);
    }

    // Simular respuesta automática después de 2 segundos
    setTimeout(() => {
      const autoReply = {
        id: Date.now() + 1,
        content: "Gracias por tu mensaje. Te responderé pronto.",
        sender: "other",
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, autoReply];
      setMessages(finalMessages);

      try {
        localStorage.setItem(`messages_${selectedConversation.id}`, JSON.stringify(finalMessages));
      } catch (e) {
        console.error("Error saving auto-reply", e);
      }
    }, 2000);
  };

  const startNewConversation = () => {
    const newConversation = {
      id: Date.now(),
      name: "Nueva Conversación",
      lastMessage: "Iniciar conversación",
      timestamp: new Date().toISOString(),
      unread: 0,
    };

    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setSelectedConversation(newConversation);
    setMessages([]);

    try {
      localStorage.setItem("conversations", JSON.stringify(updatedConversations));
    } catch (e) {
      console.error("Error saving conversation", e);
    }
  };

  return (
    <div className="container">
      <header>
        <h2 className="logo-text">Mensajes</h2>
        <p className="page-subtitle">Comunícate con otros usuarios</p>
      </header>

      <main className="chat-main">
        <div className="chat-container">
          {/* Lista de conversaciones */}
          <div className="conversations-sidebar">
            <div className="conversations-header">
              <h3>Conversaciones</h3>
              <button className="new-chat-button" onClick={startNewConversation}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            </div>

            <div className="conversations-list">
              {conversations.length === 0 ? (
                <div className="empty-conversations">
                  <div className="empty-icon">💬</div>
                  <p>No hay conversaciones</p>
                  <button className="start-chat-button" onClick={startNewConversation}>
                    Iniciar conversación
                  </button>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${
                      selectedConversation?.id === conversation.id ? "active" : ""
                    }`}
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <div className="conversation-avatar">
                      <span>{conversation.name.charAt(0)}</span>
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-name">{conversation.name}</div>
                      <div className="conversation-preview">{conversation.lastMessage}</div>
                    </div>
                    <div className="conversation-meta">
                      <div className="conversation-time">
                        {new Date(conversation.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {conversation.unread > 0 && (
                        <div className="unread-badge">{conversation.unread}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Área de chat */}
          <div className="chat-area">
            {selectedConversation ? (
              <>
                <div className="chat-header">
                  <div className="chat-user-info">
                    <div className="chat-avatar">
                      <span>{selectedConversation.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="chat-user-name">{selectedConversation.name}</div>
                      <div className="chat-status">En línea</div>
                    </div>
                  </div>
                </div>

                <div className="messages-container">
                  {messages.length === 0 ? (
                    <div className="no-messages">
                      <div className="no-messages-icon">💬</div>
                      <p>Inicia la conversación</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${message.sender === "user" ? "user-message" : "other-message"}`}
                      >
                        <div className="message-content">{message.content}</div>
                        <div className="message-time">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
              </>
            ) : (
              <div className="no-conversation-selected">
                <div className="no-conversation-icon">💬</div>
                <h3>Selecciona una conversación</h3>
                <p>Elige una conversación de la lista para comenzar a chatear</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <NavBar />
    </div>
  );
}

export default Chat;
