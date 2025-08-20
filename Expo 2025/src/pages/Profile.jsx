import React, { useEffect, useState } from "react";
import "../styles/App.css";
import "../styles/Profile.css";
import NavBar from "../components/navbar.jsx";

function Profile() {
  const [formData, setFormData] = useState({
    name: "Melissa Peters",
    email: "melpeters@gmail.com",
    password: "************",
    country: "Nigeria"
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('userProfile');
      if (stored) {
        const parsed = JSON.parse(stored);
        setFormData(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error('Error reading userProfile from localStorage', e);
    }
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = () => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(formData));
      console.log('Perfil guardado');
      alert('Perfil guardado');
    } catch (e) {
      console.error('Error saving userProfile to localStorage', e);
      alert('No se pudo guardar el perfil');
    }
  };

  const currentTheme = typeof document !== 'undefined' ? document.body.getAttribute('data-theme') || 'dark' : 'dark';

  const toggleTheme = () => {
    const nextTheme = (typeof document !== 'undefined' ? document.body.getAttribute('data-theme') : 'dark') === 'dark' ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', nextTheme);
    }
    localStorage.setItem('theme', nextTheme);
  };

  return (
    <div className="container">
      {/* Top bar con tiempo y batería */}
      <div className="top-bar">
        <span className="time">9:41</span>
        <div className="status-icons">
          <span className="signal">📶</span>
          <span className="battery">🔋</span>
        </div>
      </div>

      {/* Header con flecha de regreso y título */}
      <header className="profile-header">
        <button className="back-button">←</button>
        <h1 className="profile-title">Edit Profile</h1>
      </header>

      <main className="profile-main">
        {/* Foto de perfil */}
        <div className="profile-picture-section">
          <div className="profile-picture">
            <img 
              src={localStorage.getItem('userAvatar') || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face"}
              alt="Profile" 
            />
            <label className="camera-overlay" htmlFor="avatar-input">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 4l2-2h2l2 2h3a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h3zm3 3a5 5 0 100 10 5 5 0 000-10z"/></svg>
              <input id="avatar-input" type="file" accept="image/*" style={{display:'none'}} onChange={(e)=>{
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try { localStorage.setItem('userAvatar', reader.result); } catch {}
                };
                reader.readAsDataURL(file);
              }} />
            </label>
            <div style={{ textAlign:'center', marginTop: 8 }}>
              <input type="url" placeholder="https://avatar.jpg" className="form-input" onKeyDown={(e)=>{
                if (e.key === 'Enter') {
                  try { localStorage.setItem('userAvatar', e.currentTarget.value); } catch {}
                }
              }} />
            </div>
          </div>
        </div>

        {/* Campos de formulario */}
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Country/Region</label>
            <div className="select-wrapper">
              <input
                type="text"
                className="form-input"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                readOnly
              />
              <span className="dropdown-icon">⌄</span>
            </div>
          </div>

          <button className="save-button" onClick={handleSaveChanges}>
            Save changes
          </button>

          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Tema</span>
            <button className="save-button" onClick={toggleTheme}>
              Cambiar a {currentTheme === 'dark' ? 'modo claro' : 'modo oscuro'}
            </button>
          </div>
        </div>
      </main>

      <NavBar />
    </div>
  );
}

export default Profile;
