import React from "react";
import "../styles/App.css";
import "../styles/Categories.css";
import NavBar from "../components/navbar.jsx";

function Categories() {
  const categories = [
    {
      name: "PERRITOS",
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop&crop=center",
      bgColor: "#1e3a8a"
    },
    {
      name: "ERIZOS",
      image: "https://images.unsplash.com/photo-1584551246675-5196c8c2c6c6?w=400&h=300&fit=crop&crop=center",
      bgColor: "#0d9488"
    },
    {
      name: "CONEJITOS",
      image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop&crop=center",
      bgColor: "#fbbf24"
    },
    {
      name: "LORITOS",
      image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop&crop=center",
      bgColor: "#1e3a8a"
    },
    {
      name: "HAMSTERS",
      image: "https://images.unsplash.com/photo-1584551246675-5196c8c2c6c6?w=400&h=300&fit=crop&crop=center",
      bgColor: "#0d9488"
    },
    {
      name: "GATITOS",
      image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop&crop=center",
      bgColor: "#fbbf24"
    }
  ];

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
              style={{ backgroundColor: category.bgColor }}
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
