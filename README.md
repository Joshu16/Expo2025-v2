# 🐾 Expo2025 - Adopción de Mascotas

Aplicación web para la adopción de mascotas desarrollada con React y Firebase.

## 🚀 Características

- ✅ **Autenticación** con email y contraseña
- ✅ **Gestión de mascotas** (crear, editar, eliminar)
- ✅ **Sistema de refugios** con verificación
- ✅ **Chat en tiempo real** entre usuarios
- ✅ **Solicitudes de adopción** con seguimiento
- ✅ **Sistema de favoritos**
- ✅ **Notificaciones** en tiempo real
- ✅ **Modo oscuro** incluido

## 🛠️ Tecnologías

- **Frontend:** React 19 + Vite
- **Backend:** Firebase (Firestore + Auth)
- **Routing:** React Router v7
- **Estilos:** CSS personalizado

## 📦 Instalación

```bash
# Clonar repositorio
git clone [url-del-repo]

# Instalar dependencias
npm install

# Crear archivo .env (ver configuración abajo)
# Aplicar reglas de Firestore (ver configuración abajo)

# Ejecutar en desarrollo
npm run dev
```

## ⚙️ Configuración

### 1. Variables de Entorno
Crear archivo `.env` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 2. Reglas de Firestore
1. Ve a Firebase Console > Firestore Database > Reglas
2. Copia el contenido de `firestore.rules`
3. Publica las reglas

## 🎯 Scripts Disponibles

```bash
npm run dev      # Desarrollo
npm run build    # Producción
npm run preview  # Preview de build
npm run deploy   # Deploy a GitHub Pages
```

## 📱 Uso

1. **Registrarse** con email y contraseña
2. **Crear perfil** de usuario o refugio
3. **Subir mascotas** para adopción
4. **Explorar** mascotas disponibles
5. **Contactar** dueños via chat
6. **Gestionar** solicitudes de adopción

## 🔒 Seguridad

- Variables de entorno para configuración
- Reglas de Firestore estrictas
- Validación de datos del lado cliente
- Autenticación requerida para todas las operaciones

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

**Desarrollado con ❤️ para ayudar a las mascotas a encontrar un hogar**