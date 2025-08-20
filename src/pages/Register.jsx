import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/App.css";
import NavBar from "../components/navbar.jsx";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", country: "" });

  const handleChange = (field, value) => setFormData(prev=>({ ...prev, [field]: value }));

  const handleRegister = (e) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(formData));
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div className="container">
      <header>
        <h2 className="logo-text">ANIMALS</h2>
        <h1>Registrarse</h1>
      </header>
      <main>
        <form onSubmit={handleRegister} className="upload-form" style={{ margin: '0 auto' }}>
          <div className="form-group"><label>Nombre</label><input type="text" value={formData.name} onChange={(e)=>handleChange('name', e.target.value)} /></div>
          <div className="form-group"><label>Correo</label><input type="email" value={formData.email} onChange={(e)=>handleChange('email', e.target.value)} /></div>
          <div className="form-group"><label>Contraseña</label><input type="password" value={formData.password} onChange={(e)=>handleChange('password', e.target.value)} /></div>
          <div className="form-group"><label>País/Región</label><input type="text" value={formData.country} onChange={(e)=>handleChange('country', e.target.value)} /></div>
          <button className="save-button" type="submit">Crear cuenta</button>
          <p style={{ marginTop: 12, textAlign: 'center' }}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </form>
      </main>
      <NavBar />
    </div>
  );
}

export default Register;


