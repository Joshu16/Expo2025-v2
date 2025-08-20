import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/Upload.css";
import NavBar from "../components/navbar.jsx";

function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [petData, setPetData] = useState({
    name: "",
    location: "",
    breed: "",
    gender: "",
    age: "",
  });
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl("");
    }
  };

  const handleUrlChange = (value) => {
    setImageUrl(value);
    if (value && /^https?:\/\//i.test(value)) {
      setPreviewUrl(value);
    }
  };

  const handleInputChange = (field, value) => {
    setPetData(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePet = () => {
    if (!previewUrl && !imageUrl) {
      alert('Selecciona un archivo o pega un enlace de imagen');
      return;
    }
    const newPet = {
      ...petData,
      img: previewUrl || imageUrl,
    };
    try {
      const existing = JSON.parse(localStorage.getItem('pets') || '[]');
      const updated = [newPet, ...existing];
      localStorage.setItem('pets', JSON.stringify(updated));
      alert('Mascota guardada');
      navigate('/');
    } catch (e) {
      console.error('Error saving pet to localStorage', e);
      alert('No se pudo guardar la mascota');
    }
  };

  return (
    <div className="container">
      <header>
        <div className="header-content">
          <span className="bone-icon">🦴</span>
          <h2 className="logo-text">ANIMALS</h2>
        </div>
        <h1 className="upload-title">
          Da a conocer una mascota que quieres dar en adopción
        </h1>
        <p className="upload-description">
          Este es el primer paso para conseguirle un amigo a alguien más, sigue los procesos indicados!
        </p>
      </header>

      <main className="upload-main">
        <div className="upload-section">
          <div className="upload-box">
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="upload-label">
              <div className="upload-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 5a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2H4zm3 9l3-4 2 3 3-4 4 5H7z"/>
                </svg>
              </div>
              <span className="upload-text">
                {selectedFile ? selectedFile.name : "Seleccionar archivo"}
              </span>
            </label>
          </div>

          <div className="upload-separator">o pega un enlace</div>
          <div className="form-group" style={{ maxWidth: 360, margin: '0 auto' }}>
            <input type="url" placeholder="https://imagen.jpg" value={imageUrl} onChange={(e)=>handleUrlChange(e.target.value)} />
          </div>
        </div>

        {previewUrl && (
          <div className="upload-preview" style={{ marginTop: 16 }}>
            <img src={previewUrl} alt="preview" style={{ width: '100%', borderRadius: 12 }} />
          </div>
        )}

        <div className="upload-form" style={{ marginTop: 16 }}>
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" value={petData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Ubicación</label>
            <input type="text" value={petData.location} onChange={(e) => handleInputChange('location', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Raza</label>
            <input type="text" value={petData.breed} onChange={(e) => handleInputChange('breed', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Género</label>
            <input type="text" value={petData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Edad</label>
            <input type="text" value={petData.age} onChange={(e) => handleInputChange('age', e.target.value)} />
          </div>
          <button className="save-button" style={{ marginTop: 12 }} onClick={handleSavePet}>Guardar mascota</button>
        </div>
      </main>

      <NavBar />
    </div>
  );
}

export default Upload;
