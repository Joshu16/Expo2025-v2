import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/App.css";
import NavBar from "../components/navbar.jsx";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pets, setPets] = useState([]);
  const [user, setUser] = useState({ name: "", country: "" });
  const [search, setSearch] = useState("");

  // Si venimos de Categories, obtenemos la categoría seleccionada
  const categoryFilter = location.state?.category || "";

  useEffect(() => {
    try {
      let stored = JSON.parse(localStorage.getItem("pets") || "[]");
      if (!stored || stored.length === 0) {
        stored = [
          {
            name: "Bobby",
            breed: "Mestizo",
            gender: "Macho",
            age: "2 años",
            location: "San José",
            img: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop",
            type: "Perro"
          },
          {
            name: "Luna",
            breed: "Siames",
            gender: "Hembra",
            age: "1 año",
            location: "Cartago",
            img: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800&auto=format&fit=crop",
            type: "Gato"
          },
          {
            name: "Max",
            breed: "Labrador",
            gender: "Macho",
            age: "3 años",
            location: "Alajuela",
            img: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=800&auto=format&fit=crop",
            type: "Perro"
          },
          {
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
              <img src={pet.img} alt={pet.name} />
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
