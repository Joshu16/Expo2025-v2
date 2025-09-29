import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/ShelterRegister.css";
import NavBar from "../components/navbar.jsx";

function ShelterRegister() {
  const navigate = useNavigate();
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

    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const newShelter = {
        id: Date.now(),
        ...formData,
        services: selectedServices,
        rating: 0,
        petsCount: 0,
        verified: false,
        createdAt: new Date().toISOString()
      };

      const existingShelters = JSON.parse(localStorage.getItem("shelters") || "[]");
      const updatedShelters = [newShelter, ...existingShelters];
      localStorage.setItem("shelters", JSON.stringify(updatedShelters));

      alert("Refugio registrado exitosamente. Será revisado por nuestro equipo.");
      navigate("/shelters");
    } catch (error) {
      console.error("Error saving shelter", error);
      alert("Error al registrar el refugio. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
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
            
            <div className="form-row">
              <div className="form-group">
                <label>Ciudad/Provincia *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Ej: San José, Costa Rica"
                  required
                />
              </div>

              <div className="form-group">
                <label>Dirección *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Dirección completa"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Teléfono *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+506 2222-3333"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contacto@refugio.com"
                  required
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
    </div>
  );
}

export default ShelterRegister;
