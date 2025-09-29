import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/navbar.css";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleFavoritesClick = () => {
    navigate('/favorites');
  };

  const handleProfileClick = () => {
    navigate('/profile');
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
        className={`nav-icon ${location.pathname === '/favorites' ? 'active' : ''}`}
        title="Favoritos"
        onClick={handleFavoritesClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <div
        className={`nav-icon ${location.pathname === '/profile' ? 'active' : ''}`}
        title="Perfil"
        onClick={handleProfileClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
    </nav>
  );
}

export default NavBar;
