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

// RUTA PROTEGIDA (definir antes de usar)
const ProtectedRoute = ({ element }) => {
  const hasProfile = !!localStorage.getItem("userProfile");
  const isAuthed = localStorage.getItem("isAuthenticated") === "true";
  if (hasProfile && isAuthed) return element;
  const redirect = hasProfile ? "/login" : "/register";
  return <Navigate to={redirect} replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute element={<Home />} />} />
      <Route path="/categories" element={<ProtectedRoute element={<Categories />} />} />
      <Route path="/upload" element={<ProtectedRoute element={<Upload />} />} />
      <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
      <Route path="/adopt" element={<ProtectedRoute element={<Adopt />} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
