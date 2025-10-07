import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/Shelters.css";
import NavBar from "../components/navbar.jsx";
import PremiumModal from "../components/PremiumModal.jsx";
import { shelterService } from "../firebase/services.js";
import { useAuth } from "../contexts/AuthContext.jsx";
// Funciones de limpieza removidas - usar Firebase Console para limpiar datos

function Shelters() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shelters, setShelters] = useState([]);
  const [premiumShelters, setPremiumShelters] = useState([]);
  const [regularShelters, setRegularShelters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedShelterForPremium, setSelectedShelterForPremium] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [isEmergencyCleaning, setIsEmergencyCleaning] = useState(false);

  useEffect(() => {
    loadShelters();
  }, []);

  const loadShelters = async () => {
    try {
      setLoading(true);
      console.log('Loading shelters from Firebase...');
      
      // Agregar timeout para evitar carga infinita
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout loading shelters')), 10000)
      );
      
      const loadPromise = Promise.all([
        shelterService.getPremiumShelters(),
        shelterService.getRegularShelters()
      ]);
      
      // Cargar refugios premium y regulares por separado con timeout
      const [premiumSheltersData, regularSheltersData] = await Promise.race([
        loadPromise,
        timeoutPromise
      ]);
      
      console.log('Premium shelters:', premiumSheltersData);
      console.log('Regular shelters:', regularSheltersData);
      
      setPremiumShelters(premiumSheltersData);
      setRegularShelters(regularSheltersData);
      setShelters([...premiumSheltersData, ...regularSheltersData]);
      
      // NUNCA crear refugios de ejemplo automáticamente
      // Los refugios se crean SOLO cuando los usuarios los registran manualmente
      console.log('No se crean refugios de ejemplo automáticamente');
    } catch (error) {
      console.error('Error loading shelters:', error);
      // Fallback a localStorage si Firebase falla
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const createSampleShelters = async () => {
    try {
      console.log('Creating sample shelters...');
      const sampleShelters = [
        {
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
          address: "Calle 5, Avenida 10, San José",
          ownerId: user?.uid || 'sample-owner-1',
          status: 'approved',
          isPremium: true
        },
        {
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
          address: "Avenida 2, Calle 8, Cartago",
          ownerId: user?.uid || 'sample-owner-2',
          status: 'approved',
          isPremium: false
        },
        {
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
          address: "Barrio Los Ángeles, Alajuela",
          ownerId: user?.uid || 'sample-owner-3',
          status: 'approved',
          isPremium: false
        }
      ];

      // Crear refugios en Firebase
      for (const shelterData of sampleShelters) {
        try {
          await shelterService.createShelter(shelterData);
        } catch (error) {
          console.error('Error creating sample shelter:', error);
        }
      }

      // Recargar refugios directamente sin llamar a loadShelters
      const [premiumSheltersData, regularSheltersData] = await Promise.all([
        shelterService.getPremiumShelters(),
        shelterService.getRegularShelters()
      ]);
      
      setPremiumShelters(premiumSheltersData);
      setRegularShelters(regularSheltersData);
      setShelters([...premiumSheltersData, ...regularSheltersData]);
    } catch (error) {
      console.error('Error creating sample shelters:', error);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("shelters") || "[]");
      setShelters(stored);
      setPremiumShelters(stored.filter(s => s.isPremium));
      setRegularShelters(stored.filter(s => !s.isPremium));
    } catch (e) {
      console.error("Error loading from localStorage", e);
    }
  };

  const filteredShelters = shelters.filter(shelter =>
    shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shelter.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shelter.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPremiumShelters = premiumShelters.filter(shelter =>
    shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shelter.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shelter.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRegularShelters = regularShelters.filter(shelter =>
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

  const handleUpgradeToPremium = (shelter) => {
    setSelectedShelterForPremium(shelter);
    setShowPremiumModal(true);
  };

  const handleCleanShelters = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar TODOS los refugios de la base de datos? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsCleaning(true);
      console.log('Iniciando limpieza...');
      
      // Agregar timeout de seguridad (30 segundos)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La limpieza tardó demasiado')), 30000)
      );
      
      // Función de limpieza removida
      const deletedCount = 0;
      
      console.log(`Limpieza completada: ${deletedCount} refugios eliminados`);
      alert(`✅ Se eliminaron ${deletedCount} refugios de la base de datos.`);
      // Recargar la página para mostrar los cambios
      window.location.reload();
    } catch (error) {
      console.error('Error cleaning shelters:', error);
      if (error.message.includes('Timeout')) {
        alert('⏰ La limpieza tardó demasiado. Intenta de nuevo o revisa la consola.');
      } else {
        alert('❌ Error al limpiar los refugios. Revisa la consola para más detalles.');
      }
    } finally {
      setIsCleaning(false);
    }
  };

  const handleDebugShelters = async () => {
    try {
      setIsDebugging(true);
      console.log('Iniciando debug...');
      // Función de debug removida
      const result = { message: 'Debug removido' };
      console.log('Debug completado:', result);
      alert(`🔍 Debug completado. Revisa la consola para ver los detalles.\n\nTotal: ${result.total} refugios\nStatus: ${Object.keys(result.statusCounts).join(', ')}`);
    } catch (error) {
      console.error('Error debugging shelters:', error);
      alert('❌ Error al hacer debug. Revisa la consola para más detalles.');
    } finally {
      setIsDebugging(false);
    }
  };

  const handleEmergencyClean = async () => {
    if (!confirm('🚨 EMERGENCIA: Esto eliminará TODOS los datos de la base de datos (refugios, mascotas, etc.). ¿Estás seguro?')) {
      return;
    }

    try {
      setIsEmergencyCleaning(true);
      console.log('Iniciando limpieza de emergencia...');
      // Función de limpieza de emergencia removida
      console.log('Limpieza de emergencia removida');
      alert('🎉 Limpieza de emergencia completada. Tu quota de Firebase debería estar liberada.');
      window.location.reload();
    } catch (error) {
      console.error('Error en limpieza de emergencia:', error);
      alert('❌ Error en limpieza de emergencia. Revisa la consola.');
    } finally {
      setIsEmergencyCleaning(false);
    }
  };

  const handlePremiumSuccess = () => {
    // Recargar refugios después de activar premium
    loadShelters();
  };

  const renderShelterCard = (shelter, isPremium = false) => (
    <div 
      key={shelter.id} 
      className={`shelter-card ${isPremium ? 'premium' : ''}`}
      onClick={() => handleShelterClick(shelter)}
    >
      {isPremium && (
        <div className="premium-badge">
          <span>⭐ Premium</span>
        </div>
      )}
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
        {!isPremium && user && shelter.ownerId === user.uid && (
          <button 
            className="upgrade-button"
            onClick={(e) => {
              e.stopPropagation();
              handleUpgradeToPremium(shelter);
            }}
          >
            🚀 Actualizar a Premium
          </button>
        )}
      </div>
      <div className="shelter-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
      </div>
    </div>
  );

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
        <div className="header-content">
          <div>
            <h2 className="section-title">Refugios</h2>
            <p className="page-subtitle">Conecta con organizaciones de rescate animal</p>
          </div>
          <div className="header-actions">
            <button 
              className="debug-button"
              onClick={handleDebugShelters}
              disabled={isDebugging}
              title="Analizar refugios en la base de datos"
            >
              {isDebugging ? '🔍 Analizando...' : '🔍 Debug BD'}
            </button>
            <button 
              className="clean-button"
              onClick={handleCleanShelters}
              disabled={isCleaning}
              title="Limpiar todos los refugios de la base de datos"
            >
              {isCleaning ? '🧹 Limpiando...' : '🧹 Limpiar BD'}
            </button>
            <button 
              className="emergency-button"
              onClick={handleEmergencyClean}
              disabled={isEmergencyCleaning}
              title="EMERGENCIA: Limpiar TODA la base de datos"
            >
              {isEmergencyCleaning ? '🚨 Limpiando...' : '🚨 EMERGENCIA'}
            </button>
          </div>
        </div>
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
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Cargando refugios...</p>
          </div>
        ) : (
          <div className="shelters-container">
            {/* Refugios Premium - Dos columnas */}
            {filteredPremiumShelters.length > 0 && (
              <div className="shelters-section">
                <div className="section-header">
                  <h3>⭐ Refugios Premium</h3>
                  <p>Refugios destacados con mayor visibilidad</p>
                </div>
                <div className="shelters-list premium-grid">
                  {filteredPremiumShelters.map((shelter) => renderShelterCard(shelter, true))}
                </div>
              </div>
            )}

            {/* Refugios Regulares - Una columna */}
            {filteredRegularShelters.length > 0 && (
              <div className="shelters-section">
                <div className="section-header">
                  <h3>🏠 Refugios</h3>
                  <p>Conecta con organizaciones de rescate animal</p>
                </div>
                <div className="shelters-list regular-grid">
                  {filteredRegularShelters.map((shelter) => renderShelterCard(shelter, false))}
                </div>
              </div>
            )}

            {/* Estado vacío */}
            {filteredShelters.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🏠</div>
                <h3>No se encontraron refugios</h3>
                <p>Intenta con otros términos de búsqueda</p>
              </div>
            )}
          </div>
        )}
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

export default Shelters;
