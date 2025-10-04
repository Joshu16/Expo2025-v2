import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { userService, petService } from "../firebase/services.js";
import "../styles/App.css";
import NavBar from "../components/navbar.jsx";

function Home({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [pets, setPets] = useState([]);
  const [userProfile, setUserProfile] = useState({ name: "", address: "" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Si venimos de Categories, obtenemos la categoría seleccionada
  const categoryFilter = location.state?.category || "";

  useEffect(() => {
    const loadData = async () => {
      console.log("Home useEffect - user:", user);
      console.log("Home useEffect - loading:", loading);
      
      if (user) {
        try {
          // Test básico de Firebase
          console.log("Testing Firebase connection...");
          console.log("User UID:", user.uid);
          console.log("User displayName:", user.displayName);
          console.log("User email:", user.email);
          
          // Cargar perfil del usuario
          console.log("Loading profile for user:", user.uid);
          const profile = await userService.getUserProfile(user.uid);
          console.log("Profile loaded:", profile);
          if (profile) {
            setUserProfile({
              name: profile.name || "",
              address: profile.address || ""
            });
          } else {
            console.log("No profile found, using display name:", user.displayName);
            setUserProfile({
              name: user.displayName || "",
              address: ""
            });
          }

          // Cargar mascotas
          const petsData = await petService.getPets();
          if (petsData.length === 0) {
            // Si no hay mascotas, crear algunas de ejemplo
            const samplePets = [
              {
                name: "Bobby",
                breed: "Mestizo",
                gender: "Macho",
                age: "2 años",
                location: "San José",
                img: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop",
                type: "Perro",
                status: "available"
              },
              {
                name: "Luna",
                breed: "Siames",
                gender: "Hembra",
                age: "1 año",
                location: "Cartago",
                img: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800&auto=format&fit=crop",
                type: "Gato",
                status: "available"
              },
              {
                name: "Max",
                breed: "Labrador",
                gender: "Macho",
                age: "3 años",
                location: "Alajuela",
                img: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=800&auto=format&fit=crop",
                type: "Perro",
                status: "available"
              },
              {
                name: "Spike",
                breed: "Erizo Africano",
                gender: "Macho",
                age: "1 año",
                location: "Heredia",
                img: "https://www.abene.com.mx/cdn/shop/articles/shutterstock_151119362.jpg?v=1620270612",
                type: "Erizo",
                status: "available"
              }
            ];

            // Crear mascotas de ejemplo en Firebase
            for (const pet of samplePets) {
              await petService.createPet(pet);
            }
            setPets(samplePets);
          } else {
            setPets(petsData);
          }
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Si no hay usuario, solo cargar mascotas de ejemplo
        setPets([
          {
            id: 1,
            name: "Bobby",
            breed: "Mestizo",
            gender: "Macho",
            age: "2 años",
            location: "San José",
            img: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop",
            type: "Perro"
          },
          {
            id: 2,
            name: "Luna",
            breed: "Siames",
            gender: "Hembra",
            age: "1 año",
            location: "Cartago",
            img: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800&auto=format&fit=crop",
            type: "Gato"
          }
        ]);
        setLoading(false);
      }
    };

    loadData();
  }, [user, loading]);

  const filteredPets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return pets.filter((p) => {
      // Filtrar por categoría si viene de Categories
      const matchesCategory = categoryFilter ? p.type.toLowerCase() === categoryFilter.toLowerCase() : true;

      // Filtrar por búsqueda
      const matchesSearch = !term || [p.name, p.breed, p.gender, p.age, p.location]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));

      return matchesCategory && matchesSearch;
    });
  }, [pets, search, categoryFilter]);

  const handleSearchClick = () => {
    navigate("/categories");
  };

  const handleCardClick = (pet) => {
    navigate("/adopt", { state: { pet } });
  };

  const handleUploadClick = () => {
    navigate("/upload");
  };

  const handleTrackingClick = () => {
    navigate("/tracking");
  };

  const handleChatClick = () => {
    navigate("/chat");
  };

  const handleSheltersClick = () => {
    navigate("/shelters");
  };

  const handleNotificationsClick = () => {
    navigate("/notifications");
  };

  const toggleFavorite = (pet, e) => {
    e.stopPropagation();
    try {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      const isFavorite = favorites.some(fav => fav.id === pet.id);
      
      if (isFavorite) {
        // Remover de favoritos
        const updatedFavorites = favorites.filter(fav => fav.id !== pet.id);
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      } else {
        // Agregar a favoritos
        const updatedFavorites = [...favorites, { ...pet, id: pet.id || Date.now() }];
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      }
    } catch (e) {
      console.error("Error updating favorites", e);
    }
  };

  const isFavorite = (pet) => {
    try {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      return favorites.some(fav => fav.id === pet.id);
    } catch (e) {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingBottom: '90px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px'
        }}>
          Cargando...
        </div>
        <NavBar />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <header className="modern-header">
        <div className="header-top">
          <div className="greeting-section">
            <h1 className="greeting-title">Hola, {userProfile.name || "Amigo"} 👋</h1>
            <p className="greeting-subtitle">Encuentra tu compañero perfecto</p>
          </div>
          <div className="user-avatar" onClick={() => navigate('/profile')}>
            <div className="avatar-circle">
              <span className="avatar-text">{(userProfile.name || "A").charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
        
        <div className="search-container">
          <div className="search-bar">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar mascotas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button className="filter-button" onClick={handleSearchClick}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 7H21M9 12H21M17 17H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="quick-actions">
          <button className="quick-action-btn" onClick={handleUploadClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Subir mascota</span>
          </button>
          <button className="quick-action-btn" onClick={handleTrackingClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Seguimiento</span>
          </button>
          <button className="quick-action-btn" onClick={handleChatClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Mensajes</span>
          </button>
          <button className="quick-action-btn" onClick={handleSheltersClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Refugios</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="section-header">
          <h2 className="section-title">Mascotas disponibles</h2>
          <span className="pets-count">{filteredPets.length} mascotas</span>
        </div>

        <div className="pets-grid">
          {filteredPets.map((pet, index) => (
            <div
              key={index}
              className="pet-card"
              onClick={() => handleCardClick(pet)}
            >
              <div className="pet-image-wrapper">
                <img src={pet.img} alt={pet.name} className="pet-image" />
                <button 
                  className={`favorite-btn ${isFavorite(pet) ? 'favorited' : ''}`}
                  onClick={(e) => toggleFavorite(pet, e)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
                <div className="pet-type-badge">{pet.type}</div>
              </div>
              
              <div className="pet-content">
                <h3 className="pet-name">{pet.name}</h3>
                <p className="pet-details">{pet.breed} • {pet.gender}</p>
                <div className="pet-meta">
                  <span className="pet-age">{pet.age}</span>
                  <span className="pet-location">📍 {pet.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPets.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🐾</div>
            <h3>No se encontraron mascotas</h3>
            <p>Intenta ajustar tu búsqueda o explorar todas las categorías</p>
            <button className="explore-btn" onClick={handleSearchClick}>
              Explorar categorías
            </button>
          </div>
        )}
      </main>

      <NavBar />
    </div>
  );
}

export default Home;
