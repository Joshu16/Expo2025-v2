import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "../styles/App.css";
import Home from "./Home.jsx";
import Categories from "./Categories.jsx";
import Upload from "./Upload.jsx";
import Profile from "./Profile.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Adopt from "./Adopt.jsx";

function App() {
  // Componente de ruta protegida
  const ProtectedRoute = ({ element }) => {
    const hasProfile = !!localStorage.getItem("userProfile");
    const isAuthed = localStorage.getItem("isAuthenticated") === "true";
    if (hasProfile && isAuthed) return element;
    const redirect = hasProfile ? "/login" : "/register";
    return <Navigate to={redirect} replace />;
  };

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas protegidas */}
      <Route path="/" element={<ProtectedRoute element={<Home />} />} />
      <Route path="/categories" element={<ProtectedRoute element={<Categories />} />} />
      <Route path="/upload" element={<ProtectedRoute element={<Upload />} />} />
      <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />

      {/* Ruta de adopción (clic en tarjeta) */}
      <Route path="/adopt" element={<ProtectedRoute element={<Adopt />} />} />

      {/* Redirigir cualquier otra ruta al home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
