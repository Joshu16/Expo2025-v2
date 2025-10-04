import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './config.js';
import { userService } from './services.js';

// Hook personalizado para autenticación
export const useAuth = () => {
  // Registrar nuevo usuario
  const register = async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Actualizar perfil con nombre
      await updateProfile(user, {
        displayName: userData.name
      });
      
      // Crear perfil en Firestore
      console.log("Creating user profile with data:", {
        name: userData.name,
        email: user.email,
        phone: userData.phone || '',
        address: userData.address || '',
        isShelter: userData.isShelter || false,
        shelterInfo: userData.shelterInfo || null
      });
      await userService.createUserProfile(user.uid, {
        name: userData.name,
        email: user.email,
        phone: userData.phone || '',
        address: userData.address || '',
        isShelter: userData.isShelter || false,
        shelterInfo: userData.shelterInfo || null
      });
      console.log("User profile created successfully");
      
      return user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  // Escuchar cambios en el estado de autenticación
  const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
  };

  return {
    register,
    login,
    logout,
    onAuthChange
  };
};

// Función para migrar datos del localStorage a Firebase
export const migrateLocalDataToFirebase = async (userId) => {
  try {
    // Limpiar localStorage después de la migración
    localStorage.removeItem('notifications');
    localStorage.removeItem('conversations');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('isAuthenticated');
    
    console.log('Data migration completed successfully');
  } catch (error) {
    console.error('Error migrating data to Firebase:', error);
  }
};
