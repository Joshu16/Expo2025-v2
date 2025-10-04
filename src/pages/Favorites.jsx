import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/Favorites.css";
import NavBar from "../components/navbar.jsx";
import { favoriteService, petService } from "../firebase/services.js";

function Favorites({ user }) {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [favoritePets, setFavoritePets] = useState([]);
  const [filter, setFilter] = useState("all"); // all, dogs, cats, others
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      console.log('Loading favorites from Firebase for user:', user.uid);
      setLoading(true);
      setError(null);
      
      // Obtener favoritos del usuario
      const favoritesData = await favoriteService.getFavorites(user.uid);
      setFavorites(favoritesData);
      
      // Obtener datos completos de las mascotas favoritas
      const petPromises = favoritesData.map(favorite => 
        petService.getPetById(favorite.petId)
      );
      
      const petsData = await Promise.all(petPromises);
      const validPets = petsData.filter(pet => pet !== null);
      
      console.log('Favorite pets loaded:', validPets);
      setFavoritePets(validPets);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Error al cargar favoritos');
      
      // Fallback a localStorage si hay error
      try {
        const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
        setFavorites(stored);
        setFavoritePets(stored);
      } catch (e) {
        console.error("Error loading favorites from localStorage", e);
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (petId) => {
    if (!user?.uid) {
      alert("Debes iniciar sesión para gestionar favoritos");
      return;
    }

    try {
      console.log('Removing favorite for petId:', petId);
      await favoriteService.removeFavorite(user.uid, petId);
      
      // Actualizar estado local
      const updatedFavorites = favorites.filter(fav => fav.petId !== petId);
      setFavorites(updatedFavorites);
      
      const updatedPets = favoritePets.filter(pet => pet.id !== petId);
      setFavoritePets(updatedPets);
      
      console.log('Favorite removed successfully');
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Error al quitar de favoritos. Inténtalo de nuevo.");
    }
  };

  const handlePetClick = (pet) => {
    navigate("/adopt", { state: { pet } });
  };

  const filteredFavorites = favoritePets.filter(pet => {
    if (filter === "all") return true;
    if (filter === "dogs") return pet.type === "Perro";
    if (filter === "cats") return pet.type === "Gato";
    if (filter === "others") return !["Perro", "Gato"].includes(pet.type);
    return true;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case "Perro": return "🐕";
      case "Gato": return "🐱";
      case "Conejo": return "🐰";
      case "Erizo": return "🦔";
      case "Hamster": return "🐹";
      case "Loro": return "🦜";
      default: return "🐾";
    }
  };

  if (loading) {
    return (
      <div className="container">
        <header className="modern-header">
          <h2 className="section-title">Favoritos</h2>
          <p className="page-subtitle">Tus mascotas favoritas</p>
        </header>
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando favoritos...</p>
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
          <h2 className="section-title">Favoritos</h2>
          <p className="page-subtitle">Tus mascotas favoritas</p>
        </header>
        <main className="main-content">
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <h3>Inicia sesión para ver tus favoritos</h3>
            <p>Necesitas iniciar sesión para gestionar tus mascotas favoritas</p>
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
        <h2 className="section-title">Favoritos</h2>
        <p className="page-subtitle">Tus mascotas favoritas</p>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadFavorites}>Reintentar</button>
          </div>
        )}

        {/* Filtros */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Todas ({favoritePets.length})
          </button>
          <button 
            className={`filter-tab ${filter === "dogs" ? "active" : ""}`}
            onClick={() => setFilter("dogs")}
          >
            Perros ({favoritePets.filter(f => f.type === "Perro").length})
          </button>
          <button 
            className={`filter-tab ${filter === "cats" ? "active" : ""}`}
            onClick={() => setFilter("cats")}
          >
            Gatos ({favoritePets.filter(f => f.type === "Gato").length})
          </button>
          <button 
            className={`filter-tab ${filter === "others" ? "active" : ""}`}
            onClick={() => setFilter("others")}
          >
            Otros ({favoritePets.filter(f => !["Perro", "Gato"].includes(f.type)).length})
          </button>
        </div>

        {/* Lista de favoritos */}
        <div className="favorites-list">
          {filteredFavorites.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💖</div>
              <h3>No tienes favoritos</h3>
              <p>Las mascotas que marques como favoritas aparecerán aquí</p>
              <button className="browse-button" onClick={() => navigate("/")}>
                Explorar mascotas
              </button>
            </div>
          ) : (
            filteredFavorites.map((favorite) => (
              <div key={favorite.id} className="favorite-card">
                <div 
                  className="pet-image"
                  onClick={() => handlePetClick(favorite)}
                >
                  <img src={favorite.img} alt={favorite.name} />
                  <div className="pet-type-badge">
                    <span>{getTypeIcon(favorite.type)}</span>
                    <span>{favorite.type}</span>
                  </div>
                </div>
                
                <div className="pet-info">
                  <h3 onClick={() => handlePetClick(favorite)}>{favorite.name}</h3>
                  <p className="pet-details">
                    {favorite.breed} • {favorite.gender} • {favorite.age}
                  </p>
                  <p className="pet-location">📍 {favorite.location}</p>
                  
                  <div className="pet-actions">
                    <button 
                      className="adopt-button"
                      onClick={() => handlePetClick(favorite)}
                    >
                      Adoptar
                    </button>
                    <button 
                      className="remove-button"
                      onClick={() => removeFavorite(favorite.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </div>
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

export default Favorites;
