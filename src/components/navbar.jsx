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
        className={`nav-icon ${location.pathname === '/upload' ? 'active' : ''}`}
        title="Subir mascota"
        onClick={handleUploadClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 5a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H6a1 1 0 110-2h5V6a1 1 0 011-1z"/>
        </svg>
      </div>
      <div
        className={`nav-icon ${location.pathname === '/profile' ? 'active' : ''}`}
        title="Perfil"
        onClick={handleProfileClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-8 9a8 8 0 1116 0H4z"/>
        </svg>
      </div>
    </nav>
  );
}

export default NavBar;
