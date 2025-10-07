import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import "../styles/App.css";
import "../styles/Auth.css";
import NavBar from "../components/navbar.jsx";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      setError("Error al iniciar sesión. Verifica tus credenciales.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <header className="auth-header">
        <h2 className="auth-logo">ANIMALS</h2>
        <h1 className="auth-title">¡Bienvenido de vuelta!</h1>
        <p className="auth-subtitle">Inicia sesión para continuar</p>
      </header>
      
      <div className="auth-form-container">
        <form onSubmit={handleLogin} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input 
              type="email" 
              className="form-input"
              value={email} 
              onChange={(e)=>setEmail(e.target.value)} 
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
              value={password} 
              onChange={(e)=>setPassword(e.target.value)} 
              placeholder="••••••••" 
              required
              disabled={loading}
            />
          </div>
          
          <button 
            className={`auth-button ${loading ? 'loading' : ''}`}
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
          
          <div className="auth-link">
            ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
          </div>
        </form>
      </div>
      
      <NavBar />
    </div>
  );
}

export default Login;


