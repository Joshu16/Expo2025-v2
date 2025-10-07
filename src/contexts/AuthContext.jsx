import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile
} from 'firebase/auth';
import { userService } from '../firebase/services.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: Setting up auth listener");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("AuthProvider: Auth state changed:", user);
      if (user) {
        console.log("AuthProvider: User authenticated:", {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        });
      } else {
        console.log("AuthProvider: No user authenticated");
      }
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error("AuthProvider: Auth state error:", error);
      setLoading(false);
    });

    return () => {
      console.log("AuthProvider: Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

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

  const value = {
    user,
    loading,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
