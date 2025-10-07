import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState('dark');

  // Cargar tema al montar - siempre iniciar en modo oscuro
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    // Forzar modo oscuro si no hay tema guardado o si es la primera vez
    const themeToUse = savedTheme === 'light' ? 'dark' : 'dark';
    setCurrentTheme(themeToUse);
    document.documentElement.setAttribute('data-theme', themeToUse);
    document.body.setAttribute('data-theme', themeToUse);
  }, []);

  // Función para cambiar tema
  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  // Función para establecer tema específico
  const setTheme = (theme) => {
    if (theme === 'dark' || theme === 'light') {
      setCurrentTheme(theme);
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
    }
  };

  return {
    currentTheme,
    toggleTheme,
    setTheme,
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light'
  };
};
