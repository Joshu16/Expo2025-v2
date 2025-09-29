import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/Notifications.css";
import NavBar from "../components/navbar.jsx";

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // all, unread, adoption, message, system

  useEffect(() => {
    // Cargar notificaciones desde localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
      setNotifications(stored);
    } catch (e) {
      console.error("Error loading notifications", e);
    }
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "adoption":
        return "🐾";
      case "message":
        return "💬";
      case "system":
        return "🔔";
      case "approval":
        return "✅";
      case "rejection":
        return "❌";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "adoption":
        return "#3b82f6";
      case "message":
        return "#10b981";
      case "system":
        return "#f59e0b";
      case "approval":
        return "#10b981";
      case "rejection":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    setNotifications(updatedNotifications);
    
    try {
      localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    } catch (e) {
      console.error("Error updating notification", e);
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    
    try {
      localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    } catch (e) {
      console.error("Error updating notifications", e);
    }
  };

  const deleteNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    setNotifications(updatedNotifications);
    
    try {
      localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    } catch (e) {
      console.error("Error deleting notification", e);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Navegar según el tipo de notificación
    switch (notification.type) {
      case "adoption":
        navigate("/tracking");
        break;
      case "message":
        navigate("/chat");
        break;
      case "approval":
      case "rejection":
        navigate("/tracking");
        break;
      default:
        break;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container">
      <header>
        <h2 className="logo-text">Notificaciones</h2>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button className="mark-all-read" onClick={markAllAsRead}>
              Marcar todas como leídas
            </button>
          )}
        </div>
      </header>

      <main className="notifications-main">
        {/* Filtros */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Todas ({notifications.length})
          </button>
          <button 
            className={`filter-tab ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            No leídas ({unreadCount})
          </button>
          <button 
            className={`filter-tab ${filter === "adoption" ? "active" : ""}`}
            onClick={() => setFilter("adoption")}
          >
            Adopciones
          </button>
          <button 
            className={`filter-tab ${filter === "message" ? "active" : ""}`}
            onClick={() => setFilter("message")}
          >
            Mensajes
          </button>
        </div>

        {/* Lista de notificaciones */}
        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3>No hay notificaciones</h3>
              <p>Cuando tengas notificaciones, aparecerán aquí</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.read ? "unread" : ""}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  <span style={{ color: getNotificationColor(notification.type) }}>
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">
                    {new Date(notification.timestamp).toLocaleDateString()} a las{" "}
                    {new Date(notification.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <div className="unread-dot"></div>
                  )}
                  <button 
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <NavBar />
    </div>
  );
}

export default Notifications;
