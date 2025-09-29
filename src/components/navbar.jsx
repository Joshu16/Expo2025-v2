import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/navbar.css";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleTrackingClick = () => {
    navigate('/tracking');
  };

  const handleChatClick = () => {
    navigate('/chat');
  };

  const handleFavoritesClick = () => {
    navigate('/favorites');
  };

  const handleSheltersClick = () => {
    navigate('/shelters');
  };

  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  return (
    <nav className="navbar">
      <div
        className={`nav-icon ${location.pathname === '/' ? 'active' : ''}`}
        title="Inicio"
        onClick={handleHomeClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 3.172l8 7.2V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.628l8-7.2z"/>
        </svg>
      </div>
      <div
        className={`nav-icon ${location.pathname === '/tracking' ? 'active' : ''}`}
        title="Seguimiento"
        onClick={handleTrackingClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <div
        className={`nav-icon ${location.pathname === '/favorites' ? 'active' : ''}`}
        title="Favoritos"
        onClick={handleFavoritesClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <div
        className={`nav-icon ${location.pathname === '/chat' ? 'active' : ''}`}
        title="Mensajes"
        onClick={handleChatClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </div>
      <div
        className={`nav-icon ${location.pathname === '/shelters' ? 'active' : ''}`}
        title="Refugios"
        onClick={handleSheltersClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      </div>
      <div
        className={`nav-icon ${location.pathname === '/notifications' ? 'active' : ''}`}
        title="Notificaciones"
        onClick={handleNotificationsClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
        </svg>
      </div>
    </nav>
  );
}

export default NavBar;
