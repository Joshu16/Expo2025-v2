import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService, petService } from "../firebase/services.js";
import "../styles/App.css";
import "../styles/Upload.css";
import NavBar from "../components/navbar.jsx";

function Upload({ user }) {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [petData, setPetData] = useState({
    name: "",
    location: "",
    breed: "",
    gender: "",
    age: "",
    type: "", // Tipo de mascota: Perro, Gato, Conejo, etc.
    description: "",
    size: "", // Tamaño: Pequeño, Mediano, Grande
    vaccinated: false,
    sterilized: false,
    specialNeeds: ""
  });
  const [userProfile, setUserProfile] = useState({ name: "", address: "" });
  const [loading, setLoading] = useState(false);

  // Cargar perfil del usuario para auto-completar
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const profile = await userService.getUserProfile(user.uid);
          if (profile) {
            setUserProfile({
              name: profile.name || "",
              address: profile.address || ""
            });
            // Auto-completar la ubicación con la dirección del usuario
            setPetData(prev => ({
              ...prev,
              location: profile.address || ""
            }));
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      }
    };

    loadUserProfile();
  }, [user]);

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

  const handleSavePet = async () => {
    // Validaciones mejoradas
    if (!petData.name.trim()) {
      alert('El nombre de la mascota es obligatorio');
      return;
    }
    if (!petData.type) {
      alert('Debes seleccionar el tipo de mascota');
      return;
    }
    if (!petData.location.trim()) {
      alert('La ubicación es obligatoria');
      return;
    }
    if (!selectedFile && !imageUrl.trim()) {
      alert('Debes subir una imagen o proporcionar un enlace');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting pet creation process...');
      
      const newPet = {
        ...petData,
        img: imageUrl.trim() || '', // Usar URL si está disponible
        status: "available",
        ownerId: user.uid,
        ownerName: userProfile.name || user.displayName || 'Usuario'
      };

      console.log('Pet data prepared:', newPet);
      console.log('Selected file:', selectedFile ? 'Yes' : 'No');
      console.log('Image URL:', imageUrl.trim() || 'None');

      // Crear la mascota (el servicio manejará la imagen)
      const petId = await petService.createPet(newPet, selectedFile);
      
      console.log('Pet created successfully with ID:', petId);
      alert('Mascota subida correctamente');
      navigate('/');
    } catch (error) {
      console.error('Error saving pet:', error);
      alert('Error al subir la mascota: ' + error.message);
    } finally {
      setLoading(false);
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

          <div className="upload-separator">o pega un enlace de imagen</div>
          <div className="form-group" style={{ maxWidth: 500, margin: '0 auto' }}>
            <input 
              type="url" 
              placeholder="https://ejemplo.com/imagen.jpg" 
              value={imageUrl} 
              onChange={(e)=>handleUrlChange(e.target.value)}
              style={{ textAlign: 'center' }}
            />
            <small style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
              💡 Recomendado: Usa enlaces de imágenes de Unsplash, Imgur, o Google Drive
            </small>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                type="button"
                onClick={() => setImageUrl('https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=400&auto=format&fit=crop')}
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.25rem 0.5rem', 
                  background: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                🐕 Perro
              </button>
              <button 
                type="button"
                onClick={() => setImageUrl('https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=400&auto=format&fit=crop')}
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.25rem 0.5rem', 
                  background: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                🐱 Gato
              </button>
              <button 
                type="button"
                onClick={() => setImageUrl('https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=400&auto=format&fit=crop')}
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.25rem 0.5rem', 
                  background: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                🐰 Conejo
              </button>
            </div>
          </div>
        </div>

        {previewUrl && (
          <div className="upload-preview" style={{ marginTop: 16 }}>
            <img src={previewUrl} alt="preview" style={{ width: '100%', borderRadius: 12 }} />
          </div>
        )}

        <div className="upload-form" style={{ marginTop: 16 }}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input 
                type="text" 
                value={petData.name} 
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nombre de la mascota"
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo de mascota *</label>
              <select 
                value={petData.type} 
                onChange={(e) => handleInputChange('type', e.target.value)}
                required
              >
                <option value="">Selecciona un tipo</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Conejo">Conejo</option>
                <option value="Erizo">Erizo</option>
                <option value="Hamster">Hamster</option>
                <option value="Loro">Loro</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ubicación *</label>
              <input 
                type="text" 
                value={petData.location} 
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ciudad, Estado"
                required
              />
            </div>

            <div className="form-group">
              <label>Raza</label>
              <input 
                type="text" 
                value={petData.breed} 
                onChange={(e) => handleInputChange('breed', e.target.value)}
                placeholder="Raza o mezcla"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Género</label>
              <select value={petData.gender} onChange={(e) => handleInputChange('gender', e.target.value)}>
                <option value="">Selecciona</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>

            <div className="form-group">
              <label>Edad</label>
              <input 
                type="text" 
                value={petData.age} 
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Ej: 2 años, 6 meses"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tamaño</label>
            <select value={petData.size} onChange={(e) => handleInputChange('size', e.target.value)}>
              <option value="">Selecciona</option>
              <option value="Pequeño">Pequeño</option>
              <option value="Mediano">Mediano</option>
              <option value="Grande">Grande</option>
            </select>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea 
              value={petData.description} 
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Cuéntanos sobre la personalidad, comportamiento y características especiales de la mascota..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Necesidades especiales</label>
            <textarea 
              value={petData.specialNeeds} 
              onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
              placeholder="Menciona si tiene alguna condición especial, medicamentos, cuidados especiales, etc."
              rows="2"
            />
          </div>


          <div className="form-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={petData.vaccinated} 
                onChange={(e) => handleInputChange('vaccinated', e.target.checked)}
              />
              <span>Está vacunado</span>
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={petData.sterilized} 
                onChange={(e) => handleInputChange('sterilized', e.target.checked)}
              />
              <span>Está esterilizado/castrado</span>
            </label>
          </div>

          <button 
            className="save-button" 
            style={{ marginTop: 12, opacity: loading ? 0.7 : 1 }} 
            onClick={handleSavePet}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar mascota'}
          </button>
        </div>
      </main>

      <NavBar />
    </div>
  );
}

export default Upload;
