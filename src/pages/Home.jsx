import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { userService, petService, favoriteService, shelterService } from "../firebase/services.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTheme } from "../hooks/useTheme.js";
import "../styles/App.css";
import NavBar from "../components/navbar.jsx";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pets, setPets] = useState([]);
  const [userProfile, setUserProfile] = useState({ name: "", address: "" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState(['all']); // Array de filtros seleccionados
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [shelters, setShelters] = useState([]);
  const [userShelters, setUserShelters] = useState([]);
  const [userType, setUserType] = useState('user'); // 'user', 'shelter', 'premium'
  const { currentTheme, toggleTheme } = useTheme();

  // Si venimos de Categories, obtenemos la categoría seleccionada
  const categoryFilter = location.state?.category || "";

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

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
            pet: pet
          };
        })
      );
      
      setFavorites(enrichedFavorites.filter(fav => fav.pet)); // Filtrar mascotas que existen
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
      console.log('🏠 Refugios cargados:', allShelters.length, 'total');
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
        console.log('User type determined:', hasPremium ? 'premium' : 'shelter');
      } else {
        setUserType('user');
        console.log('User type determined: user');
      }
      
      console.log('User shelters loaded:', userSheltersData);
    } catch (error) {
      console.error('Error loading user shelters:', error);
    }
  };

  // Función para recargar todos los datos
  const reloadAllData = async () => {
    console.log('🔄 Recargando todos los datos...');
    await loadShelters();
    await loadUserShelters();
    const petsData = await petService.getPets();
    setPets(petsData);
    console.log('✅ Datos recargados');
  };

  // Función para verificar si un refugio es premium
  const isShelterPremium = async (shelterId) => {
    if (!shelterId) return false;
    
    try {
      const shelter = await shelterService.getShelterById(shelterId);
      return shelter && shelter.isPremium;
    } catch (error) {
      console.error('Error checking shelter premium status:', error);
      return false;
    }
  };

  // Efecto para recargar datos cuando se regresa a la página
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Página enfocada, recargando datos...');
      reloadAllData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

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
          
          // Cargar refugios primero
          await loadShelters();
          
          // Cargar refugios del usuario para determinar tipo
          await loadUserShelters();

          // Esperar un poco para asegurar que los refugios se carguen
          await new Promise(resolve => setTimeout(resolve, 100));

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

    // Si no hay filtros seleccionados o solo 'all', mostrar todas
    if (selectedFilters.length === 0 || selectedFilters.includes('all')) {
      // Si viene de Categories, aplicar filtro de categoría
      if (categoryFilter) {
        filtered = pets.filter(pet => 
          pet.type.toLowerCase() === categoryFilter.toLowerCase()
        );
      }
    } else {
      // Aplicar filtros múltiples
      filtered = pets.filter(pet => {
        return selectedFilters.some(filter => {
          switch (filter) {
            case 'favorites':
              if (user?.uid) {
                const favoritePetIds = favorites.map(fav => fav.petId);
                return favoritePetIds.includes(pet.id);
              }
              return false;
            case 'shelters':
              return pet.shelterId && pet.shelterName;
            case 'dogs':
              return pet.type.toLowerCase() === 'perro';
            case 'cats':
              return pet.type.toLowerCase() === 'gato';
            case 'others':
              return pet.type.toLowerCase() !== 'perro' && 
                     pet.type.toLowerCase() !== 'gato';
            default:
              return false;
          }
        });
      });
    }

    // Aplicar búsqueda
    return filtered.filter((p) => {
      const matchesSearch = !term || [p.name, p.breed, p.gender, p.age, p.location, p.shelterName]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));

      return matchesSearch;
    });
  }, [pets, search, selectedFilters, categoryFilter, favorites, user]);


  const handleSearchClick = () => {
    navigate("/categories");
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

  const toggleFilter = (filter) => {
    setSelectedFilters(prev => {
      if (filter === 'all') {
        return ['all'];
      }
      
      if (prev.includes(filter)) {
        const newFilters = prev.filter(f => f !== filter);
        return newFilters.length === 0 ? ['all'] : newFilters;
      } else {
        const newFilters = prev.filter(f => f !== 'all');
        return [...newFilters, filter];
      }
    });
  };

  const getFilterLabel = () => {
    if (selectedFilters.includes('all') || selectedFilters.length === 0) {
      return 'Todos los filtros';
    }
    if (selectedFilters.length === 1) {
      const labels = {
        'favorites': 'Favoritas',
        'shelters': 'Refugios',
        'dogs': 'Perros',
        'cats': 'Gatos',
        'others': 'Otros'
      };
      return labels[selectedFilters[0]] || 'Filtros';
    }
    return `${selectedFilters.length} filtros`;
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
          <button 
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={currentTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {currentTheme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3V4M12 20V21M4 12H3M6.31412 6.31412L5.5 5.5M17.6859 6.31412L18.5 5.5M6.31412 17.69L5.5 18.5M17.6859 17.69L18.5 18.5M21 12H20M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
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
        {/* Filtro único con dropdown */}
        <div className="filter-container">
          <div className="filter-dropdown">
            <button 
              className="filter-trigger"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
              </svg>
              <span className="filter-label">{getFilterLabel()}</span>
              <svg 
                className={`filter-arrow ${showFilterDropdown ? 'open' : ''}`} 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
            
            {showFilterDropdown && (
              <div className="filter-options">
                <div className="filter-option">
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes('all')}
                      onChange={() => toggleFilter('all')}
                    />
                    <span className="checkmark"></span>
                    <span className="option-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Todas las mascotas
                    </span>
                  </label>
                </div>
                
                {user?.uid && favorites.length > 0 && (
                  <div className="filter-option">
                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes('favorites')}
                        onChange={() => toggleFilter('favorites')}
                      />
                      <span className="checkmark"></span>
                      <span className="option-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        Favoritas ({favorites.length})
                      </span>
                    </label>
                  </div>
                )}
                
                <div className="filter-option">
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes('shelters')}
                      onChange={() => toggleFilter('shelters')}
                    />
                    <span className="checkmark"></span>
                    <span className="option-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                      </svg>
                      De refugios
                    </span>
                  </label>
                </div>
                
                <div className="filter-option">
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes('dogs')}
                      onChange={() => toggleFilter('dogs')}
                    />
                    <span className="checkmark"></span>
                    <span className="option-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.5 2h-13C4.67 2 4 2.67 4 3.5v17c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5zM12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 14H8v-1.5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2V20z"/>
                      </svg>
                      Perros
                    </span>
                  </label>
                </div>
                
                <div className="filter-option">
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes('cats')}
                      onChange={() => toggleFilter('cats')}
                    />
                    <span className="checkmark"></span>
                    <span className="option-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Gatos
                    </span>
                  </label>
                </div>
                
                <div className="filter-option">
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes('others')}
                      onChange={() => toggleFilter('others')}
                    />
                    <span className="checkmark"></span>
                    <span className="option-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Otras mascotas
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="section-header">
          <div className="section-title-row">
            <h2 className="section-title">
              {selectedFilters.includes('all') || selectedFilters.length === 0 ? 'Mascotas disponibles' :
               selectedFilters.length === 1 ? 
                 (selectedFilters.includes('favorites') ? 'Tus favoritas' :
                  selectedFilters.includes('shelters') ? 'Mascotas de refugios' :
                  selectedFilters.includes('dogs') ? 'Perros disponibles' :
                  selectedFilters.includes('cats') ? 'Gatos disponibles' :
                  selectedFilters.includes('others') ? 'Otras mascotas' : 'Mascotas disponibles') :
               'Mascotas filtradas'}
            </h2>
            <span className="pets-count">{filteredPets.length} mascotas</span>
          </div>
        </div>

        <div className={`pets-grid ${userType === 'user' ? 'single-column' : userType === 'shelter' ? 'two-columns' : 'premium-layout'}`}>
          {filteredPets.map((pet, index) => {
            // Verificar si la mascota pertenece a un refugio premium
            let isPremiumPet = false;
            
            // Verificar si la mascota tiene shelterId
            if (pet.shelterId) {
              // Buscar el refugio en la lista cargada
              const shelterInfo = shelters.find(s => s.id === pet.shelterId);
              isPremiumPet = shelterInfo && shelterInfo.isPremium;
              
              // Debug: Mascota detectada como premium
              console.log(`✅ ${pet.name} es premium:`, isPremiumPet);
            }
            
            const isFeatured = isPremiumPet;
            
            return (
            <div
              key={index}
              className={`pet-card ${isFeatured ? 'featured' : ''}`}
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
            );
          })}
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
                  Refugios
                </h2>
                <span className="pets-count">{shelters.length} refugios</span>
              </div>
              <div className="shelters-controls">
                <button 
                  className="view-all-shelters"
                  onClick={() => navigate('/shelters')}
                >
                  Ver todos
                </button>
              </div>
            </div>

            <div className="shelters-grid">
              {shelters.slice(0, 4).map((shelter, index) => (
                <div
                  key={shelter.id || index}
                  className={`shelter-card ${shelter.isPremium ? 'premium' : ''}`}
                  onClick={() => navigate('/shelters')}
                >
                  <div className="shelter-image-wrapper">
                    <img 
                      src={shelter.image || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=225&fit=crop&crop=center'} 
                      alt={shelter.name} 
                      className="shelter-image" 
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=225&fit=crop&crop=center';
                      }}
                    />
                    <div className="shelter-image-overlay"></div>
                    {shelter.isPremium && (
                      <div className="premium-badge">Premium</div>
                    )}
                  </div>
                  <div className="shelter-content">
                    <h3 className="shelter-name">{shelter.name}</h3>
                    <div className="shelter-location">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      {shelter.location}
                    </div>
                    <div className="shelter-stats">
                      <div className="shelter-stat">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        {shelter.rating || 'N/A'}
                      </div>
                      <div className="shelter-stat">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M4.5 12.75a6 6 0 0 1 6-6h3a6 6 0 0 1 6 6v7.5a.75.75 0 0 1-.75.75h-13.5a.75.75 0 0 1-.75-.75v-7.5Z"/>
                        </svg>
                        {shelter.petsCount || 0} mascotas
                      </div>
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
