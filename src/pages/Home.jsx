import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { userService, petService, favoriteService, shelterService } from "../firebase/services.js";
import "../styles/App.css";
import NavBar from "../components/navbar.jsx";

function Home({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [pets, setPets] = useState([]);
  const [userProfile, setUserProfile] = useState({ name: "", address: "" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [shelters, setShelters] = useState([]);
  const [showOnlyShelters, setShowOnlyShelters] = useState(false);
  const [userShelters, setUserShelters] = useState([]);
  const [userType, setUserType] = useState('user'); // 'user', 'shelter', 'premium'

  // Si venimos de Categories, obtenemos la categoría seleccionada
  const categoryFilter = location.state?.category || "";

  // Aplicar tema al cargar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  // Función para cargar favoritos del usuario
  const loadFavorites = async () => {
    if (!user?.uid) return;
    
    try {
      console.log('Loading favorites for user:', user.uid);
      const favoritesData = await favoriteService.getFavorites(user.uid);
      
      // Obtener información completa de cada mascota favorita
      const enrichedFavorites = await Promise.all(
        favoritesData.map(async (fav) => {
          const pet = await petService.getPetById(fav.petId);
          return {
            ...fav,
            pet
          };
        })
      );
      
      setFavorites(enrichedFavorites);
      console.log('Favorites loaded:', enrichedFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Función para cargar refugios
  const loadShelters = async () => {
    try {
      console.log('Loading shelters...');
      const [premiumShelters, regularShelters] = await Promise.all([
        shelterService.getPremiumShelters(),
        shelterService.getRegularShelters()
      ]);
      
      // Mostrar premium primero, luego regulares
      const allShelters = [...premiumShelters, ...regularShelters];
      setShelters(allShelters);
      console.log('Shelters loaded:', allShelters);
    } catch (error) {
      console.error('Error loading shelters:', error);
    }
  };

  // Función para cargar refugios del usuario
  const loadUserShelters = async () => {
    if (!user?.uid) return;
    
    try {
      console.log('Loading user shelters...');
      const userSheltersData = await shelterService.getSheltersByOwner(user.uid);
      setUserShelters(userSheltersData);
      
      // Determinar tipo de usuario basado en sus refugios
      if (userSheltersData.length > 0) {
        const hasPremium = userSheltersData.some(shelter => shelter.isPremium);
        setUserType(hasPremium ? 'premium' : 'shelter');
      } else {
        setUserType('user');
      }
      
      console.log('User shelters loaded:', userSheltersData);
      console.log('User type determined:', userType);
    } catch (error) {
      console.error('Error loading user shelters:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      console.log("Home useEffect - user:", user);
      console.log("Home useEffect - loading:", loading);
      
      if (user) {
        try {
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

          // Cargar favoritos
          await loadFavorites();
          
          // Cargar refugios
          await loadShelters();
          
          // Cargar refugios del usuario para determinar tipo
          await loadUserShelters();

          // Cargar mascotas
          const petsData = await petService.getPets();
          if (petsData.length === 0) {
            // Si no hay mascotas, crear solo 2 de ejemplo
            const samplePets = [
              {
                name: "Bobby",
                breed: "Mestizo",
                gender: "Macho",
                age: "2 años",
                location: "San José",
                img: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop",
                type: "Perro",
                status: "available",
                ownerId: "admin", // ID del dueño de la mascota
                description: "Bobby es un perro muy cariñoso y juguetón. Le encanta jugar con niños y es muy obediente."
              },
              {
                name: "Luna",
                breed: "Siames",
                gender: "Hembra",
                age: "1 año",
                location: "Cartago",
                img: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800&auto=format&fit=crop",
                type: "Gato",
                status: "available",
                ownerId: "admin", // ID del dueño de la mascota
                description: "Luna es una gata muy independiente pero cariñosa. Es perfecta para una familia tranquila."
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
        // Si no hay usuario, cargar mascotas y refugios desde Firebase
        try {
          const petsData = await petService.getPets();
          setPets(petsData);
          
          // Cargar refugios también para usuarios no autenticados
          await loadShelters();
        } catch (error) {
          console.error("Error loading pets:", error);
          // Fallback a mascotas estáticas si hay error
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
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [user, loading]);

  const filteredPets = useMemo(() => {
    const term = search.trim().toLowerCase();
    let filtered = pets;

    // Si está activado el filtro de favoritas, mostrar solo favoritas
    if (showOnlyFavorites && user?.uid) {
      const favoritePetIds = favorites.map(fav => fav.petId);
      filtered = pets.filter(pet => favoritePetIds.includes(pet.id));
    }

    return filtered.filter((p) => {
      // Filtrar por categoría si viene de Categories
      const matchesCategory = categoryFilter ? p.type.toLowerCase() === categoryFilter.toLowerCase() : true;

      // Filtrar por búsqueda
      const matchesSearch = !term || [p.name, p.breed, p.gender, p.age, p.location]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));

      return matchesCategory && matchesSearch;
    });
  }, [pets, search, categoryFilter, showOnlyFavorites, favorites, user]);

  // Filtro para refugios
  const filteredShelters = useMemo(() => {
    if (showOnlyShelters) {
      return shelters.filter(shelter =>
        shelter.name.toLowerCase().includes(search.toLowerCase()) ||
        shelter.location.toLowerCase().includes(search.toLowerCase()) ||
        shelter.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    return [];
  }, [shelters, search, showOnlyShelters]);

  const handleSearchClick = () => {
    navigate("/categories");
  };

  const handleCardClick = (pet) => {
    navigate("/adopt", { state: { pet } });
  };


  const handleTrackingClick = () => {
    navigate("/tracking");
  };


  const handleSheltersClick = () => {
    navigate("/shelters");
  };

  const handleUsersClick = () => {
    navigate("/users");
  };

  const handleNotificationsClick = () => {
    navigate("/notifications");
  };

  const toggleFavorite = async (pet, e) => {
    e.stopPropagation();
    
    if (!user?.uid) {
      alert("Debes iniciar sesión para agregar favoritos");
      return;
    }

    try {
      const isCurrentlyFavorite = favorites.some(fav => fav.petId === pet.id);
      
      if (isCurrentlyFavorite) {
        // Remover de favoritos
        await favoriteService.removeFavorite(user.uid, pet.id);
        setFavorites(prev => prev.filter(fav => fav.petId !== pet.id));
        console.log('Pet removed from favorites');
      } else {
        // Agregar a favoritos
        await favoriteService.addFavorite(user.uid, pet.id);
        setFavorites(prev => [...prev, { petId: pet.id, userId: user.uid, createdAt: new Date().toISOString() }]);
        console.log('Pet added to favorites');
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      alert("Error al actualizar favoritos. Inténtalo de nuevo.");
    }
  };

  const isFavorite = (pet) => {
    return favorites.some(fav => fav.petId === pet.id);
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
          <div className="header-actions">
            <button 
              className="conversations-button"
              onClick={() => navigate('/conversations')}
              title="Conversaciones"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
            </button>
            <div className="user-avatar" onClick={() => navigate('/profile')}>
              <div className="avatar-circle">
                <span className="avatar-text">{(userProfile.name || "A").charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="search-container">
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
        </div>

        {/* Acciones rápidas */}
        <div className="quick-actions">
          <button className="quick-action-btn" onClick={handleTrackingClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Seguimiento</span>
          </button>
          <button className="quick-action-btn" onClick={handleUsersClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Usuarios</span>
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
          <div className="section-title-row">
            <h2 className="section-title">
              {showOnlyFavorites ? 'Tus favoritas' : 'Mascotas disponibles'}
            </h2>
            <span className="pets-count">{filteredPets.length} mascotas</span>
          </div>
          {user?.uid && favorites.length > 0 && (
            <div className="favorites-controls">
              <button 
                className={`favorites-toggle ${showOnlyFavorites ? 'active' : ''}`}
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                {showOnlyFavorites ? 'Ver todas' : 'Solo favoritas'}
              </button>
            </div>
          )}
        </div>

        <div className={`pets-grid ${userType === 'user' ? 'single-column' : userType === 'shelter' ? 'two-columns' : 'premium-layout'}`}>
          {filteredPets.map((pet, index) => (
            <div
              key={index}
              className={`pet-card ${userType === 'premium' && index < 2 ? 'featured' : ''}`}
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
                {pet.ownerName && (
                  <div className="pet-owner">
                    <span className="owner-label">Dueño:</span>
                    <span className="owner-name">{pet.ownerName}</span>
                  </div>
                )}
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

        {/* Sección de Refugios */}
        {shelters.length > 0 && (
          <section className="shelters-section">
            <div className="section-header">
              <div className="section-title-row">
                <h2 className="section-title">
                  {showOnlyShelters ? 'Refugios' : 'Refugios destacados'}
                </h2>
                <span className="pets-count">{shelters.length} refugios</span>
              </div>
              <div className="shelters-controls">
                <button 
                  className={`shelters-toggle ${showOnlyShelters ? 'active' : ''}`}
                  onClick={() => setShowOnlyShelters(!showOnlyShelters)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                  {showOnlyShelters ? 'Ver mascotas' : 'Solo refugios'}
                </button>
                <button 
                  className="view-all-shelters"
                  onClick={() => navigate('/shelters')}
                >
                  Ver todos
                </button>
              </div>
            </div>

            <div className="shelters-grid">
              {(showOnlyShelters ? filteredShelters : shelters.slice(0, 4)).map((shelter, index) => (
                <div
                  key={shelter.id || index}
                  className={`shelter-card ${shelter.isPremium ? 'premium' : ''}`}
                  onClick={() => navigate('/shelters')}
                >
                  <div className="shelter-image-wrapper">
                    <img 
                      src={shelter.image || '/default-shelter.jpg'} 
                      alt={shelter.name} 
                      className="shelter-image" 
                    />
                    {shelter.isPremium && (
                      <div className="premium-badge">⭐ Premium</div>
                    )}
                  </div>
                  <div className="shelter-content">
                    <h3 className="shelter-name">{shelter.name}</h3>
                    <p className="shelter-location">📍 {shelter.location}</p>
                    <p className="shelter-description">{shelter.description}</p>
                    <div className="shelter-meta">
                      <span className="rating">⭐ {shelter.rating || 'N/A'}</span>
                      <span className="pets-count">🐾 {shelter.petsCount || 0} mascotas</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <NavBar />
    </div>
  );
}

export default Home;
