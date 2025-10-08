import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { userService } from "../firebase/services.js";
import "../styles/App.css";
import "../styles/Settings.css";
import NavBar from "../components/navbar.jsx";

function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState({ name: "", address: "", phone: "", email: "" });
  const [formData, setFormData] = useState({ name: "", address: "", phone: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const profile = await userService.getUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
        setFormData(profile);
      } else {
        const basicProfile = {
          name: user.displayName || "Usuario",
          address: "",
          phone: "",
          email: user.email || ""
        };
        setUserProfile(basicProfile);
        setFormData(basicProfile);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userService.updateUserProfile(user.uid, formData);
      setUserProfile(formData);
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacyChange = (setting, value) => {
    // Aquí puedes implementar la lógica para guardar configuraciones de privacidad
    console.log(`Privacy setting ${setting} changed to:`, value);
    // Por ahora solo mostramos un mensaje
    alert(`Configuración de privacidad actualizada: ${setting} = ${value}`);
  };

  const handleNotificationChange = (setting, value) => {
    // Aquí puedes implementar la lógica para guardar configuraciones de notificaciones
    console.log(`Notification setting ${setting} changed to:`, value);
    // Por ahora solo mostramos un mensaje
    alert(`Configuración de notificaciones actualizada: ${setting} = ${value}`);
  };

  const handleChangePassword = () => {
    alert('Función de cambio de contraseña en desarrollo');
  };

  const handleExportData = () => {
    alert('Función de exportación de datos en desarrollo');
  };

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm(
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y eliminará todos tus datos permanentemente.'
    );
    if (confirmDelete) {
      alert('Función de eliminación de cuenta en desarrollo');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Error al cerrar sesión');
    }
  };

  const handleReset = () => {
    setFormData(userProfile);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando configuración...</p>
        </div>
        <NavBar />
      </div>
    );
  }

  return (
    <div className="container">
      <header className="settings-header">
        <button 
          className="back-button"
          onClick={() => navigate('/profile')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Volver
        </button>
        <h1 className="settings-title">Configuración</h1>
        <div className="settings-actions">
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </header>

      <main className="settings-main">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button 
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              Perfil
            </button>
            <button 
              className={`nav-item ${activeSection === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveSection('privacy')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              Privacidad
            </button>
            <button 
              className={`nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveSection('notifications')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
              </svg>
              Notificaciones
            </button>
            <button 
              className={`nav-item ${activeSection === 'account' ? 'active' : ''}`}
              onClick={() => setActiveSection('account')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Cuenta
            </button>
          </nav>
        </div>

        <div className="settings-content">
          {activeSection === 'profile' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Información Personal</h2>
                <p>Actualiza tu información personal y de contacto</p>
              </div>
              
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Tu nombre completo"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Tu dirección"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Tu número de teléfono"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Tu email"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Privacidad y Seguridad</h2>
                <p>Controla quién puede ver tu información</p>
              </div>
              
              <div className="privacy-options">
                <div className="privacy-item">
                  <div className="privacy-info">
                    <h3>Perfil Público</h3>
                    <p>Permite que otros usuarios vean tu información básica</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      onChange={(e) => handlePrivacyChange('publicProfile', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="privacy-item">
                  <div className="privacy-info">
                    <h3>Mostrar Contacto</h3>
                    <p>Permite que otros usuarios vean tu información de contacto</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      onChange={(e) => handlePrivacyChange('showContact', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="privacy-item">
                  <div className="privacy-info">
                    <h3>Notificaciones por Email</h3>
                    <p>Recibe notificaciones importantes por correo electrónico</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      onChange={(e) => handlePrivacyChange('emailNotifications', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Notificaciones</h2>
                <p>Configura cómo y cuándo recibir notificaciones</p>
              </div>
              
              <div className="notification-options">
                <div className="notification-item">
                  <div className="notification-info">
                    <h3>Nuevas Solicitudes</h3>
                    <p>Recibe notificaciones cuando alguien solicite adoptar tus mascotas</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      onChange={(e) => handleNotificationChange('newRequests', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h3>Mensajes</h3>
                    <p>Recibe notificaciones de nuevos mensajes en el chat</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      onChange={(e) => handleNotificationChange('messages', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h3>Actualizaciones de Estado</h3>
                    <p>Recibe notificaciones sobre cambios en el estado de tus solicitudes</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      onChange={(e) => handleNotificationChange('statusUpdates', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h3>Recordatorios</h3>
                    <p>Recibe recordatorios sobre citas y eventos importantes</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      onChange={(e) => handleNotificationChange('reminders', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'account' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Cuenta</h2>
                <p>Gestiona tu cuenta y datos</p>
              </div>
              
              <div className="account-actions">
                <div className="account-item">
                  <div className="account-info">
                    <h3>Cambiar Contraseña</h3>
                    <p>Actualiza tu contraseña para mayor seguridad</p>
                  </div>
                  <button className="action-button secondary" onClick={handleChangePassword}>
                    Cambiar
                  </button>
                </div>

                <div className="account-item">
                  <div className="account-info">
                    <h3>Exportar Datos</h3>
                    <p>Descarga una copia de todos tus datos</p>
                  </div>
                  <button className="action-button secondary" onClick={handleExportData}>
                    Exportar
                  </button>
                </div>

                <div className="account-item danger">
                  <div className="account-info">
                    <h3>Eliminar Cuenta</h3>
                    <p>Elimina permanentemente tu cuenta y todos los datos asociados</p>
                  </div>
                  <button className="action-button danger" onClick={handleDeleteAccount}>
                    Eliminar
                  </button>
                </div>

                <div className="account-item">
                  <div className="account-info">
                    <h3>Cerrar Sesión</h3>
                    <p>Cierra sesión en todos los dispositivos</p>
                  </div>
                  <button className="action-button primary" onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <NavBar />
    </div>
  );
}

export default Settings;
