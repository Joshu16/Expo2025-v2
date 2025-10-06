# 🚨 Guía de Migración a Nueva Cuenta Firebase

## Situación Actual
- Cuota de Firebase completamente agotada
- No se pueden realizar operaciones de lectura/escritura
- Necesitas crear una nueva cuenta Firebase

## 📋 Pasos para la Migración

### 1. Crear Nueva Cuenta Firebase

1. **Ve a [Firebase Console](https://console.firebase.google.com/)**
2. **Crea un nuevo proyecto:**
   - Nombre: `animals-adoption-app-v2`
   - Desactiva Google Analytics
3. **Configura Authentication:**
   - Ve a Authentication > Sign-in method
   - Habilita "Email/Password"
4. **Configura Firestore:**
   - Ve a Firestore Database
   - Crea base de datos en modo prueba
   - Elige ubicación cercana
5. **Configura Storage (opcional):**
   - Ve a Storage
   - Acepta reglas por defecto

### 2. Obtener Nueva Configuración

1. Ve a Configuración del proyecto (ícono de engranaje)
2. En "Tus aplicaciones", haz clic en el ícono web (</>)
3. Registra tu app con nombre "animals-web-v2"
4. Copia la configuración

### 3. Actualizar Configuración en el Código

1. **Reemplaza el contenido de `src/firebase/config.js`** con tu nueva configuración:

```javascript
const firebaseConfig = {
  apiKey: "tu-nueva-api-key",
  authDomain: "tu-nuevo-proyecto.firebaseapp.com",
  projectId: "tu-nuevo-proyecto-id",
  storageBucket: "tu-nuevo-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-nueva-app-id"
};
```

2. **O usa el archivo `src/firebase/config-new.js`** y renómbralo a `config.js`

### 4. Migrar Datos Importantes (OPCIONAL)

Si quieres migrar algunos datos de la cuenta anterior:

1. **Abre la consola del navegador** en tu app
2. **Importa el script de migración:**
   ```javascript
   import('./src/utils/migrateToNewAccount.js');
   ```
3. **Ejecuta la migración:**
   ```javascript
   migrateAll();
   ```

### 5. Configurar Reglas de Firestore

En Firestore Database > Reglas, usa estas reglas básicas:

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

### 6. Probar la Nueva Configuración

1. **Ejecuta tu app:**
   ```bash
   npm run dev
   ```

2. **Prueba las funciones básicas:**
   - Registro de usuario
   - Inicio de sesión
   - Crear mascota
   - Crear refugio

## ⚠️ Consideraciones Importantes

### Datos que se Perderán
- ❌ Todos los usuarios registrados anteriormente
- ❌ Todas las mascotas subidas
- ❌ Todos los refugios creados
- ❌ Historial de conversaciones
- ❌ Notificaciones previas

### Datos que se Pueden Migrar
- ✅ Estructura de categorías
- ✅ Configuración de la app
- ✅ Código fuente (sin cambios)

### Ventajas de la Nueva Cuenta
- ✅ Cuota fresca de 1GB
- ✅ Proyecto limpio sin datos basura
- ✅ Mejor rendimiento
- ✅ Control total sobre los datos

## 🚀 Próximos Pasos

1. **Completa la migración** siguiendo los pasos anteriores
2. **Prueba todas las funcionalidades** de tu app
3. **Registra algunos usuarios de prueba**
4. **Sube algunas mascotas de ejemplo**
5. **Configura algunos refugios de prueba**

## 💡 Consejos para Evitar el Problema en el Futuro

1. **Monitorea el uso** en Firebase Console
2. **Implementa límites** en tu código
3. **Usa paginación** para listas grandes
4. **Limpia datos de prueba** regularmente
5. **Considera un plan de pago** si el proyecto crece

## 📞 Soporte

Si tienes problemas con la migración:
1. Revisa la consola del navegador para errores
2. Verifica que la nueva configuración sea correcta
3. Asegúrate de que los servicios estén habilitados
4. Prueba con un usuario simple primero

¡Tu app estará funcionando de nuevo en poco tiempo! 🎉
