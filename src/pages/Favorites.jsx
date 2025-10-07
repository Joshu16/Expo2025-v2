import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { favoriteService, petService } from "../firebase/services.js";
import "../styles/App.css";
import "../styles/Favorites.css";
import NavBar from "../components/navbar.jsx";

function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoritesData = await favoriteService.getFavorites(user.uid);
      
      // Obtener información completa de cada mascota favorita
      const enrichedFavorites = await Promise.all(
        favoritesData.map(async (fav) => {
          const pet = await petService.getPetById(fav.petId);
          return {
            ...fav,
            pet: pet
          };
        })
      );
      
      setFavorites(enrichedFavorites.filter(fav => fav.pet)); // Filtrar mascotas que existen
      console.log('Favorites loaded:', enrichedFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (petId) => {
    try {
      await favoriteService.removeFavorite(user.uid, petId);
      setFavorites(prev => prev.filter(fav => fav.petId !== petId));
      console.log('Favorite removed');
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Error al quitar de favoritos');
    }
  };

  const goToPetDetails = (pet) => {
    navigate('/adopt', { state: { pet } });
  };

  if (loading) {
    return (
      <div className="container">
        <header className="modern-header">
          <h2 className="section-title">Mis Favoritos</h2>
        </header>
        <main className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Cargando favoritos...</p>
          </div>
        </main>
        <NavBar />
      </div>
    );
  }

  return (
    <div className="container">
      <header className="modern-header">
        <h2 className="section-title">Mis Favoritos</h2>
        <p className="page-subtitle">Mascotas que te han gustado</p>
      </header>

      <main className="main-content">
        {favorites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💔</div>
            <h3>No tienes favoritos</h3>
            <p>Explora las mascotas disponibles y agrega las que te gusten a tus favoritos</p>
            <button 
              className="primary-button"
              onClick={() => navigate('/')}
            >
              Explorar Mascotas
            </button>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="favorite-card">
                <div className="pet-image-container">
                  <img 
                    src={favorite.pet.img} 
                    alt={favorite.pet.name}
                    onClick={() => goToPetDetails(favorite.pet)}
                  />
                  <button 
                    className="remove-favorite-btn"
                    onClick={() => removeFavorite(favorite.petId)}
                    title="Quitar de favoritos"
                  >
                    ❌
                  </button>
                </div>
                <div className="pet-info">
                  <h3 onClick={() => goToPetDetails(favorite.pet)}>
                    {favorite.pet.name}
                  </h3>
                  <p className="pet-details">
                    {favorite.pet.breed} • {favorite.pet.gender} • {favorite.pet.age}
                  </p>
                  <p className="pet-location">📍 {favorite.pet.location}</p>
                  <div className="pet-actions">
                    <button 
                      className="view-details-btn"
                      onClick={() => goToPetDetails(favorite.pet)}
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <NavBar />
    </div>
  );
}

export default Favorites;
