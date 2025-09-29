import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/App.css";
import NavBar from "../components/navbar.jsx";
import { initializeSampleData } from "../utils/sampleData.js";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pets, setPets] = useState([]);
  const [user, setUser] = useState({ name: "", country: "" });
  const [search, setSearch] = useState("");

  // Si venimos de Categories, obtenemos la categoría seleccionada
  const categoryFilter = location.state?.category || "";

  useEffect(() => {
    // Inicializar datos de ejemplo
    initializeSampleData();
    
    try {
      let stored = JSON.parse(localStorage.getItem("pets") || "[]");
      if (!stored || stored.length === 0) {
        stored = [
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
          },
          {
            id: 3,
            name: "Max",
            breed: "Labrador",
            gender: "Macho",
            age: "3 años",
            location: "Alajuela",
            img: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=800&auto=format&fit=crop",
            type: "Perro"
          },
          {
            id: 4,
            name: "Spike",
            breed: "Erizo Africano",
            gender: "Macho",
            age: "1 año",
            location: "Heredia",
            img: "https://www.abene.com.mx/cdn/shop/articles/shutterstock_151119362.jpg?v=1620270612",
            type: "Erizo"
          }
        ];
        localStorage.setItem("pets", JSON.stringify(stored));
      }
      setPets(stored);
    } catch (e) {
      console.error("Error reading pets from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("userProfile") || "{}");
      setUser({ name: stored.name || "", country: stored.country || "" });
    } catch (e) {
      console.error("Error reading userProfile from localStorage", e);
    }
  }, []);

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

  return (
    <div className="container" style={{ paddingBottom: '90px' }}>
      <header>
        <h2 className="logo-text">ANIMALS</h2>
        <div className="home-greeting">
          <div className="greeting-text">
            <p className="greeting-subtitle">Buenos días,</p>
            <h1 className="greeting-title">{user.name || "Amigo"}</h1>
            {user.country && <span className="greeting-location">📍 {user.country}</span>}
          </div>
        </div>
      </header>

      <main>
        <div className="search-pill">
          <span className="search-emoji">🔍</span>
          <input
            type="text"
            placeholder="Buscar mascotas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="cards">
          {filteredPets.map((pet, index) => (
            <div
              key={index}
              className="card"
              onClick={() => handleCardClick(pet)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-image-container">
                <img src={pet.img} alt={pet.name} />
                <button 
                  className={`favorite-button ${isFavorite(pet) ? 'active' : ''}`}
                  onClick={(e) => toggleFavorite(pet, e)}
                  title={isFavorite(pet) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>
              <div className="card-info">
                <h3>{pet.name} ({pet.type})</h3>
                <p>{pet.breed} • {pet.gender} • {pet.age}</p>
                <span>{pet.location}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="search-button">
        <button onClick={handleSearchClick}>¿Qué amiguito buscas?</button>
      </div>

      <NavBar />
    </div>
  );
}

export default Home;
