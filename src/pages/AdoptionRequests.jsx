import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adoptionRequestService, petService, userService } from "../firebase/services.js";
import "../styles/App.css";
import "../styles/AdoptionRequests.css";
import NavBar from "../components/navbar.jsx";

function AdoptionRequests({ user }) {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [ownerNotes, setOwnerNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadAdoptionRequests();
    }
  }, [user]);

  const loadAdoptionRequests = async () => {
    try {
      setLoading(true);
      const requestsData = await adoptionRequestService.getAdoptionRequestsForOwner(user.uid);
      
      // Obtener información adicional de cada solicitud
      const enrichedRequests = await Promise.all(
        requestsData.map(async (request) => {
          const pet = await petService.getPetById(request.petId);
          const requester = await userService.getUserProfile(request.userId);
          return {
            ...request,
            pet,
            requester
          };
        })
      );
      
      setRequests(enrichedRequests);
    } catch (error) {
      console.error('Error loading adoption requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setActionLoading(true);
      await adoptionRequestService.approveAdoptionRequest(requestId, ownerNotes);
      setShowModal(false);
      setOwnerNotes("");
      await loadAdoptionRequests();
      alert('Solicitud aprobada exitosamente');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error al aprobar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setActionLoading(true);
      await adoptionRequestService.rejectAdoptionRequest(requestId, ownerNotes);
      setShowModal(false);
      setOwnerNotes("");
      await loadAdoptionRequests();
      alert('Solicitud rechazada');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error al rechazar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setOwnerNotes("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando solicitudes...</p>
        </div>
        <NavBar />
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <div className="header-content">
          <span className="bone-icon">🦴</span>
          <h2 className="logo-text">ANIMALS</h2>
        </div>
        <h1 className="page-title">Solicitudes de Adopción</h1>
        <p className="page-description">
          Gestiona las solicitudes de adopción para tus mascotas
        </p>
      </header>

      <main className="adoption-requests-main">
        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No hay solicitudes</h3>
            <p>No tienes solicitudes de adopción pendientes</p>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="pet-info">
                    <img 
                      src={request.pet?.img || '/placeholder-pet.jpg'} 
                      alt={request.pet?.name}
                      className="pet-image"
                    />
                    <div className="pet-details">
                      <h3>{request.pet?.name}</h3>
                      <p>{request.pet?.type} • {request.pet?.breed}</p>
                    </div>
                  </div>
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(request.status) }}
                  >
                    {getStatusText(request.status)}
                  </div>
                </div>

                <div className="requester-info">
                  <h4>Solicitante:</h4>
                  <p><strong>Nombre:</strong> {request.requester?.name || 'No disponible'}</p>
                  <p><strong>Email:</strong> {request.requester?.email || 'No disponible'}</p>
                  <p><strong>Teléfono:</strong> {request.requester?.phone || 'No disponible'}</p>
                </div>

                {request.message && (
                  <div className="request-message">
                    <h4>Mensaje del solicitante:</h4>
                    <p>"{request.message}"</p>
                  </div>
                )}

                <div className="request-actions">
                  <span className="request-date">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                  {request.status === 'pending' && (
                    <div className="action-buttons">
                      <button 
                        className="approve-btn"
                        onClick={() => openModal(request)}
                      >
                        Revisar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal para aprobar/rechazar */}
      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Gestionar Solicitud</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="request-details">
                <h4>Mascota: {selectedRequest.pet?.name}</h4>
                <p><strong>Solicitante:</strong> {selectedRequest.requester?.name}</p>
                <p><strong>Email:</strong> {selectedRequest.requester?.email}</p>
                <p><strong>Teléfono:</strong> {selectedRequest.requester?.phone}</p>
                
                {selectedRequest.message && (
                  <div className="message-section">
                    <h5>Mensaje:</h5>
                    <p>"{selectedRequest.message}"</p>
                  </div>
                )}
              </div>

              <div className="notes-section">
                <label>Notas adicionales (opcional):</label>
                <textarea
                  value={ownerNotes}
                  onChange={(e) => setOwnerNotes(e.target.value)}
                  placeholder="Agrega cualquier comentario adicional..."
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="reject-btn"
                onClick={() => handleReject(selectedRequest.id)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Procesando...' : 'Rechazar'}
              </button>
              <button 
                className="approve-btn"
                onClick={() => handleApprove(selectedRequest.id)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Procesando...' : 'Aprobar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <NavBar />
    </div>
  );
}

export default AdoptionRequests;
