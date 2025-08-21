import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/Categories.css";
import NavBar from "../components/navbar.jsx";

function Categories() {
  const navigate = useNavigate();

  const categories = [
    { name: "PERRITOS", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop&crop=center", bgColor: "#1e3a8a", type: "Perro" },
    { name: "ERIZOS", image: "https://www3.gobiernodecanarias.org/medusa/wiki/images/0/0c/Erizo-moruno.png", bgColor: "#0d9488", type: "Erizo" },
    { name: "CONEJITOS", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop&crop=center", bgColor: "#fbbf24", type: "Conejo" },
    { name: "LORITOS", image: "https://i.pinimg.com/736x/e4/27/f4/e427f43daeda0e4cc69cfe265d6885da.jpg", bgColor: "#1e3a8a", type: "Loro" },
    { name: "HAMSTERS", image: "https://static.vecteezy.com/system/resources/previews/026/748/785/non_2x/cute-little-hamster-png.png", bgColor: "#0d9488", type: "Hamster" },
    { name: "GATITOS", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop&crop=center", bgColor: "#fbbf24", type: "Gato" }
  ];

  const handleCategoryClick = (type) => {
    // Redirige a Home enviando la categoría seleccionada
    navigate("/", { state: { category: type } });
  };

  return (
    <div className="container">
      <header>
        <div className="header-content">
          <span className="bone-icon">🦴</span>
          <h2 className="logo-text">ANIMALS</h2>
        </div>
      </header>

      <main>
        <div className="category-cards">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="category-card"
              style={{ backgroundColor: category.bgColor, cursor: "pointer" }}
              onClick={() => handleCategoryClick(category.type)}
            >
              <img src={category.image} alt={category.name} />
              <div className="category-name">
                {category.name}
              </div>
            </div>
          ))}
        </div>
      </main>

      <NavBar />
    </div>
  );
}

export default Categories;
