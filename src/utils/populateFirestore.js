// Script para poblar Firestore con datos de ejemplo
// Este archivo debe ser importado en el componente principal para funcionar

const populateCategories = async () => {
  // Importar dinámicamente los servicios
  const { categoryService } = await import('../firebase/services.js');
  
  const defaultCategories = [
    {
      name: "PERRITOS",
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop&crop=center",
      bgColor: "#1e3a8a",
      type: "Perro",
      description: "Encuentra tu mejor amigo canino",
      petCount: 0
    },
    {
      name: "ERIZOS",
      image: "https://www3.gobiernodecanarias.org/medusa/wiki/images/0/0c/Erizo-moruno.png",
      bgColor: "#0d9488",
      type: "Erizo",
      description: "Pequeños y adorables erizos",
      petCount: 0
    },
    {
      name: "CONEJITOS",
      image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop&crop=center",
      bgColor: "#fbbf24",
      type: "Conejo",
      description: "Conejos tiernos y juguetones",
      petCount: 0
    },
    {
      name: "LORITOS",
      image: "https://i.pinimg.com/736x/e4/27/f4/e427f43daeda0e4cc69cfe265d6885da.jpg",
      bgColor: "#1e3a8a",
      type: "Loro",
      description: "Aves coloridas y parlanchinas",
      petCount: 0
    },
    {
      name: "HAMSTERS",
      image: "https://static.vecteezy.com/system/resources/previews/026/748/785/non_2x/cute-little-hamster-png.png",
      bgColor: "#0d9488",
      type: "Hamster",
      description: "Pequeños roedores adorables",
      petCount: 0
    },
    {
      name: "GATITOS",
      image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop&crop=center",
      bgColor: "#fbbf24",
      type: "Gato",
      description: "Gatos independientes y cariñosos",
      petCount: 0
    }
  ];

  try {
    console.log('Poblando categorías en Firestore...');
    
    for (const category of defaultCategories) {
      await categoryService.createCategory(category);
      console.log(`Categoría creada: ${category.name}`);
    }
    
    console.log('✅ Todas las categorías han sido creadas exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error poblando categorías:', error);
    return false;
  }
};

// Exportar para uso en componentes
export { populateCategories };

// También hacer disponible globalmente para la consola
if (typeof window !== 'undefined') {
  window.populateCategories = populateCategories;
}
