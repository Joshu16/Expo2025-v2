import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/App.css";
import NavBar from "../components/navbar.jsx";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (stored?.email) setEmail(stored.email);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const stored = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (stored?.email === email) {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } else {
      alert('Usuario no encontrado. Regístrate.');
      navigate('/register');
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
          <div className="form-group">
            <label>Correo</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="********" />
          </div>
          <button className="save-button" type="submit">Entrar</button>
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


