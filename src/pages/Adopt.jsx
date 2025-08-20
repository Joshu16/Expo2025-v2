import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/adopt.css";
import NavBar from "../components/navbar.jsx";

function Adopt() {
  const location = useLocation();
  const pet = location.state?.pet;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [completed, setCompleted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCompleted(true);
  };

  if (!pet) return <div className="container"><p>No se encontró la mascota.</p><NavBar /></div>;

  return (
    <div className="container">
      <header>
        <h2 className="logo-text">Adoptar</h2>
      </header>

      <main>
        <div className="adopt-container">
          <h1>{pet.name}</h1>
          <img src={pet.img} alt={pet.name} className="pet-img" />
          <p>
            {pet.breed} • {pet.gender} • {pet.age} • {pet.location}
          </p>

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
              <h2>¡Adopción completada!</h2>
              <button>Ver seguimiento</button>
            </div>
          )}
        </div>
      </main>

      <NavBar />
    </div>
  );
}

export default Adopt;
