# 🚀 Configuración de Firebase - Nueva Cuenta

## ✅ Lo que YA está listo:
- ✅ Código actualizado con nueva configuración
- ✅ Medidas de seguridad implementadas
- ✅ Validaciones básicas activas

## 🔧 Lo que NECESITAS configurar en Firebase Console:

### 1. **Authentication (Autenticación)**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `animals-adoption-app-v2`
3. En el menú izquierdo, haz clic en **"Authentication"**
4. Haz clic en **"Comenzar"**
5. Ve a la pestaña **"Sign-in method"**
6. Habilita **"Correo electrónico/contraseña"**
7. Haz clic en **"Guardar"**

### 2. **Firestore Database (Base de datos)**
1. En el menú izquierdo, haz clic en **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Modo de prueba"** (para desarrollo)
4. Elige una ubicación cercana a ti (ej: us-central1)
5. Haz clic en **"Habilitar"**

### 3. **Storage (Almacenamiento) - OPCIONAL**
1. En el menú izquierdo, haz clic en **"Storage"**
2. Haz clic en **"Comenzar"**
3. Acepta las reglas por defecto
4. Elige la misma ubicación que Firestore
5. Haz clic en **"Siguiente"**

### 4. **Reglas de Firestore (Recomendado)**
1. En Firestore Database, ve a la pestaña **"Reglas"**
2. Reemplaza el contenido con:

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

3. Haz clic en **"Publicar"**

## 🧪 Probar la Configuración:

### 1. **Ejecutar la aplicación:**
```bash
npm run dev
```

### 2. **Probar funciones básicas:**
- Ve a `/register` para crear una cuenta
- Inicia sesión con tus credenciales
- Ve a `/shelters` para crear un refugio
- Ve a `/upload` para subir una mascota

### 3. **Verificar en Firebase Console:**
- En Authentication > Users: Deberías ver tu usuario
- En Firestore > Data: Deberías ver las colecciones creadas

## ⚠️ Si algo no funciona:

### **Error de Authentication:**
- Verifica que "Correo electrónico/contraseña" esté habilitado
- Revisa la consola del navegador para errores

### **Error de Firestore:**
- Verifica que la base de datos esté creada
- Revisa las reglas de Firestore
- Verifica la ubicación de la base de datos

### **Error de Storage:**
- Verifica que Storage esté habilitado
- Revisa las reglas de Storage

## 📊 Monitoreo (Opcional):

Si quieres verificar el estado de tu base de datos:
1. Abre la consola del navegador (F12)
2. Ejecuta: `checkDatabaseStatus()`
3. Esto te mostrará cuántos documentos tienes

## 🎉 ¡Listo!

Una vez configurado todo, tu aplicación debería funcionar perfectamente con la nueva cuenta Firebase y estar protegida contra el problema anterior.

## 📞 Soporte:

Si tienes problemas:
1. Revisa la consola del navegador
2. Verifica que todos los servicios estén habilitados
3. Asegúrate de que las reglas estén configuradas correctamente
