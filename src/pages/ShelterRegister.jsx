import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/ShelterRegister.css";
import NavBar from "../components/navbar.jsx";
import PremiumModal from "../components/PremiumModal.jsx";
import { shelterService, userService } from "../firebase/services.js";
import { useAuth } from "../contexts/AuthContext.jsx";

function ShelterRegister() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    hours: "",
    services: [],
    image: ""
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedShelterForPremium, setSelectedShelterForPremium] = useState(null);

  // Cargar datos del usuario automáticamente
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Si no hay usuario, redirigir al login
      navigate("/login");
    }
  }, [user, navigate]);

  const loadUserData = async () => {
    try {
      const userProfile = await userService.getUserProfile(user.uid);
      if (userProfile) {
        setFormData(prev => ({
          ...prev,
          name: userProfile.name ? `${userProfile.name} - Refugio` : "Mi Refugio",
          email: userProfile.email || user.email || "",
          phone: userProfile.phone || "",
          address: userProfile.address || "",
          location: userProfile.address || "Costa Rica"
        }));
      } else {
        // Si no hay perfil, usar datos básicos del usuario
        setFormData(prev => ({
          ...prev,
          name: user.displayName ? `${user.displayName} - Refugio` : "Mi Refugio",
          email: user.email || "",
          location: "Costa Rica"
        }));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const availableServices = [
    "Adopción",
    "Esterilización",
    "Vacunación",
    "Atención médica",
    "Rescate",
    "Rehabilitación",
    "Entrenamiento",
    "Hospedaje temporal",
    "Donaciones",
    "Voluntariado"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (service) => {
    setSelectedServices(prev => {
      if (prev.includes(service)) {
        return prev.filter(s => s !== service);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const shelterData = {
        ...formData,
        services: selectedServices,
        ownerId: user?.uid || 'anonymous',
        ownerName: user?.displayName || user?.email || 'Usuario Anónimo',
        rating: 0,
        petsCount: 0,
        verified: true,
        isPremium: false,
        status: 'active'
      };

      console.log('Creating shelter with data:', shelterData);
      const shelterId = await shelterService.createShelter(shelterData);
      console.log('Shelter created with ID:', shelterId);

      // Mostrar modal de premium después del registro
      setShowPremiumModal(true);
      setSelectedShelterForPremium(shelterId);
    } catch (error) {
      console.error("Error creating shelter", error);
      setError("❌ Error al registrar el refugio: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePremiumSuccess = () => {
    setShowPremiumModal(false);
    setSelectedShelterForPremium(null);
    alert("¡Refugio registrado exitosamente! Ahora tienes acceso premium.\n\n¿Te gustaría subir tu primera mascota?");
    // Redirigir a upload para subir primera mascota
    navigate("/upload");
  };

  const handlePremiumClose = () => {
    setShowPremiumModal(false);
    setSelectedShelterForPremium(null);
    alert("Refugio registrado exitosamente. Puedes actualizar a premium más tarde desde la página de refugios.\n\n¿Te gustaría subir tu primera mascota?");
    // Redirigir a upload para subir primera mascota
    navigate("/upload");
  };

  return (
    <div className="container">
      <header>
        <button className="back-button" onClick={() => navigate("/shelters")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Volver
        </button>
        <h2 className="logo-text">Registrar Refugio</h2>
        <p className="page-subtitle">Únete a nuestra red de organizaciones de rescate</p>
      </header>

      <main className="shelter-register-main">
        {!user && (
          <div className="info-message">
            <span>ℹ️</span>
            <span>Puedes registrar un refugio sin iniciar sesión. Si tienes cuenta, inicia sesión para gestionar mejor tu refugio.</span>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="shelter-form">
          {/* Información básica */}
          <div className="form-section">
            <h3>Información Básica</h3>
            
            <div className="form-group">
              <label>Nombre del Refugio *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ej: Refugio Animal San José"
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe tu organización, misión y objetivos..."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label>Imagen del Refugio</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => handleInputChange("image", e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {formData.image && (
                <div className="image-preview">
                  <img src={formData.image} alt="Preview" />
                </div>
              )}
            </div>
          </div>

          {/* Información de contacto */}
          <div className="form-section">
            <h3>Información de Contacto</h3>
            
            <div className="form-group">
              <label>Ubicación *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Ej: San José, Costa Rica"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+506 2222-3333"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contacto@refugio.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sitio Web</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="www.refugio.com"
                />
              </div>

              <div className="form-group">
                <label>Horarios de Atención *</label>
                <input
                  type="text"
                  value={formData.hours}
                  onChange={(e) => handleInputChange("hours", e.target.value)}
                  placeholder="Lunes a Viernes: 8:00 AM - 6:00 PM"
                  required
                />
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div className="form-section">
            <h3>Servicios Ofrecidos</h3>
            <p className="section-description">Selecciona todos los servicios que ofrece tu refugio:</p>
            
            <div className="services-grid">
              {availableServices.map((service) => (
                <label key={service} className="service-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service)}
                    onChange={() => handleServiceToggle(service)}
                  />
                  <span className="checkmark"></span>
                  <span className="service-label">{service}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Términos y condiciones */}
          <div className="form-section">
            <div className="terms-section">
              <label className="terms-checkbox">
                <input type="checkbox" required />
                <span className="checkmark"></span>
                <span>
                  Acepto los <a href="#" className="terms-link">términos y condiciones</a> y 
                  la <a href="#" className="terms-link">política de privacidad</a>
                </span>
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate("/shelters")}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Registrar Refugio"}
            </button>
          </div>
        </form>
      </main>

      <NavBar />
      
      {/* Modal Premium */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={handlePremiumClose}
        shelterId={selectedShelterForPremium}
        shelterName={formData.name}
        onSuccess={handlePremiumSuccess}
      />
    </div>
  );
}

export default ShelterRegister;
