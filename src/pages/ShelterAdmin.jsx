import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/ShelterAdmin.css";
import NavBar from "../components/navbar.jsx";
import PremiumModal from "../components/PremiumModal.jsx";
import { shelterService, petService } from "../firebase/services.js";
import { useAuth } from "../contexts/AuthContext.jsx";

function ShelterAdmin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shelters, setShelters] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [shelterPets, setShelterPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedShelterForPremium, setSelectedShelterForPremium] = useState(null);

  useEffect(() => {
    if (user) {
      loadUserShelters();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const loadUserShelters = async () => {
    try {
      setLoading(true);
      const userShelters = await shelterService.getSheltersByOwner(user.uid);
      setShelters(userShelters);
      console.log('User shelters loaded:', userShelters);
    } catch (error) {
      console.error('Error loading shelters:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadShelterPets = async (shelterId) => {
    try {
      const pets = await petService.getPetsByShelter(shelterId);
      setShelterPets(pets);
      console.log('Shelter pets loaded:', pets);
    } catch (error) {
      console.error('Error loading shelter pets:', error);
    }
  };

  const handleShelterSelect = (shelter) => {
    setSelectedShelter(shelter);
    loadShelterPets(shelter.id);
  };

  const handleUpgradeToPremium = (shelter) => {
    setSelectedShelterForPremium(shelter);
    setShowPremiumModal(true);
  };

  const handlePremiumSuccess = () => {
    loadUserShelters();
    setShowPremiumModal(false);
  };

  const handleDeleteShelter = async (shelterId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este refugio? Esta acción no se puede deshacer.')) {
      try {
        await shelterService.deleteShelter(shelterId);
        alert('Refugio eliminado exitosamente');
        loadUserShelters();
        if (selectedShelter && selectedShelter.id === shelterId) {
          setSelectedShelter(null);
          setShelterPets([]);
        }
      } catch (error) {
        console.error('Error deleting shelter:', error);
        alert('Error al eliminar el refugio');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pendiente', class: 'status-pending' },
      approved: { text: 'Aprobado', class: 'status-approved' },
      rejected: { text: 'Rechazado', class: 'status-rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getPremiumBadge = (isPremium, premiumExpiry) => {
    if (!isPremium) return null;
    
    const isExpired = premiumExpiry && new Date(premiumExpiry) < new Date();
    return (
      <span className={`premium-badge ${isExpired ? 'expired' : 'active'}`}>
        {isExpired ? '⚠️ Premium Expirado' : '⭐ Premium'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container">
        <header className="modern-header">
          <h2 className="section-title">Administrar Refugios</h2>
        </header>
        <main className="admin-main">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Cargando refugios...</p>
          </div>
        </main>
        <NavBar />
      </div>
    );
  }

  return (
    <div className="container">
      <header className="modern-header">
        <h2 className="section-title">Administrar Refugios</h2>
        <p className="page-subtitle">Gestiona tus refugios y suscripciones premium</p>
      </header>

      <main className="admin-main">
        <div className="admin-layout">
          {/* Lista de refugios */}
          <div className="shelters-panel">
            <div className="panel-header">
              <h3>Mis Refugios ({shelters.length})</h3>
              <button 
                className="add-shelter-btn"
                onClick={() => navigate('/shelter-register')}
              >
                + Nuevo Refugio
              </button>
            </div>

            <div className="shelters-list">
              {shelters.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏠</div>
                  <h4>No tienes refugios registrados</h4>
                  <p>Registra tu primer refugio para comenzar</p>
                  <button 
                    className="primary-button"
                    onClick={() => navigate('/shelter-register')}
                  >
                    Registrar Refugio
                  </button>
                </div>
              ) : (
                shelters.map(shelter => (
                  <div 
                    key={shelter.id}
                    className={`shelter-item ${selectedShelter?.id === shelter.id ? 'selected' : ''}`}
                    onClick={() => handleShelterSelect(shelter)}
                  >
                    <div className="shelter-header">
                      <h4>{shelter.name}</h4>
                      <div className="shelter-badges">
                        {getStatusBadge(shelter.status)}
                        {getPremiumBadge(shelter.isPremium, shelter.premiumExpiry)}
                      </div>
                    </div>
                    
                    <p className="shelter-location">📍 {shelter.location}</p>
                    <p className="shelter-description">{shelter.description}</p>
                    
                    <div className="shelter-stats">
                      <span>🐾 {shelter.petsCount || 0} mascotas</span>
                      <span>⭐ {shelter.rating || 0} rating</span>
                    </div>

                    <div className="shelter-actions">
                      {!shelter.isPremium && (
                        <button 
                          className="upgrade-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpgradeToPremium(shelter);
                          }}
                        >
                          🚀 Premium
                        </button>
                      )}
                      <button 
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteShelter(shelter.id);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel de detalles */}
          <div className="details-panel">
            {selectedShelter ? (
              <div className="shelter-details">
                <div className="details-header">
                  <h3>{selectedShelter.name}</h3>
                  <div className="details-badges">
                    {getStatusBadge(selectedShelter.status)}
                    {getPremiumBadge(selectedShelter.isPremium, selectedShelter.premiumExpiry)}
                  </div>
                </div>

                <div className="details-content">
                  <div className="info-section">
                    <h4>Información General</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Ubicación:</span>
                        <span>{selectedShelter.location}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Dirección:</span>
                        <span>{selectedShelter.address}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Teléfono:</span>
                        <span>{selectedShelter.phone}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Email:</span>
                        <span>{selectedShelter.email}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Sitio Web:</span>
                        <span>{selectedShelter.website || 'No especificado'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Horarios:</span>
                        <span>{selectedShelter.hours}</span>
                      </div>
                    </div>
                  </div>

                  <div className="services-section">
                    <h4>Servicios Ofrecidos</h4>
                    <div className="services-list">
                      {selectedShelter.services?.map((service, index) => (
                        <span key={index} className="service-tag">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pets-section">
                    <h4>Mascotas del Refugio ({shelterPets.length})</h4>
                    {shelterPets.length === 0 ? (
                      <div className="no-pets">
                        <p>No hay mascotas registradas en este refugio</p>
                        <button 
                          className="primary-button"
                          onClick={() => navigate('/upload')}
                        >
                          Agregar Mascota
                        </button>
                      </div>
                    ) : (
                      <div className="pets-grid">
                        {shelterPets.map(pet => (
                          <div key={pet.id} className="pet-card">
                            <img src={pet.img} alt={pet.name} />
                            <div className="pet-info">
                              <h5>{pet.name}</h5>
                              <p>{pet.type} • {pet.breed}</p>
                              <span className={`pet-status ${pet.status}`}>
                                {pet.status === 'available' ? 'Disponible' : 
                                 pet.status === 'adopted' ? 'Adoptado' : 'Reservado'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <div className="no-selection-icon">🏠</div>
                <h3>Selecciona un refugio</h3>
                <p>Elige un refugio de la lista para ver sus detalles y gestionar sus mascotas</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <NavBar />
      
      {/* Modal Premium */}
      {showPremiumModal && selectedShelterForPremium && (
        <PremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          shelterId={selectedShelterForPremium.id}
          shelterName={selectedShelterForPremium.name}
          onSuccess={handlePremiumSuccess}
        />
      )}
    </div>
  );
}

export default ShelterAdmin;
