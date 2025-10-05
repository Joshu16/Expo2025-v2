import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService, petService, favoriteService } from "../firebase/services.js";
import { useAuth } from "../firebase/auth.js";
import "../styles/App.css";
import "../styles/Profile.css";
import NavBar from "../components/navbar.jsx";

function Profile({ user }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('my-pets');
  const [userProfile, setUserProfile] = useState({ name: "", address: "", phone: "", email: "" });
  const [myPets, setMyPets] = useState([]);
  const [favorites, setFavorites] = useState([]);
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
          onClick={() => setEditing(!editing)}
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
        </div>

        {/* Modal de configuración */}
        {editing && (
          <div className="modal-overlay" onClick={() => setEditing(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Configurar Cuenta</h3>
                <button className="close-btn" onClick={() => setEditing(false)}>×</button>
              </div>
              
              <div className="modal-body">
          <div className="form-group">
                  <label>Nombre completo</label>
            <input
              type="text"
              value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Tu nombre completo"
            />
          </div>

          <div className="form-group">
                  <label>Dirección</label>
            <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Tu dirección"
                  />
          </div>

          <div className="form-group">
                  <label>Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Tu número de teléfono"
            />
          </div>

          <div className="form-group">
                  <label>Email</label>
            <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Tu email"
            />
          </div>
          </div>

              <div className="modal-actions">
                <button className="logout-button" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
                <div className="modal-actions-right">
                  <button className="cancel-button" onClick={handleCancel}>
                    Cancelar
          </button>
                  <button className="save-button" onClick={handleSave}>
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