import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config.js";
import "../styles/App.css";
import Home from "./Home.jsx";
import Categories from "./Categories.jsx";
import Upload from "./Upload.jsx";
import Profile from "./Profile.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Adopt from "./Adopt.jsx";
import Tracking from "./Tracking.jsx";
import AdoptionDetails from "./AdoptionDetails.jsx";
import Chat from "./Chat.jsx";
import Favorites from "./Favorites.jsx";
import Shelters from "./Shelters.jsx";
import ShelterRegister from "./ShelterRegister.jsx";
import Notifications from "./Notifications.jsx";

// RUTA PROTEGIDA (definir antes de usar)
const ProtectedRoute = ({ element, user }) => {
  if (user) return element;
  return <Navigate to="/login" replace />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("App useEffect - setting up auth listener");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user);
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Cargando...
      </div>
    );
  }

  console.log("App render - user:", user);
  console.log("App render - loading:", loading);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute element={<Home user={user} />} user={user} />} />
      <Route path="/categories" element={<ProtectedRoute element={<Categories />} user={user} />} />
      <Route path="/upload" element={<ProtectedRoute element={<Upload user={user} />} user={user} />} />
      <Route path="/profile" element={<ProtectedRoute element={<Profile user={user} />} user={user} />} />
      <Route path="/adopt" element={<ProtectedRoute element={<Adopt />} user={user} />} />
      <Route path="/tracking" element={<ProtectedRoute element={<Tracking />} user={user} />} />
      <Route path="/adoption-details" element={<ProtectedRoute element={<AdoptionDetails />} user={user} />} />
      <Route path="/chat" element={<ProtectedRoute element={<Chat />} user={user} />} />
      <Route path="/favorites" element={<ProtectedRoute element={<Favorites />} user={user} />} />
      <Route path="/shelters" element={<ProtectedRoute element={<Shelters />} user={user} />} />
      <Route path="/shelter-register" element={<ProtectedRoute element={<ShelterRegister />} user={user} />} />
      <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} user={user} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
