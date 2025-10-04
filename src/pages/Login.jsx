import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../firebase/auth.js";
import "../styles/App.css";
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
    <div className="container">
      <header>
        <h2 className="logo-text">ANIMALS</h2>
        <h1>Iniciar sesión</h1>
      </header>
      <main>
        <form onSubmit={handleLogin} className="upload-form" style={{ margin: '0 auto' }}>
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
            <label>Correo</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e)=>setEmail(e.target.value)} 
              placeholder="correo@ejemplo.com" 
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e)=>setPassword(e.target.value)} 
              placeholder="********" 
              required
              disabled={loading}
            />
          </div>
          <button 
            className="save-button" 
            type="submit" 
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
          <p style={{ marginTop: 12, textAlign: 'center' }}>
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </form>
      </main>
      <NavBar />
    </div>
  );
}

export default Login;


