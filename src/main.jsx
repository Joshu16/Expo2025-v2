import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext.jsx';
import './styles/App.css'
import App from './pages/App.jsx'

// Inicializar tema (oscuro por defecto)
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);

// DESACTIVADO: Monitoreo automático para evitar consumo de cuota
// Solo se puede activar manualmente desde la consola si es necesario
// if (import.meta.env.DEV) {
//   import('./utils/databaseMonitor.js').then(module => {
//     console.log('🔍 Monitoreo de base de datos habilitado en modo desarrollo');
//   });
// }

// Configuración optimizada de Firebase (sin errores)
if (import.meta.env.DEV) {
  import('./utils/optimizedFirebase.js').then(module => {
    console.log('🚀 Firebase optimizado habilitado en modo desarrollo');
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
