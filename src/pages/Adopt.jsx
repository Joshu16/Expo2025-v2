import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/adopt.css";
import NavBar from "../components/navbar.jsx";

function Adopt() {
  const location = useLocation();
  const navigate = useNavigate();
  const pet = location.state?.pet;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [completed, setCompleted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!pet) {
      navigate("/");
      return;
    }

    // Verificar si la mascota está en favoritos
    try {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(favorites.some(fav => fav.id === pet.id));
    } catch (e) {
      console.error("Error checking favorites", e);
    }
  }, [pet, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleFavorite = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      
      if (isFavorite) {
        // Remover de favoritos
        const updatedFavorites = favorites.filter(fav => fav.id !== pet.id);
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        setIsFavorite(false);
      } else {
        // Agregar a favoritos
        const updatedFavorites = [...favorites, { ...pet, id: pet.id || Date.now() }];
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        setIsFavorite(true);
      }
    } catch (e) {
      console.error("Error updating favorites", e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Crear registro de adopción
    const adoption = {
      id: Date.now(),
      pet: pet,
      adopterName: formData.name,
      adopterEmail: formData.email,
      adopterPhone: formData.phone,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      // Guardar adopción
      const adoptions = JSON.parse(localStorage.getItem("adoptions") || "[]");
      const updatedAdoptions = [adoption, ...adoptions];
      localStorage.setItem("adoptions", JSON.stringify(updatedAdoptions));

      // Crear notificación
      const notification = {
        id: Date.now(),
        type: "adoption",
        title: "Solicitud de adopción enviada",
        message: `Tu solicitud para adoptar a ${pet.name} ha sido enviada y está siendo revisada.`,
        timestamp: new Date().toISOString(),
        read: false,
      };

      const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
      const updatedNotifications = [notification, ...notifications];
      localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

      setCompleted(true);
    } catch (e) {
      console.error("Error saving adoption", e);
      alert("Error al procesar la solicitud. Inténtalo de nuevo.");
    }
  };

  if (!pet) return <div className="container"><p>No se encontró la mascota.</p><NavBar /></div>;

  return (
    <div className="container">
      <header>
        <h2 className="logo-text">Adoptar</h2>
      </header>

      <main>
        <div className="adopt-container">
          <div className="pet-header">
            <div className="pet-image-container">
              <img src={pet.img} alt={pet.name} className="pet-img" />
              <button 
                className={`favorite-button ${isFavorite ? 'active' : ''}`}
                onClick={toggleFavorite}
                title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
            <div className="pet-info">
              <h1>{pet.name}</h1>
              <p className="pet-details">
                {pet.breed} • {pet.gender} • {pet.age} • {pet.location}
              </p>
            </div>
          </div>

          {!completed ? (
            <form className="adopt-form" onSubmit={handleSubmit}>
              <label>Nombre</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
              />
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Tu email"
                required
              />
              <label>Teléfono</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Tu teléfono"
                required
              />
              <button type="submit">Adoptar</button>
            </form>
          ) : (
            <div className="adoption-completed">
              <div className="success-icon">✅</div>
              <h2>¡Solicitud enviada!</h2>
              <p>Tu solicitud de adopción ha sido enviada y está siendo revisada.</p>
              <div className="completion-actions">
                <button 
                  className="tracking-button"
                  onClick={() => navigate("/tracking")}
                >
                  Ver seguimiento
                </button>
                <button 
                  className="home-button"
                  onClick={() => navigate("/")}
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <NavBar />
    </div>
  );
}

export default Adopt;
