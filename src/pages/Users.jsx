import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import '../styles/Users.css';
import NavBar from '../components/navbar.jsx';
import { userService, petService, chatService } from '../firebase/services.js';

function Users() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPets, setUserPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      navigate('/login');
      return;
    }

    loadUsers();
  }, [user]);

  useEffect(() => {
    // Filtrar usuarios basado en el término de búsqueda
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(userData => 
        userData.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userData.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Obtener todos los usuarios de la base de datos
      const allUsers = await userService.getAllUsers();
      // Filtrar el usuario actual
      const otherUsers = allUsers.filter(userData => userData.uid !== user.uid);
      setUsers(otherUsers);
      setFilteredUsers(otherUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (userData) => {
    try {
      setSelectedUser(userData);
      setLoadingPets(true);
      
      // Cargar mascotas del usuario
      const pets = await petService.getPetsByOwner(userData.uid);
      setUserPets(pets);
    } catch (error) {
      console.error('Error loading user pets:', error);
    } finally {
      setLoadingPets(false);
    }
  };

  const handleSendMessage = async (userData) => {
    try {
      // Crear o obtener conversación con el usuario
      const conversationId = await chatService.getOrCreateConversation(
        user.uid, 
        userData.uid
      );
      
      // Navegar al chat
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Error al iniciar conversación');
    }
  };

  const handleCloseProfile = () => {
    setSelectedUser(null);
    setUserPets([]);
  };

  if (loading) {
    return (
      <div className="users-container">
        <NavBar />
        <div className="users-loading">
          <div className="loading-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <NavBar />
      
      <div className="users-header">
        <h1>Usuarios</h1>
        <p>Conecta con otros amantes de las mascotas</p>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar usuarios por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="users-list">
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <div className="no-users-icon">👥</div>
            <h3>No se encontraron usuarios</h3>
            <p>Intenta con un término de búsqueda diferente</p>
          </div>
        ) : (
          filteredUsers.map((userData) => (
            <div 
              key={userData.uid}
              className="user-item"
              onClick={() => handleUserClick(userData)}
            >
              <div className="user-avatar">
                {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
              </div>
              
              <div className="user-content">
                <h3>{userData.name || 'Usuario'}</h3>
                <p>{userData.email}</p>
              </div>
              
              <div className="user-actions">
                <button 
                  className="message-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendMessage(userData);
                  }}
                >
                  💬
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de perfil de usuario */}
      {selectedUser && (
        <div className="user-profile-modal-overlay">
          <div className="user-profile-modal">
            <div className="user-profile-header">
              <button 
                className="close-button"
                onClick={handleCloseProfile}
              >
                ✕
              </button>
              <div className="user-profile-info">
                <div className="user-profile-avatar">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-profile-details">
                  <h2>{selectedUser.name || 'Usuario'}</h2>
                  <p>{selectedUser.email}</p>
                </div>
              </div>
              <button 
                className="send-message-button"
                onClick={() => handleSendMessage(selectedUser)}
              >
                💬 Enviar Mensaje
              </button>
            </div>

            <div className="user-profile-content">
              <h3>Mascotas de {selectedUser.name}</h3>
              
              {loadingPets ? (
                <div className="pets-loading">
                  <div className="loading-spinner"></div>
                  <p>Cargando mascotas...</p>
                </div>
              ) : userPets.length === 0 ? (
                <div className="no-pets">
                  <div className="no-pets-icon">🐾</div>
                  <p>Este usuario no tiene mascotas publicadas</p>
                </div>
              ) : (
                <div className="user-pets-grid">
                  {userPets.map((pet) => (
                    <div key={pet.id} className="user-pet-card">
                      <div className="pet-image-wrapper">
                        <img 
                          src={pet.img || '/placeholder-pet.jpg'} 
                          alt={pet.name}
                          className="pet-image"
                        />
                      </div>
                      <div className="pet-info">
                        <h4>{pet.name}</h4>
                        <p>{pet.breed} • {pet.age} años</p>
                        <p className="pet-location">📍 {pet.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
