import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import NavBar from "../components/navbar.jsx";

function Home() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [user, setUser] = useState({ name: "", country: "" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      let stored = JSON.parse(localStorage.getItem('pets') || '[]');
      if (!stored || stored.length === 0) {
        stored = [
          { name: 'Bobby', breed: 'Mestizo', gender: 'Macho', age: '2 años', location: 'San José', img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop' },
          { name: 'Luna', breed: 'Siames', gender: 'Hembra', age: '1 año', location: 'Cartago', img: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800&auto=format&fit=crop' },
          { name: 'Max', breed: 'Labrador', gender: 'Macho', age: '3 años', location: 'Alajuela', img: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=800&auto=format&fit=crop' },
        ];
        localStorage.setItem('pets', JSON.stringify(stored));
      }
      setPets(stored);
    } catch (e) {
      console.error('Error reading pets from localStorage', e);
    }
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('userProfile') || '{}');
      setUser({ name: stored.name || '', country: stored.country || '' });
    } catch (e) {
      console.error('Error reading userProfile from localStorage', e);
    }
  }, []);

  const filteredPets = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pets;
    return pets.filter(p =>
      [p.name, p.breed, p.gender, p.age, p.location]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(term))
    );
  }, [pets, search]);

  const handleSearchClick = () => {
    navigate('/categories');
  };

  return (
    <div className="container">
      <header>
        <h2 className="logo-text">ANIMALS</h2>
        <div className="home-greeting">
          <div className="greeting-text">
            <p className="greeting-subtitle">Buenos días,</p>
            <h1 className="greeting-title">{user.name || 'Amigo'}</h1>
            {user.country && (
              <span className="greeting-location">📍 {user.country}</span>
            )}
          </div>
        </div>
      </header>

      <main>
        <div className="search-pill">
          <span className="search-emoji" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10 4a6 6 0 104.472 10.06l4.234 4.234a1 1 0 001.414-1.415l-4.234-4.233A6 6 0 0010 4zm-4 6a4 4 0 118 0 4 4 0 01-8 0z"/></svg>
          </span>
          <input
            type="text"
            placeholder="Buscar mascotas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="cards">
          {filteredPets.map((pet, index) => (
            <div key={index} className="card">
              <img src={pet.img} alt={pet.name} />
              <div className="card-info">
                <h3>{pet.name}</h3>
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
