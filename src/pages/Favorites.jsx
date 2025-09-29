import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/Favorites.css";
import NavBar from "../components/navbar.jsx";

function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [filter, setFilter] = useState("all"); // all, dogs, cats, others

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavorites(stored);
    } catch (e) {
      console.error("Error loading favorites", e);
    }
  }, []);

  const removeFavorite = (petId) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== petId);
    setFavorites(updatedFavorites);
    
    try {
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } catch (e) {
      console.error("Error removing favorite", e);
    }
  };

  const handlePetClick = (pet) => {
    navigate("/adopt", { state: { pet } });
  };

  const filteredFavorites = favorites.filter(favorite => {
    if (filter === "all") return true;
    if (filter === "dogs") return favorite.type === "Perro";
    if (filter === "cats") return favorite.type === "Gato";
    if (filter === "others") return !["Perro", "Gato"].includes(favorite.type);
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

  return (
    <div className="container">
      <header className="modern-header">
        <h2 className="section-title">Favoritos</h2>
        <p className="page-subtitle">Tus mascotas favoritas</p>
      </header>

      <main className="main-content">
        {/* Filtros */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Todas ({favorites.length})
          </button>
          <button 
            className={`filter-tab ${filter === "dogs" ? "active" : ""}`}
            onClick={() => setFilter("dogs")}
          >
            Perros ({favorites.filter(f => f.type === "Perro").length})
          </button>
          <button 
            className={`filter-tab ${filter === "cats" ? "active" : ""}`}
            onClick={() => setFilter("cats")}
          >
            Gatos ({favorites.filter(f => f.type === "Gato").length})
          </button>
          <button 
            className={`filter-tab ${filter === "others" ? "active" : ""}`}
            onClick={() => setFilter("others")}
          >
            Otros ({favorites.filter(f => !["Perro", "Gato"].includes(f.type)).length})
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
