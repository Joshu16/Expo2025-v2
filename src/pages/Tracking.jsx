import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import "../styles/App.css";
import "../styles/Tracking.css";
import NavBar from "../components/navbar.jsx";
import { adoptionRequestService, petService, userService } from "../firebase/services.js";

function Tracking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sent'); // 'sent' o 'received'
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadRequests();
      // Limpiar solicitudes rechazadas antiguas al cargar la página
      cleanOldRejectedRequests();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar solicitudes enviadas
      const sentData = await adoptionRequestService.getAdoptionRequests(user.uid);
      console.log('Sent requests loaded:', sentData);
      
      // Cargar solicitudes recibidas
      const receivedData = await adoptionRequestService.getAdoptionRequestsForOwner(user.uid);
      console.log('Received requests loaded:', receivedData);
      
      // Enriquecer las solicitudes con información adicional
      const enrichedSentRequests = await Promise.all(
        sentData.map(async (request) => {
          const pet = await petService.getPetById(request.petId);
          const owner = await userService.getUserProfile(request.ownerId);
          return {
            ...request,
            pet,
            owner
          };
        })
      );
      
      const enrichedReceivedRequests = await Promise.all(
        receivedData.map(async (request) => {
          const pet = await petService.getPetById(request.petId);
          const requester = await userService.getUserProfile(request.userId);
          return {
            ...request,
            pet,
            requester
          };
        })
      );
      
      setSentRequests(enrichedSentRequests);
      setReceivedRequests(enrichedReceivedRequests);
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Error al cargar solicitudes de adopción');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setActionLoading(true);
      await adoptionRequestService.approveAdoptionRequest(requestId);
      await loadRequests(); // Recargar datos
      alert('Solicitud aprobada exitosamente');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error al aprobar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setActionLoading(true);
      await adoptionRequestService.rejectAdoptionRequest(requestId);
      await loadRequests(); // Recargar datos
      alert('Solicitud rechazada');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error al rechazar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const cleanOldRejectedRequests = async () => {
    try {
      console.log('Cleaning old rejected requests...');
      const cleanedCount = await adoptionRequestService.cleanOldRejectedRequests();
      if (cleanedCount > 0) {
        console.log(`✅ Cleaned ${cleanedCount} old rejected requests`);
        // Recargar datos después de limpiar
        await loadRequests();
      }
    } catch (error) {
      console.error('Error cleaning old rejected requests:', error);
    }
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

  const handleRequestClick = (request) => {
    navigate("/adoption-details", { state: { adoption: request } });
  };

  if (loading) {
    return (
      <div className="container">
        <header className="modern-header">
          <h2 className="section-title">Seguimiento</h2>
          <p className="page-subtitle">Gestiona tus solicitudes de adopción</p>
        </header>
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando solicitudes...</p>
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
          <h2 className="section-title">Seguimiento</h2>
          <p className="page-subtitle">Gestiona tus solicitudes de adopción</p>
        </header>
        <main className="main-content">
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <h3>Inicia sesión para ver tu seguimiento</h3>
            <p>Necesitas iniciar sesión para gestionar tus solicitudes de adopción</p>
            <button className="browse-button" onClick={() => navigate("/login")}>
              Iniciar sesión
            </button>
          </div>
        </main>
        <NavBar />
      </div>
    );
  }

  const currentRequests = activeTab === 'sent' ? sentRequests : receivedRequests;

  return (
    <div className="container">
      <header className="modern-header">
        <h2 className="section-title">Seguimiento</h2>
        <p className="page-subtitle">Gestiona tus solicitudes de adopción</p>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadRequests}>Reintentar</button>
          </div>
        )}

        {/* Pestañas */}
        <div className="tracking-tabs">
          <button 
            className={`tracking-tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            Mis solicitudes ({sentRequests.length})
          </button>
          <button 
            className={`tracking-tab ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            Solicitudes recibidas ({receivedRequests.length})
          </button>
        </div>

        {/* Contenido de las pestañas */}
        <div className="tracking-content">
          {currentRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                {activeTab === 'sent' ? '📤' : '📥'}
              </div>
              <h3>
                {activeTab === 'sent' 
                  ? 'No has enviado solicitudes' 
                  : 'No tienes solicitudes recibidas'
                }
              </h3>
              <p>
                {activeTab === 'sent' 
                  ? 'Cuando envíes solicitudes de adopción, aparecerán aquí' 
                  : 'Las solicitudes para tus mascotas aparecerán aquí'
                }
              </p>
              {activeTab === 'sent' && (
                <button className="browse-button" onClick={() => navigate("/")}>
                  Ver mascotas disponibles
                </button>
              )}
            </div>
          ) : (
            <div className="requests-list">
              {currentRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-image">
                    <img 
                      src={request.pet?.img || '/placeholder-pet.jpg'} 
                      alt={request.pet?.name}
                    />
                  </div>
                  
                  <div className="request-info">
                    <h3>{request.pet?.name}</h3>
                    <p className="pet-details">
                      {request.pet?.breed} • {request.pet?.age} • {request.pet?.location}
                    </p>
                    
                    {activeTab === 'sent' ? (
                      <div className="request-meta">
                        <p><strong>Dueño:</strong> {request.owner?.name || 'No disponible'}</p>
                        <p><strong>Email:</strong> {request.owner?.email || 'No disponible'}</p>
                      </div>
                    ) : (
                      <div className="request-meta">
                        <p><strong>Solicitante:</strong> {request.requester?.name || 'No disponible'}</p>
                        <p><strong>Email:</strong> {request.requester?.email || 'No disponible'}</p>
                        {request.message && (
                          <p><strong>Mensaje:</strong> "{request.message}"</p>
                        )}
                      </div>
                    )}
                    
                    <div className="request-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(request.status) }}
                      >
                        {getStatusText(request.status)}
                      </span>
                      <span className="date">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="request-actions">
                    {activeTab === 'received' && request.status === 'pending' && (
                      <div className="action-buttons">
                        <button 
                          className="approve-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveRequest(request.id);
                          }}
                          disabled={actionLoading}
                        >
                          Aprobar
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectRequest(request.id);
                          }}
                          disabled={actionLoading}
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                    
                    <button 
                      className="view-btn"
                      onClick={() => handleRequestClick(request)}
                    >
                      Ver detalles
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

export default Tracking;