import React, { useEffect, useState } from "react";
import { useAuth } from "../firebase/auth.js";
import { userService } from "../firebase/services.js";
import "../styles/App.css";
import "../styles/Profile.css";
import NavBar from "../components/navbar.jsx";

function Profile({ user }) {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    isShelter: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          console.log("Loading profile for user:", user.uid);
          const userProfile = await userService.getUserProfile(user.uid);
          console.log("Profile loaded:", userProfile);
          if (userProfile) {
            setFormData({
              name: userProfile.name || "",
              email: userProfile.email || user.email || "",
              phone: userProfile.phone || "",
              address: userProfile.address || "",
              isShelter: userProfile.isShelter || false
            });
          } else {
            console.log("No profile found, using basic info");
            setFormData({
              name: user.displayName || "",
              email: user.email || "",
              phone: "",
              address: "",
              isShelter: false
            });
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await userService.updateUserProfile(user.uid, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        isShelter: formData.isShelter
      });
      alert("Perfil guardado correctamente");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("No se pudo guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("¿Seguro que deseas eliminar tu cuenta? Se borrarán todos los datos.")) {
      try {
        // Aquí podrías implementar la eliminación de la cuenta de Firebase
        // Por ahora solo cerramos sesión
        await logout();
        alert("Cuenta eliminada. Saliendo...");
      } catch (error) {
        console.error("Error deleting account", error);
        alert("No se pudo eliminar la cuenta");
      }
    }
  };

  const currentTheme =
    typeof document !== "undefined"
      ? document.body.getAttribute("data-theme") || "dark"
      : "dark";

  const toggleTheme = () => {
    const nextTheme =
      (typeof document !== "undefined"
        ? document.body.getAttribute("data-theme")
        : "dark") === "dark"
        ? "light"
        : "dark";
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-theme", nextTheme);
    }
    localStorage.setItem("theme", nextTheme);
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px'
        }}>
          Cargando perfil...
        </div>
        <NavBar />
      </div>
    );
  }

  // Debug: mostrar información del usuario
  console.log("Profile component - user:", user);
  console.log("Profile component - formData:", formData);

  return (
    <div className="container">
      {/* Header con título */}
      <header className="profile-header">
        <br />
        <h1 className="profile-title">Edit Profile</h1>
        <br />
      </header>

      <main className="profile-main">
        {/* Foto de perfil */}
        <div className="profile-picture-section">
          <div className="profile-picture">
            <img
              src={
                localStorage.getItem("userAvatar") ||
                "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face"
              }
              alt="Profile"
            />
            <label className="camera-overlay" htmlFor="avatar-input">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="#fff"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M9 4l2-2h2l2 2h3a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h3zm3 3a5 5 0 100 10 5 5 0 000-10z" />
              </svg>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      localStorage.setItem("userAvatar", reader.result);
                    } catch {}
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <input
                type="url"
                placeholder="https://avatar.jpg"
                className="form-input"
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    try {
                      localStorage.setItem("userAvatar", e.currentTarget.value);
                    } catch {}
                  }
                }}
              />
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
              onChange={e => handleInputChange("name", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              disabled
              style={{ opacity: 0.6 }}
            />
            <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>
              El email no se puede cambiar
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              type="tel"
              className="form-input"
              value={formData.phone}
              onChange={e => handleInputChange("phone", e.target.value)}
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dirección</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={e => handleInputChange("address", e.target.value)}
              placeholder="Calle, Ciudad, País"
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              id="isShelter"
              checked={formData.isShelter} 
              onChange={(e)=>handleInputChange('isShelter', e.target.checked)}
            />
            <label htmlFor="isShelter" className="form-label" style={{ margin: 0 }}>
              ¿Eres un refugio?
            </label>
          </div>

          <button 
            className="save-button" 
            onClick={handleSaveChanges}
            disabled={saving}
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>

          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>Tema</span>
            <button className="save-button" onClick={toggleTheme}>
              Cambiar a {currentTheme === "dark" ? "modo claro" : "modo oscuro"}
            </button>
          </div>

          <button
            style={{
              marginTop: 20,
              backgroundColor: "#ef4444",
              color: "white",
              padding: "10px 16px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              width: "100%"
            }}
            onClick={handleDeleteAccount}
          >
            Eliminar cuenta
          </button>
        </div>
      </main>

      <NavBar />
    </div>
  );
}

export default Profile;
