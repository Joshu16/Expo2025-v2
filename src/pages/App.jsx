import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import "../styles/App.css";
import "../utils/setupFirebase.js";
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
import Conversations from "./Conversations.jsx";
import Users from "./Users.jsx";
import Favorites from "./Favorites.jsx";
import MyPets from "./MyPets.jsx";
import Shelters from "./Shelters.jsx";
import ShelterRegister from "./ShelterRegister.jsx";
import ShelterAdmin from "./ShelterAdmin.jsx";
import Notifications from "./Notifications.jsx";
import AdoptionRequests from "./AdoptionRequests.jsx";

// RUTA PROTEGIDA (definir antes de usar)
const ProtectedRoute = ({ element, user, loading }) => {
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: 'var(--text-secondary)'
      }}>
        Cargando...
      </div>
    );
  }
  if (user) return element;
  return <Navigate to="/login" replace />;
};

function App() {
  const { user, loading } = useAuth();

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
      <Route path="/" element={<ProtectedRoute element={<Home />} user={user} loading={loading} />} />
      <Route path="/categories" element={<ProtectedRoute element={<Categories />} user={user} loading={loading} />} />
      <Route path="/upload" element={<ProtectedRoute element={<Upload />} user={user} loading={loading} />} />
      <Route path="/profile" element={<ProtectedRoute element={<Profile />} user={user} loading={loading} />} />
      <Route path="/adopt" element={<ProtectedRoute element={<Adopt />} user={user} loading={loading} />} />
      <Route path="/tracking" element={<ProtectedRoute element={<Tracking />} user={user} loading={loading} />} />
      <Route path="/adoption-details" element={<ProtectedRoute element={<AdoptionDetails />} user={user} loading={loading} />} />
      <Route path="/chat/:conversationId" element={<ProtectedRoute element={<Chat />} user={user} loading={loading} />} />
      <Route path="/conversations" element={<ProtectedRoute element={<Conversations />} user={user} loading={loading} />} />
      <Route path="/users" element={<ProtectedRoute element={<Users />} user={user} loading={loading} />} />
      <Route path="/favorites" element={<ProtectedRoute element={<Favorites />} user={user} loading={loading} />} />
      <Route path="/my-pets" element={<ProtectedRoute element={<MyPets />} user={user} loading={loading} />} />
      <Route path="/shelters" element={<ProtectedRoute element={<Shelters />} user={user} loading={loading} />} />
      <Route path="/shelter-register" element={<ProtectedRoute element={<ShelterRegister />} user={user} loading={loading} />} />
      <Route path="/shelter-admin" element={<ProtectedRoute element={<ShelterAdmin />} user={user} loading={loading} />} />
      <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} user={user} loading={loading} />} />
      <Route path="/adoption-requests" element={<ProtectedRoute element={<AdoptionRequests />} user={user} loading={loading} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
