# Configuración de Firebase

## Pasos para configurar Firebase en tu proyecto

### 1. Crear proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombra tu proyecto (ej: "animals-adoption-app")
4. Desactiva Google Analytics (opcional para prototipos)
5. Haz clic en "Crear proyecto"

### 2. Configurar Authentication

1. En el panel izquierdo, ve a "Authentication"
2. Haz clic en "Comenzar"
3. Ve a la pestaña "Sign-in method"
4. Habilita "Correo electrónico/contraseña"
5. Guarda los cambios

### 3. Configurar Firestore Database

1. En el panel izquierdo, ve a "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Modo de prueba" (para prototipos)
4. Elige una ubicación cercana a ti
5. Haz clic en "Habilitar"

### 4. Configurar Storage (opcional para imágenes)

1. En el panel izquierdo, ve a "Storage"
2. Haz clic en "Comenzar"
3. Acepta las reglas por defecto
4. Elige la misma ubicación que Firestore

### 5. Obtener configuración de Firebase

1. En el panel izquierdo, ve a "Configuración del proyecto" (ícono de engranaje)
2. Ve a la pestaña "General"
3. En "Tus aplicaciones", haz clic en el ícono web (</>)
4. Registra tu app con un nombre (ej: "animals-web")
5. Copia la configuración de Firebase

### 6. Actualizar configuración en el código

Reemplaza el contenido de `src/firebase/config.js` con tu configuración:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};
```

### 7. Configurar reglas de Firestore (opcional)

En Firestore Database > Reglas, puedes usar estas reglas básicas para desarrollo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 8. Probar la aplicación

1. Ejecuta `npm run dev`
2. Ve a `/register` para crear una cuenta
3. Inicia sesión con tus credenciales
4. Los datos se guardarán en Firebase en lugar de localStorage

## Estructura de datos en Firestore

### Colecciones que se crearán automáticamente:

- `users` - Perfiles de usuarios
- `notifications` - Notificaciones del sistema
- `conversations` - Conversaciones de chat
- `messages` - Mensajes individuales
- `pets` - Mascotas disponibles para adopción

## Notas importantes

- Este es un prototipo, por lo que las reglas de seguridad son básicas
- Para producción, necesitarías reglas más estrictas
- El plan gratuito de Firebase es suficiente para prototipos
- Los datos se sincronizan en tiempo real automáticamente
