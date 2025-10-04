import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../firebase/auth.js";
import "../styles/App.css";
import NavBar from "../components/navbar.jsx";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
    phone: "",
    address: "",
    isShelter: false
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => setFormData(prev=>({ ...prev, [field]: value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      await register(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        isShelter: formData.isShelter
      });
      navigate('/');
    } catch (error) {
      setError("Error al crear la cuenta. Intenta de nuevo.");
      console.error("Register error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h2 className="logo-text">ANIMALS</h2>
        <h1>Registrarse</h1>
      </header>
      <main>
        <form onSubmit={handleRegister} className="upload-form" style={{ margin: '0 auto' }}>
          {error && (
            <div style={{ 
              color: 'red', 
              textAlign: 'center', 
              marginBottom: '16px',
              padding: '8px',
              backgroundColor: '#ffe6e6',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label>Nombre</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e)=>handleChange('name', e.target.value)} 
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Correo</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e)=>handleChange('email', e.target.value)} 
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={(e)=>handleChange('password', e.target.value)} 
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input 
              type="password" 
              value={formData.confirmPassword} 
              onChange={(e)=>handleChange('confirmPassword', e.target.value)} 
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input 
              type="tel" 
              value={formData.phone} 
              onChange={(e)=>handleChange('phone', e.target.value)} 
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input 
              type="text" 
              value={formData.address} 
              onChange={(e)=>handleChange('address', e.target.value)} 
              disabled={loading}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              id="isShelter"
              checked={formData.isShelter} 
              onChange={(e)=>handleChange('isShelter', e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="isShelter">¿Eres un refugio?</label>
          </div>
          <button 
            className="save-button" 
            type="submit" 
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
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


