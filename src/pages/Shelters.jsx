import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/Shelters.css";
import NavBar from "../components/navbar.jsx";

function Shelters() {
  const navigate = useNavigate();
  const [shelters, setShelters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShelter, setSelectedShelter] = useState(null);

  useEffect(() => {
    // Cargar refugios desde localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("shelters") || "[]");
      if (stored.length === 0) {
        // Datos de ejemplo para refugios
        const exampleShelters = [
          {
            id: 1,
            name: "Refugio Animal San José",
            description: "Organización sin fines de lucro dedicada al rescate y cuidado de animales abandonados.",
            location: "San José, Costa Rica",
            phone: "+506 2222-3333",
            email: "info@refugiosanjose.com",
            website: "www.refugiosanjose.com",
            image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop",
            rating: 4.8,
            petsCount: 45,
            verified: true,
            services: ["Adopción", "Esterilización", "Vacunación", "Atención médica"],
            hours: "Lunes a Viernes: 8:00 AM - 6:00 PM",
            address: "Calle 5, Avenida 10, San José"
          },
          {
            id: 2,
            name: "Casa de Mascotas Cartago",
            description: "Refugio especializado en perros y gatos, con más de 10 años de experiencia.",
            location: "Cartago, Costa Rica",
            phone: "+506 2555-4444",
            email: "contacto@casamascotas.com",
            website: "www.casamascotas.com",
            image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
            rating: 4.6,
            petsCount: 32,
            verified: true,
            services: ["Adopción", "Esterilización", "Vacunación", "Entrenamiento"],
            hours: "Lunes a Sábado: 9:00 AM - 5:00 PM",
            address: "Avenida 2, Calle 8, Cartago"
          },
          {
            id: 3,
            name: "Amigos de los Animales",
            description: "Grupo de voluntarios que rescata y rehabilita animales en situación de calle.",
            location: "Alajuela, Costa Rica",
            phone: "+506 2444-5555",
            email: "voluntarios@amigosanimales.org",
            website: "www.amigosanimales.org",
            image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop",
            rating: 4.9,
            petsCount: 28,
            verified: false,
            services: ["Adopción", "Rescate", "Rehabilitación"],
            hours: "Fines de semana: 10:00 AM - 4:00 PM",
            address: "Barrio Los Ángeles, Alajuela"
          }
        ];
        setShelters(exampleShelters);
        localStorage.setItem("shelters", JSON.stringify(exampleShelters));
      } else {
        setShelters(stored);
      }
    } catch (e) {
      console.error("Error loading shelters", e);
    }
  }, []);

  const filteredShelters = shelters.filter(shelter =>
    shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shelter.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shelter.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShelterClick = (shelter) => {
    setSelectedShelter(shelter);
  };

  const handleContactShelter = (shelter) => {
    // Simular contacto con el refugio
    alert(`Contactando con ${shelter.name}...\nTeléfono: ${shelter.phone}\nEmail: ${shelter.email}`);
  };

  const handleBackToList = () => {
    setSelectedShelter(null);
  };

  const handleRegisterShelter = () => {
    navigate("/shelter-register");
  };

  if (selectedShelter) {
    return (
      <div className="container">
        <header className="modern-header">
          <button className="back-button" onClick={handleBackToList}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Volver
          </button>
          <h2 className="section-title">Detalles del Refugio</h2>
        </header>

        <main className="shelter-details-main">
          <div className="shelter-header">
            <div className="shelter-image">
              <img src={selectedShelter.image} alt={selectedShelter.name} />
            </div>
            <div className="shelter-info">
              <h1>{selectedShelter.name}</h1>
              <div className="shelter-meta">
                <div className="rating">
                  <span className="stars">⭐</span>
                  <span>{selectedShelter.rating}</span>
                </div>
                <div className="pets-count">
                  <span>🐾</span>
                  <span>{selectedShelter.petsCount} mascotas</span>
                </div>
                {selectedShelter.verified && (
                  <div className="verified-badge">
                    <span>✓</span>
                    <span>Verificado</span>
                  </div>
                )}
              </div>
              <p className="shelter-description">{selectedShelter.description}</p>
            </div>
          </div>

          <div className="shelter-sections">
            <div className="info-section">
              <h3>Información de Contacto</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <span>{selectedShelter.address}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <span>{selectedShelter.phone}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">✉️</span>
                  <span>{selectedShelter.email}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">🌐</span>
                  <span>{selectedShelter.website}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">🕒</span>
                  <span>{selectedShelter.hours}</span>
                </div>
              </div>
            </div>

            <div className="services-section">
              <h3>Servicios Ofrecidos</h3>
              <div className="services-list">
                {selectedShelter.services.map((service, index) => (
                  <div key={index} className="service-item">
                    <span>✓</span>
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="actions-section">
              <button 
                className="contact-button"
                onClick={() => handleContactShelter(selectedShelter)}
              >
                Contactar Refugio
              </button>
              <button 
                className="visit-button"
                onClick={() => navigate("/", { state: { shelter: selectedShelter } })}
              >
                Ver Mascotas Disponibles
              </button>
            </div>
          </div>
        </main>

        <NavBar />
      </div>
    );
  }

  return (
    <div className="container">
      <header className="modern-header">
        <h2 className="section-title">Refugios</h2>
        <p className="page-subtitle">Conecta con organizaciones de rescate animal</p>
      </header>

      <main className="main-content">
        {/* Búsqueda */}
        <div className="search-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar refugios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="register-shelter-button" onClick={handleRegisterShelter}>
            Registrar Refugio
          </button>
        </div>

        {/* Lista de refugios */}
        <div className="shelters-list">
          {filteredShelters.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏠</div>
              <h3>No se encontraron refugios</h3>
              <p>Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            filteredShelters.map((shelter) => (
              <div 
                key={shelter.id} 
                className="shelter-card"
                onClick={() => handleShelterClick(shelter)}
              >
                <div className="shelter-image">
                  <img src={shelter.image} alt={shelter.name} />
                </div>
                <div className="shelter-content">
                  <div className="shelter-header">
                    <h3>{shelter.name}</h3>
                    {shelter.verified && (
                      <div className="verified-badge">
                        <span>✓</span>
                      </div>
                    )}
                  </div>
                  <p className="shelter-location">📍 {shelter.location}</p>
                  <p className="shelter-description">{shelter.description}</p>
                  <div className="shelter-meta">
                    <div className="rating">
                      <span>⭐ {shelter.rating}</span>
                    </div>
                    <div className="pets-count">
                      <span>🐾 {shelter.petsCount} mascotas</span>
                    </div>
                  </div>
                </div>
                <div className="shelter-arrow">
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

export default Shelters;
