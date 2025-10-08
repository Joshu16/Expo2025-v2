import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService, petService, favoriteService, shelterService } from "../firebase/services.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import "../styles/App.css";
import "../styles/Profile.css";
import NavBar from "../components/navbar.jsx";

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('my-pets');
  const [userProfile, setUserProfile] = useState({ name: "", address: "", phone: "", email: "" });
  const [myPets, setMyPets] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [myShelters, setMyShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({ name: "", address: "", phone: "", email: "" });
  const [petFormData, setPetFormData] = useState({ name: "", breed: "", age: "", gender: "", location: "", description: "" });

  useEffect(() => {
      if (user) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      console.log('Profile: Starting to load user data for user:', user.uid);
      setLoading(true);
      
      // Cargar perfil del usuario
      console.log('Profile: Loading user profile...');
      const profile = await userService.getUserProfile(user.uid);
      if (profile) {
        console.log('Profile: User profile found:', profile);
        setUserProfile(profile);
        setFormData(profile);
          } else {
        console.log('Profile: No user profile found, using basic profile');
        const basicProfile = {
          name: user.displayName || "Usuario",
          address: "",
              phone: "",
          email: user.email || ""
        };
        setUserProfile(basicProfile);
        setFormData(basicProfile);
      }

      // Cargar mascotas del usuario
      console.log('Profile: Loading pets for owner:', user.uid);
      const petsData = await petService.getPetsByOwner(user.uid);
      console.log('Profile: Pets data received:', petsData);
      setMyPets(petsData);

      // Cargar favoritos del usuario
      console.log('Profile: Loading favorites...');
      const favoritesData = await favoriteService.getFavorites(user.uid);
      console.log('Profile: Favorites data received:', favoritesData);
      setFavorites(favoritesData);

      // Cargar refugios del usuario
      console.log('Profile: Loading shelters...');
      const sheltersData = await shelterService.getSheltersByOwner(user.uid);
      console.log('Profile: Shelters data received:', sheltersData);
      setMyShelters(sheltersData);

        } catch (error) {
      console.error("Profile: Error loading user data:", error);
        } finally {
          setLoading(false);
      }
    };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await userService.updateUserProfile(user.uid, formData);
      setUserProfile(formData);
      setEditing(false);
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil');
    }
  };

  const handleCancel = () => {
    setFormData(userProfile);
    setEditing(false);
  };

  const handlePetClick = (pet) => {
    // Si es una mascota propia, abrir modal de edición
    if (pet.ownerId === user.uid) {
      setEditingPet(pet);
      setPetFormData({
        name: pet.name || "",
        breed: pet.breed || "",
        age: pet.age || "",
        gender: pet.gender || "",
        location: pet.location || "",
        description: pet.description || ""
      });
    } else {
      // Si es una mascota de otro usuario, ir a adoptar
      navigate("/adopt", { state: { pet } });
    }
  };

  const toggleFavorite = async (pet, e) => {
    e.stopPropagation();
    
    if (!user?.uid) return;

    try {
      const isCurrentlyFavorite = favorites.some(fav => fav.petId === pet.id);
      
      if (isCurrentlyFavorite) {
        await favoriteService.removeFavorite(user.uid, pet.id);
        setFavorites(prev => prev.filter(fav => fav.petId !== pet.id));
      } else {
        await favoriteService.addFavorite(user.uid, pet.id);
        setFavorites(prev => [...prev, { petId: pet.id, userId: user.uid, createdAt: new Date().toISOString() }]);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const isFavorite = (pet) => {
    return favorites.some(fav => fav.petId === pet.id);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Error al cerrar sesión');
    }
  };


  const handlePetInputChange = (field, value) => {
    setPetFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePet = async () => {
    if (!editingPet) return;
    
    try {
      await petService.updatePet(editingPet.id, petFormData);
      alert('Mascota actualizada correctamente');
      setEditingPet(null);
      await loadUserData();
    } catch (error) {
      console.error('Error updating pet:', error);
      alert('Error al actualizar la mascota');
    }
  };

  const handleCancelPetEdit = () => {
    setEditingPet(null);
    setPetFormData({ name: "", breed: "", age: "", gender: "", location: "", description: "" });
  };

  const handleDeletePet = async () => {
    if (!editingPet) return;
    
    const confirmMessage = `¿Estás seguro de que quieres eliminar a ${editingPet.name}?\n\nEsto también eliminará:\n• Todas las solicitudes de adopción\n• Todas las notificaciones relacionadas\n• Mensajes en chats (se notificará a los usuarios)\n• Favoritos de otros usuarios\n\nEsta acción no se puede deshacer.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const result = await petService.deletePet(editingPet.id);
        
        let message = `✅ ${editingPet.name} eliminado correctamente`;
        if (result.deleted) {
          message += `\n\nEliminado:\n`;
          if (result.deleted.adoptionRequests > 0) {
            message += `• ${result.deleted.adoptionRequests} solicitudes de adopción\n`;
          }
          if (result.deleted.notifications > 0) {
            message += `• ${result.deleted.notifications} notificaciones\n`;
          }
          if (result.deleted.conversations > 0) {
            message += `• Mensajes en ${result.deleted.conversations} conversaciones\n`;
          }
          if (result.deleted.favorites > 0) {
            message += `• ${result.deleted.favorites} favoritos\n`;
          }
        }
        
        alert(message);
        setEditingPet(null);
        await loadUserData();
      } catch (error) {
        console.error('Error deleting pet:', error);
        alert('Error al eliminar la mascota: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando perfil...</p>
        </div>
        <NavBar />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <h3>Inicia sesión para ver tu perfil</h3>
          <p>Necesitas iniciar sesión para acceder a tu perfil</p>
          <button className="browse-button" onClick={() => navigate("/login")}>
            Iniciar sesión
          </button>
        </div>
        <NavBar />
      </div>
    );
  }

  return (
    <div className="container">
      <header className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <span className="avatar-text">
                {(userProfile.name || "U").charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="profile-details">
            <h2 className="profile-name">{userProfile.name || "Usuario"}</h2>
            <p className="profile-email">{userProfile.email || user.email}</p>
          </div>
        </div>
        
        <button 
          className="settings-button"
          onClick={() => navigate('/settings')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
          </svg>
        </button>
      </header>

      <main className="profile-main">
        {/* Pestañas */}
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'my-pets' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-pets')}
          >
            Tus mascotas
          </button>
          <button 
            className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Favoritas
          </button>
          <button 
            className={`tab-button ${activeTab === 'shelters' ? 'active' : ''}`}
            onClick={() => setActiveTab('shelters')}
          >
            Mis Refugios
          </button>
        </div>

        {/* Contenido de las pestañas */}
        <div className="tab-content">
          {activeTab === 'my-pets' && (
            <div className="pets-section">
              <div className="section-header">
                <h3>Mis Mascotas ({myPets.length})</h3>
                <div className="section-actions">
                  <button 
                    className="refresh-button"
                    onClick={loadUserData}
                    disabled={loading}
                  >
                    {loading ? '🔄' : '↻'} Recargar
                  </button>
                </div>
              </div>
              {myPets.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🐾</div>
                  <h3>No tienes mascotas registradas</h3>
                  <p>Agrega tu primera mascota para comenzar</p>
                  <button className="browse-button" onClick={() => navigate("/upload")}>
                    Agregar Mascota
                  </button>
                </div>
              ) : (
                <div className="pets-grid">
                  {myPets.map((pet) => (
                    <div key={pet.id} className="pet-card" onClick={() => handlePetClick(pet)}>
                      <div className="pet-image-wrapper">
                        <img src={pet.img} alt={pet.name} className="pet-image" />
                        <div className="pet-type-badge">{pet.type}</div>
                      </div>
                      <div className="pet-content">
                        <h3 className="pet-name">{pet.name}</h3>
                        <p className="pet-details">{pet.breed} • {pet.gender}</p>
                        <div className="pet-meta">
                          <span className="pet-age">{pet.age}</span>
                          <span className="pet-location">📍 {pet.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="favorites-section">
              {favorites.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">❤️</div>
                  <h3>No tienes favoritos</h3>
                  <p>Las mascotas que marques como favoritas aparecerán aquí</p>
                </div>
              ) : (
                <div className="pets-grid">
                  {favorites.map((fav) => (
                    <div key={fav.id} className="pet-card" onClick={() => handlePetClick(fav.pet)}>
                      <div className="pet-image-wrapper">
                        <img src={fav.pet?.img} alt={fav.pet?.name} className="pet-image" />
                        <button 
                          className={`favorite-btn favorited`}
                          onClick={(e) => toggleFavorite(fav.pet, e)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
                        </button>
                        <div className="pet-type-badge">{fav.pet?.type}</div>
                      </div>
                      <div className="pet-content">
                        <h3 className="pet-name">{fav.pet?.name}</h3>
                        <p className="pet-details">{fav.pet?.breed} • {fav.pet?.gender}</p>
                        <div className="pet-meta">
                          <span className="pet-age">{fav.pet?.age}</span>
                          <span className="pet-location">📍 {fav.pet?.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'shelters' && (
            <div className="shelters-section">
              <div className="section-header">
                <h3>Mis Refugios ({myShelters.length})</h3>
                <div className="section-actions">
                  <button 
                    className="refresh-button"
                    onClick={loadUserData}
                    disabled={loading}
                  >
                    🔄 Actualizar
                  </button>
                  <button 
                    className="add-button"
                    onClick={() => navigate('/shelter-register')}
                  >
                    ➕ Registrar Refugio
                  </button>
                </div>
              </div>

              {myShelters.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏠</div>
                  <h3>No tienes refugios registrados</h3>
                  <p>Registra tu refugio para comenzar a gestionar mascotas</p>
                  <button 
                    className="primary-button"
                    onClick={() => navigate('/shelter-register')}
                  >
                    Registrar Refugio
                  </button>
                </div>
              ) : (
                <div className="shelters-grid">
                  {myShelters.map((shelter) => (
                    <div key={shelter.id} className="shelter-card">
                      <div className="shelter-image-wrapper">
                        <img 
                          src={shelter.image || '/default-shelter.jpg'} 
                          alt={shelter.name} 
                          className="shelter-image" 
                        />
                        {shelter.isPremium && (
                          <div className="premium-badge">⭐ Premium</div>
                        )}
                        <div className="status-badge status-{shelter.status}">
                          {shelter.status === 'active' ? 'Activo' : 
                           shelter.status === 'pending' ? 'Pendiente' : 'Inactivo'}
                        </div>
                      </div>
                      <div className="shelter-content">
                        <h3 className="shelter-name">{shelter.name}</h3>
                        <p className="shelter-location">📍 {shelter.location}</p>
                        <p className="shelter-description">{shelter.description}</p>
                        <div className="shelter-meta">
                          <span className="rating">⭐ {shelter.rating || 'N/A'}</span>
                          <span className="pets-count">🐾 {shelter.petsCount || 0} mascotas</span>
                        </div>
                        <div className="shelter-actions">
                          <button 
                            className="manage-button"
                            onClick={() => navigate('/shelter-admin')}
                          >
                            Gestionar
                          </button>
                          {!shelter.isPremium && (
                            <button 
                              className="upgrade-button"
                              onClick={() => navigate('/shelters')}
                            >
                              Actualizar a Premium
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal de configuración moderno */}
        {editing && (
          <div className="modal-overlay" onClick={() => setEditing(false)}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
              <div className="settings-header">
                <div className="settings-title">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
                  </svg>
                  <h3>Configuración</h3>
                </div>
                <button className="close-btn" onClick={() => setEditing(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              
              <div className="settings-content">
                {/* Información personal */}
                <div className="settings-section">
                  <h4 className="section-title">Información Personal</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Tu nombre completo"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Tu dirección"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                        </svg>
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Tu número de teléfono"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Tu email"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferencias de visualización */}
                <div className="settings-section">
                  <h4 className="section-title">Preferencias de Visualización</h4>
                  <div className="form-group">
                    <label className="form-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Mostrar mascotas
                    </label>
                    <div className="select-wrapper">
                      <select 
                        value={activeTab} 
                        onChange={(e) => setActiveTab(e.target.value)}
                        className="form-select"
                      >
                        <option value="my-pets">Mis mascotas</option>
                        <option value="favorites">Favoritas</option>
                        <option value="shelters">Mis refugios</option>
                      </select>
                      <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 10l5 5 5-5z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-footer">
                <button className="logout-btn" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  Cerrar Sesión
                </button>
                <div className="settings-actions">
                  <button className="cancel-btn" onClick={handleCancel}>
                    Cancelar
                  </button>
                  <button className="save-btn" onClick={handleSave}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición de mascota */}
        {editingPet && (
          <div className="modal-overlay" onClick={handleCancelPetEdit}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Editar Mascota</h3>
                <button className="close-btn" onClick={handleCancelPetEdit}>×</button>
          </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={petFormData.name}
                    onChange={(e) => handlePetInputChange('name', e.target.value)}
                    placeholder="Nombre de la mascota"
                  />
                </div>

                <div className="form-group">
                  <label>Raza</label>
                  <input
                    type="text"
                    value={petFormData.breed}
                    onChange={(e) => handlePetInputChange('breed', e.target.value)}
                    placeholder="Raza de la mascota"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Edad</label>
                    <input
                      type="text"
                      value={petFormData.age}
                      onChange={(e) => handlePetInputChange('age', e.target.value)}
                      placeholder="Edad"
                    />
                  </div>
                  <div className="form-group">
                    <label>Género</label>
                    <select
                      value={petFormData.gender}
                      onChange={(e) => handlePetInputChange('gender', e.target.value)}
                    >
                      <option value="">Seleccionar</option>
                      <option value="Macho">Macho</option>
                      <option value="Hembra">Hembra</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Ubicación</label>
                  <input
                    type="text"
                    value={petFormData.location}
                    onChange={(e) => handlePetInputChange('location', e.target.value)}
                    placeholder="Ubicación"
                  />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={petFormData.description}
                    onChange={(e) => handlePetInputChange('description', e.target.value)}
                    placeholder="Descripción de la mascota"
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="delete-button" onClick={handleDeletePet}>
                  Eliminar Mascota
                </button>
                <div className="modal-actions-right">
                  <button className="cancel-button" onClick={handleCancelPetEdit}>
                    Cancelar
                  </button>
                  <button className="save-button" onClick={handleSavePet}>
                    Guardar
          </button>
        </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <NavBar />
    </div>
  );
}

export default Profile;