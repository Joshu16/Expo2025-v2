import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../firebase/auth.js";
import "../styles/navbar.css";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
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
        title="Subir Mascota"
        onClick={() => navigate('/upload')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
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
