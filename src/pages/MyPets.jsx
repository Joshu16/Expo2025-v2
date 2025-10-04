import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/MyPets.css";
import NavBar from "../components/navbar.jsx";
import { petService, adoptionRequestService } from "../firebase/services.js";

function MyPets({ user }) {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      loadMyPets();
      loadAdoptionRequests();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadMyPets = async () => {
    try {
      console.log('Loading pets for owner:', user.uid);
      setLoading(true);
      setError(null);
      
      // Obtener todas las mascotas y filtrar las del usuario
      const allPets = await petService.getPets();
      const myPets = allPets.filter(pet => pet.ownerId === user.uid);
      
      console.log('My pets loaded:', myPets);
      setPets(myPets);
    } catch (err) {
      console.error('Error loading my pets:', err);
      setError('Error al cargar tus mascotas');
    } finally {
      setLoading(false);
    }
  };

  const loadAdoptionRequests = async () => {
    try {
      // Obtener todas las solicitudes de adopción
      const allRequests = await adoptionRequestService.getAdoptionRequests(user.uid);
      
      // Filtrar solo las solicitudes para las mascotas del usuario
      const myPetsIds = pets.map(pet => pet.id);
      const requestsForMyPets = allRequests.filter(request => 
        myPetsIds.includes(request.petId)
      );
      
      console.log('Adoption requests for my pets:', requestsForMyPets);
      setAdoptionRequests(requestsForMyPets);
    } catch (error) {
      console.error('Error loading adoption requests:', error);
    }
  };

  const handlePetClick = (pet) => {
    navigate("/adopt", { state: { pet } });
  };

  const handleRequestClick = (request) => {
    navigate("/adoption-details", { state: { adoption: request } });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#f59e0b";
      case "approved": return "#10b981";
      case "rejected": return "#ef4444";
      case "completed": return "#3b82f6";
      default: return "#6b7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "approved": return "Aprobada";
      case "rejected": return "Rechazada";
      case "completed": return "Completada";
      default: return "Desconocido";
    }
  };

  if (loading) {
    return (
      <div className="container">
        <header className="modern-header">
          <h2 className="section-title">Mis Mascotas</h2>
          <p className="page-subtitle">Gestiona tus mascotas en adopción</p>
        </header>
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando tus mascotas...</p>
          </div>
        </main>
        <NavBar />
      </div>
    );
  }

  if (!user?.uid) {
    return (
      <div className="container">
        <header className="modern-header">
          <h2 className="section-title">Mis Mascotas</h2>
          <p className="page-subtitle">Gestiona tus mascotas en adopción</p>
        </header>
        <main className="main-content">
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <h3>Inicia sesión para gestionar tus mascotas</h3>
            <p>Necesitas iniciar sesión para ver y gestionar tus mascotas</p>
            <button className="browse-button" onClick={() => navigate("/login")}>
              Iniciar sesión
            </button>
          </div>
        </main>
        <NavBar />
      </div>
    );
  }

  return (
    <div className="container">
      <header className="modern-header">
        <h2 className="section-title">Mis Mascotas</h2>
        <p className="page-subtitle">Gestiona tus mascotas en adopción</p>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadMyPets}>Reintentar</button>
          </div>
        )}

        {/* Botones de acción */}
        <div className="action-buttons-section">
          <button 
            className="add-pet-button"
            onClick={() => navigate("/upload")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5v14m-7-7h14"/>
            </svg>
            Agregar Nueva Mascota
          </button>
          
          <button 
            className="requests-button"
            onClick={() => navigate("/adoption-requests")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Gestionar Solicitudes
          </button>
        </div>

        {/* Lista de mascotas */}
        <div className="pets-section">
          <h3>Mis Mascotas ({pets.length})</h3>
          {pets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🐾</div>
              <h3>No tienes mascotas registradas</h3>
              <p>Agrega tu primera mascota para comenzar a recibir solicitudes de adopción</p>
              <button className="browse-button" onClick={() => navigate("/upload")}>
                Agregar Mascota
              </button>
            </div>
          ) : (
            <div className="pets-grid">
              {pets.map((pet) => (
                <div key={pet.id} className="pet-card">
                  <div 
                    className="pet-image"
                    onClick={() => handlePetClick(pet)}
                  >
                    <img src={pet.img} alt={pet.name} />
                    <div className="pet-status">
                      <span className={`status-badge ${pet.status}`}>
                        {pet.status === 'available' ? 'Disponible' : 'Adoptado'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pet-info">
                    <h3 onClick={() => handlePetClick(pet)}>{pet.name}</h3>
                    <p className="pet-details">
                      {pet.breed} • {pet.gender} • {pet.age}
                    </p>
                    <p className="pet-location">📍 {pet.location}</p>
                    
                    <div className="pet-actions">
                      <button 
                        className="view-button"
                        onClick={() => handlePetClick(pet)}
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Solicitudes de adopción */}
        <div className="requests-section">
          <h3>Solicitudes de Adopción ({adoptionRequests.length})</h3>
          {adoptionRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No hay solicitudes de adopción</h3>
              <p>Las solicitudes de adopción para tus mascotas aparecerán aquí</p>
            </div>
          ) : (
            <div className="requests-list">
              {adoptionRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <h4>{request.pet.name}</h4>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(request.status) }}
                    >
                      {getStatusText(request.status)}
                    </span>
                  </div>
                  
                  <div className="request-info">
                    <p><strong>Solicitante:</strong> {request.adopterName}</p>
                    <p><strong>Email:</strong> {request.adopterEmail}</p>
                    <p><strong>Teléfono:</strong> {request.adopterPhone}</p>
                    <p><strong>Fecha:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="request-actions">
                    <button 
                      className="view-button"
                      onClick={() => handleRequestClick(request)}
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <NavBar />
    </div>
  );
}

export default MyPets;
