import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/Tracking.css";
import NavBar from "../components/navbar.jsx";

function Tracking() {
  const navigate = useNavigate();
  const [adoptions, setAdoptions] = useState([]);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected, completed

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("adoptions") || "[]");
      setAdoptions(stored);
    } catch (e) {
      console.error("Error reading adoptions from localStorage", e);
    }
  }, []);

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

  const filteredAdoptions = adoptions.filter(adoption => {
    if (filter === "all") return true;
    return adoption.status === filter;
  });

  const handleAdoptionClick = (adoption) => {
    navigate("/adoption-details", { state: { adoption } });
  };

  const handleNewAdoption = () => {
    navigate("/");
  };

  return (
    <div className="container">
      <header>
        <h2 className="logo-text">Seguimiento</h2>
        <p className="page-subtitle">Gestiona tus adopciones</p>
      </header>

      <main className="tracking-main">
        {/* Filtros */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Todas ({adoptions.length})
          </button>
          <button 
            className={`filter-tab ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pendientes ({adoptions.filter(a => a.status === "pending").length})
          </button>
          <button 
            className={`filter-tab ${filter === "approved" ? "active" : ""}`}
            onClick={() => setFilter("approved")}
          >
            Aprobadas ({adoptions.filter(a => a.status === "approved").length})
          </button>
          <button 
            className={`filter-tab ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completadas ({adoptions.filter(a => a.status === "completed").length})
          </button>
        </div>

        {/* Lista de adopciones */}
        <div className="adoptions-list">
          {filteredAdoptions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🐾</div>
              <h3>No hay adopciones</h3>
              <p>Cuando adoptes una mascota, aparecerá aquí</p>
              <button className="primary-button" onClick={handleNewAdoption}>
                Ver mascotas disponibles
              </button>
            </div>
          ) : (
            filteredAdoptions.map((adoption, index) => (
              <div 
                key={index} 
                className="adoption-card"
                onClick={() => handleAdoptionClick(adoption)}
              >
                <div className="adoption-image">
                  <img src={adoption.pet.img} alt={adoption.pet.name} />
                </div>
                <div className="adoption-info">
                  <h3>{adoption.pet.name}</h3>
                  <p className="pet-details">
                    {adoption.pet.breed} • {adoption.pet.age} • {adoption.pet.location}
                  </p>
                  <div className="adoption-meta">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(adoption.status) }}
                    >
                      {getStatusText(adoption.status)}
                    </span>
                    <span className="date">
                      {new Date(adoption.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="adoption-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <NavBar />
    </div>
  );
}

export default Tracking;
