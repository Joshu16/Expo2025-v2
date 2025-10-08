import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService, petService, shelterService } from "../firebase/services.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import "../styles/App.css";
import "../styles/Upload.css";
import NavBar from "../components/navbar.jsx";

function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    specialNeeds: "",
    shelterId: "", // ID del refugio si es una mascota de refugio
    shelterName: "" // Nombre del refugio
  });
  const [userProfile, setUserProfile] = useState({ name: "", address: "" });
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isShelterPet, setIsShelterPet] = useState(false);

  // Cargar perfil del usuario y refugios
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          // Cargar perfil del usuario
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

          // Cargar refugios del usuario
          const userShelters = await shelterService.getSheltersByOwner(user.uid);
          setShelters(userShelters);
          
          // Si el usuario tiene refugios, marcar automáticamente como mascota de refugio
          if (userShelters.length > 0) {
            setIsShelterPet(true);
            // Si solo tiene un refugio, seleccionarlo automáticamente
            if (userShelters.length === 1) {
              const shelter = userShelters[0];
              setPetData(prev => ({
                ...prev,
                shelterId: shelter.id,
                shelterName: shelter.name
              }));
            }
          }
        } catch (error) {
          console.error("Error loading data:", error);
        }
      }
    };

    loadData();
  }, [user]);

  const handleUrlChange = (value) => {
    setImageUrl(value);
  };

  const handleInputChange = (field, value) => {
    setPetData(prev => ({ ...prev, [field]: value }));
  };

  const handleShelterToggle = (checked) => {
    setIsShelterPet(checked);
    if (!checked) {
      // Si se desmarca, limpiar datos del refugio
      setPetData(prev => ({
        ...prev,
        shelterId: "",
        shelterName: ""
      }));
    }
  };

  const handleShelterSelect = (shelterId) => {
    const selectedShelter = shelters.find(s => s.id === shelterId);
    setPetData(prev => ({
      ...prev,
      shelterId: shelterId,
      shelterName: selectedShelter ? selectedShelter.name : ""
    }));
  };

  const handleSavePet = async () => {
    // Validaciones mejoradas
    if (!petData.name.trim()) {
      alert('❌ El nombre de la mascota es obligatorio');
      return;
    }
    if (!petData.type) {
      alert('❌ Debes seleccionar el tipo de mascota (Perro, Gato, Conejo o Hamster)');
      return;
    }
    if (!petData.location.trim()) {
      alert('❌ La ubicación es obligatoria');
      return;
    }
    if (!imageUrl.trim()) {
      alert('❌ Debes proporcionar un enlace de imagen válido');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting pet creation process...');
      
      const newPet = {
        ...petData,
        img: imageUrl.trim(),
        status: "available",
        ownerId: user.uid,
        ownerName: userProfile.name || user.displayName || 'Usuario'
      };

      // Si es una mascota de refugio, agregar datos del refugio
      if (isShelterPet && petData.shelterId) {
        newPet.shelterId = petData.shelterId;
        newPet.shelterName = petData.shelterName;
      }

      console.log('Pet data prepared:', newPet);
      console.log('Image URL:', imageUrl.trim());

      // Crear la mascota
      const petId = await petService.createPet(newPet);
      
      console.log('Pet created successfully with ID:', petId);
      alert('✅ Mascota subida correctamente');
      navigate('/');
    } catch (error) {
      console.error('Error saving pet:', error);
      alert('❌ Error al subir la mascota: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1 className="upload-title">
          <span className="upload-icon">🐾</span>
          Subir Mascota
        </h1>
        <p className="upload-subtitle">
          Comparte los detalles de tu mascota para encontrarle un hogar
        </p>
      </div>

      <div className="upload-content">
        {/* Image URL Section */}
        <div className="image-upload-section">
          <div className="url-input-section">
            <div className="input-with-icon">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.42l-.47.48a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24z"/>
              </svg>
              <input 
                type="url" 
                placeholder="Pega un enlace de imagen (URL)" 
                value={imageUrl} 
                onChange={(e) => handleUrlChange(e.target.value)}
                className="url-input"
                required
              />
            </div>
            
            <div className="quick-actions">
              <button 
                type="button"
                onClick={() => setImageUrl('https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=center')}
                className="quick-btn"
              >
                🐕 Perro
              </button>
              <button 
                type="button"
                onClick={() => setImageUrl('https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop&crop=center')}
                className="quick-btn"
              >
                🐱 Gato
              </button>
              <button 
                type="button"
                onClick={() => setImageUrl('https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop&crop=center')}
                className="quick-btn"
              >
                🐰 Conejo
              </button>
              <button 
                type="button"
                onClick={() => setImageUrl('https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=400&fit=crop&crop=center')}
                className="quick-btn"
              >
                🐹 Hamster
              </button>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="form-section">
          <div className="form-grid">
            <div className="form-field">
              <label className="field-label">Nombre *</label>
              <input 
                type="text" 
                value={petData.name} 
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nombre de la mascota"
                className="field-input"
                required
              />
            </div>

            <div className="form-field">
              <label className="field-label">Tipo *</label>
              <select 
                value={petData.type} 
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="field-select"
                required
              >
                <option value="">Selecciona tipo</option>
                <option value="Perro">🐕 Perro</option>
                <option value="Gato">🐱 Gato</option>
                <option value="Conejo">🐰 Conejo</option>
                <option value="Hamster">🐹 Hamster</option>
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">Ubicación *</label>
              <input 
                type="text" 
                value={petData.location} 
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ciudad, Estado"
                className="field-input"
                required
              />
            </div>

            {/* Sección de refugio */}
            {shelters.length > 0 && (
              <div className="form-field full-width">
                <div className="shelter-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={isShelterPet}
                      onChange={(e) => handleShelterToggle(e.target.checked)}
                      className="toggle-checkbox"
                    />
                    <span className="toggle-text">🏠 Esta mascota pertenece a uno de mis refugios</span>
                  </label>
                </div>
                
                {isShelterPet && (
                  <div className="shelter-select">
                    <label className="field-label">Seleccionar Refugio *</label>
                    <select
                      value={petData.shelterId}
                      onChange={(e) => handleShelterSelect(e.target.value)}
                      className="field-select"
                      required
                    >
                      <option value="">Selecciona un refugio</option>
                      {shelters.map(shelter => (
                        <option key={shelter.id} value={shelter.id}>
                          {shelter.name} - {shelter.location}
                        </option>
                      ))}
                    </select>
                    {petData.shelterName && (
                      <p className="shelter-info">
                        ✅ Mascota será asociada a: <strong>{petData.shelterName}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="form-field">
              <label className="field-label">Raza</label>
              <input 
                type="text" 
                value={petData.breed} 
                onChange={(e) => handleInputChange('breed', e.target.value)}
                placeholder="Raza o mezcla"
                className="field-input"
              />
            </div>

            <div className="form-field">
              <label className="field-label">Género</label>
              <select 
                value={petData.gender} 
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="field-select"
              >
                <option value="">Selecciona</option>
                <option value="Macho">♂️ Macho</option>
                <option value="Hembra">♀️ Hembra</option>
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">Edad</label>
              <input 
                type="text" 
                value={petData.age} 
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Ej: 2 años"
                className="field-input"
              />
            </div>

            <div className="form-field">
              <label className="field-label">Tamaño</label>
              <select 
                value={petData.size} 
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="field-select"
              >
                <option value="">Selecciona</option>
                <option value="Pequeño">S Pequeño</option>
                <option value="Mediano">M Mediano</option>
                <option value="Grande">L Grande</option>
              </select>
            </div>
          </div>

          <div className="form-field full-width">
            <label className="field-label">Descripción</label>
            <textarea 
              value={petData.description} 
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Cuéntanos sobre su personalidad y comportamiento..."
              className="field-textarea"
              rows="3"
            />
          </div>

          <div className="form-field full-width">
            <label className="field-label">Necesidades especiales</label>
            <textarea 
              value={petData.specialNeeds} 
              onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
              placeholder="Medicamentos, cuidados especiales, etc."
              className="field-textarea"
              rows="2"
            />
          </div>

          <div className="checkbox-section">
            <label className="checkbox-item">
              <input 
                type="checkbox" 
                checked={petData.vaccinated} 
                onChange={(e) => handleInputChange('vaccinated', e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">Está vacunado</span>
            </label>

            <label className="checkbox-item">
              <input 
                type="checkbox" 
                checked={petData.sterilized} 
                onChange={(e) => handleInputChange('sterilized', e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">Está esterilizado</span>
            </label>
          </div>

          <button 
            className="submit-button" 
            onClick={handleSavePet}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Guardando...
              </>
            ) : (
              <>
                <span>💾</span>
                Guardar mascota
              </>
            )}
          </button>
        </div>
      </div>

      <NavBar />
    </div>
  );
}

export default Upload;
