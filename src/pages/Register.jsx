import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import "../styles/App.css";
import "../styles/Auth.css";
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
    <div className="auth-container">
      <header className="auth-header">
        <h2 className="auth-logo">ANIMALS</h2>
        <h1 className="auth-title">¡Únete a nosotros!</h1>
        <p className="auth-subtitle">Crea tu cuenta para comenzar</p>
      </header>
      
      <div className="auth-form-container">
        <form onSubmit={handleRegister} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Nombre completo</label>
            <input 
              type="text" 
              className="form-input"
              value={formData.name} 
              onChange={(e)=>handleChange('name', e.target.value)} 
              placeholder="Tu nombre completo"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input 
              type="email" 
              className="form-input"
              value={formData.email} 
              onChange={(e)=>handleChange('email', e.target.value)} 
              placeholder="tu@correo.com"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              className="form-input"
              value={formData.password} 
              onChange={(e)=>handleChange('password', e.target.value)} 
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Confirmar contraseña</label>
            <input 
              type="password" 
              className="form-input"
              value={formData.confirmPassword} 
              onChange={(e)=>handleChange('confirmPassword', e.target.value)} 
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Teléfono (opcional)</label>
            <input 
              type="tel" 
              className="form-input"
              value={formData.phone} 
              onChange={(e)=>handleChange('phone', e.target.value)} 
              placeholder="+506 0000-0000"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Dirección (opcional)</label>
            <input 
              type="text" 
              className="form-input"
              value={formData.address} 
              onChange={(e)=>handleChange('address', e.target.value)} 
              placeholder="Tu dirección"
              disabled={loading}
            />
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              className="checkbox-input"
              id="isShelter"
              checked={formData.isShelter} 
              onChange={(e)=>handleChange('isShelter', e.target.checked)}
              disabled={loading}
            />
            <label className="checkbox-label" htmlFor="isShelter">
              ¿Eres un refugio de animales?
            </label>
          </div>
          
          <button 
            className={`auth-button ${loading ? 'loading' : ''}`}
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
          
          <div className="auth-link">
            ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
          </div>
        </form>
      </div>
      
      <NavBar />
    </div>
  );
}

export default Register;


