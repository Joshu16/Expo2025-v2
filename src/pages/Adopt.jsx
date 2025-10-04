import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../styles/adopt.css";
import NavBar from "../components/navbar.jsx";
import { petService, favoriteService, adoptionRequestService, notificationService } from "../firebase/services.js";

function Adopt({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { petId } = useParams();
  const petFromState = location.state?.pet;
  
  const [pet, setPet] = useState(petFromState);
  const [loading, setLoading] = useState(!petFromState);
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    message: ""
  });
  const [completed, setCompleted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);

  useEffect(() => {
    if (petFromState) {
      // Si la mascota viene del estado, usarla directamente
      setPet(petFromState);
      setLoading(false);
      checkFavoriteStatus(petFromState.id);
      checkExistingRequest(petFromState.id);
      
      // Verificar si es la propia mascota del usuario
      if (user?.uid && petFromState.ownerId === user.uid) {
        navigate('/profile');
        return;
      }
    } else if (petId) {
      // Si solo tenemos el ID, cargar la mascota desde Firebase
      loadPetFromFirebase(petId);
    } else {
      // Si no hay mascota ni ID, redirigir al inicio
      navigate("/");
      return;
    }
  }, [petFromState, petId, navigate, user]);

  const loadPetFromFirebase = async (petId) => {
    try {
      console.log('Loading pet from Firebase with ID:', petId);
      setLoading(true);
      const petData = await petService.getPetById(petId);
      
      if (petData) {
        console.log('Pet loaded from Firebase:', petData);
        
        // Verificar si es la propia mascota del usuario
        if (user?.uid && petData.ownerId === user.uid) {
          navigate('/profile');
          return;
        }
        
        setPet(petData);
        checkFavoriteStatus(petData.id);
        checkExistingRequest(petData.id);
      } else {
        console.log('Pet not found in Firebase');
        navigate("/");
      }
    } catch (error) {
      console.error('Error loading pet from Firebase:', error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async (petId) => {
    if (!user?.uid) return;
    
    try {
      const favoriteStatus = await favoriteService.isFavorite(user.uid, petId);
      setIsFavorite(favoriteStatus);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const checkExistingRequest = async (petId) => {
    if (!user?.uid) return;
    
    try {
      const requests = await adoptionRequestService.getAdoptionRequests(user.uid);
      const existingRequest = requests.find(req => 
        req.petId === petId && 
        (req.status === 'pending' || req.status === 'approved')
      );
      setHasExistingRequest(!!existingRequest);
    } catch (error) {
      console.error('Error checking existing request:', error);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleFavorite = async () => {
    if (!user?.uid) {
      alert("Debes iniciar sesión para agregar favoritos");
      return;
    }

    try {
      if (isFavorite) {
        // Remover de favoritos
        await favoriteService.removeFavorite(user.uid, pet.id);
        setIsFavorite(false);
        console.log('Pet removed from favorites');
      } else {
        // Agregar a favoritos
        await favoriteService.addFavorite(user.uid, pet.id);
        setIsFavorite(true);
        console.log('Pet added to favorites');
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      alert("Error al actualizar favoritos. Inténtalo de nuevo.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) {
      alert("Debes iniciar sesión para solicitar adopción");
      return;
    }

    try {
      setSubmitting(true);
      console.log('=== STARTING ADOPTION REQUEST ===');
      console.log('Pet data:', pet);
      console.log('Form data:', formData);
      console.log('User data:', user);
      console.log('Pet ownerId:', pet.ownerId);
      
      // Crear solicitud de adopción en Firebase
      const adoptionData = {
        userId: user.uid,
        petId: pet.id,
        ownerId: pet.ownerId, // Agregar el ID del dueño de la mascota
        pet: pet, // Guardar también los datos de la mascota para referencia
        adopterName: formData.name,
        adopterEmail: formData.email,
        message: formData.message || ''
      };

      console.log('Creating adoption request with data:', adoptionData);
      const adoptionRequestId = await adoptionRequestService.createAdoptionRequest(adoptionData);
      console.log('✅ Adoption request created with ID:', adoptionRequestId);

      // Crear notificación para el solicitante
      await notificationService.createNotification({
        userId: user.uid,
        type: "adoption",
        title: "Solicitud de adopción enviada",
        message: `Tu solicitud para adoptar a ${pet.name} ha sido enviada y está siendo revisada.`,
        adoptionRequestId: adoptionRequestId
      });

      // Crear notificación para el dueño de la mascota
      if (pet.ownerId) {
        console.log('=== CREATING NOTIFICATION FOR OWNER ===');
        console.log('Pet owner ID:', pet.ownerId);
        console.log('Adopter ID:', user.uid);
        console.log('Pet name:', pet.name);
        console.log('Adopter name:', formData.name);
        
        try {
          const notificationId = await notificationService.createNotification({
            userId: pet.ownerId,
            type: "adoption_request",
            title: "Nueva solicitud de adopción",
            message: `${formData.name} quiere adoptar a ${pet.name}. Revisa la solicitud en tu perfil.`,
            adoptionRequestId: adoptionRequestId,
            petId: pet.id,
            adopterId: user.uid
          });
          console.log('✅ Notification created successfully for pet owner:', pet.ownerId);
          console.log('Notification ID:', notificationId);
        } catch (notificationError) {
          console.error('❌ Error creating notification for owner:', notificationError);
        }
      } else {
        console.log('❌ No ownerId found for pet:', pet);
      }

      console.log('Notifications created successfully');
      setCompleted(true);
    } catch (error) {
      console.error("Error creating adoption request:", error);
      alert("Error al procesar la solicitud. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <header>
          <h2 className="logo-text">Adoptar</h2>
        </header>
        <main>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando mascota...</p>
          </div>
        </main>
        <NavBar />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="container">
        <header>
          <h2 className="logo-text">Adoptar</h2>
        </header>
        <main>
          <div className="error-message">
            <p>No se encontró la mascota.</p>
            <button onClick={() => navigate("/")}>Volver al inicio</button>
          </div>
        </main>
        <NavBar />
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h2 className="logo-text">Adoptar</h2>
      </header>

      <main>
        <div className="adopt-container">
          <div className="pet-header">
            <div className="pet-image-container">
              <img src={pet.img} alt={pet.name} className="pet-img" />
              <button 
                className={`favorite-button ${isFavorite ? 'active' : ''}`}
                onClick={toggleFavorite}
                title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                disabled={!user?.uid}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
            <div className="pet-info">
              <h1>{pet.name}</h1>
              <p className="pet-details">
                {pet.breed} • {pet.gender} • {pet.age} • {pet.location}
              </p>
            </div>
          </div>

          {!completed ? (
            <>
              {hasExistingRequest && (
                <div className="existing-request-warning">
                  <p>⚠️ Ya tienes una solicitud pendiente para adoptar a {pet.name}</p>
                  <p>Puedes revisar el estado de tu solicitud en tu perfil.</p>
                </div>
              )}
              
              <form className="adopt-form" onSubmit={handleSubmit}>
                {!user?.uid && (
                  <div className="login-required">
                    <p>Debes iniciar sesión para solicitar adopción</p>
                    <button type="button" onClick={() => navigate("/login")}>
                      Iniciar sesión
                    </button>
                  </div>
                )}
              
              <label>Nombre</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
                disabled={!user?.uid}
              />
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Tu email"
                required
                disabled={!user?.uid}
              />
              <label>Mensaje (opcional)</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Cuéntanos por qué quieres adoptar esta mascota..."
                rows="3"
                disabled={!user?.uid}
              />
              <button 
                type="submit" 
                disabled={!user?.uid || submitting || hasExistingRequest}
              >
                {submitting ? 'Enviando...' : hasExistingRequest ? 'Solicitud ya enviada' : 'Adoptar'}
              </button>
            </form>
            </>
          ) : (
            <div className="adoption-completed">
              <div className="success-icon">✅</div>
              <h2>¡Solicitud enviada!</h2>
              <p>Tu solicitud de adopción ha sido enviada y está siendo revisada.</p>
              <div className="completion-actions">
                <button 
                  className="tracking-button"
                  onClick={() => navigate("/tracking")}
                >
                  Ver seguimiento
                </button>
                <button 
                  className="home-button"
                  onClick={() => navigate("/")}
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <NavBar />
    </div>
  );
}

export default Adopt;
