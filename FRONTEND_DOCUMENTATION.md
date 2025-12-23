# Documentación Técnica del Frontend - EcoHuella

## 1. Stack Tecnológico

- **Core**: [React](https://react.dev/) v18
- **Build Tool**: [Vite](https://vitejs.dev/) v5
- **Routing**: [React Router](https://reactrouter.com/) v6
- **Estado Global**: React Context API
- **Cliente HTTP**: [Axios](https://axios-http.com/)
- **Gráficos 3D**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) (Three.js para React)
- **Animaciones**: Framer Motion
- **Estilos**: CSS (Módulos y Global)

## 2. Estructura de Directorios

```
frontend/src/
├── components/          # Componentes Reutilizables
│   ├── Navbar.jsx       # Navegación principal
│   ├── ChatWidget.jsx   # Bot de IA flotante (EcoBot)
│   ├── GoleminoModel.jsx # Componente 3D de la mascota
│   └── ...
├── context/
│   └── AuthContext.jsx  # Manejo de sesión y usuario global
├── pages/               # Vistas (Rutas)
│   ├── Dashboard.jsx    # Panel principal
│   ├── Missions.jsx     # Gestión de misiones diarias/semanales
│   ├── GamifiedProfile.jsx # Perfil con gamificación
│   ├── Pet.jsx          # Vista de cuidado de Golemino
│   ├── Education.jsx    # Módulo educativo
│   └── ...
├── services/
│   └── api.js           # Configuración de Axios y llamadas al backend
├── App.jsx              # Configuración de rutas y Layout
└── main.jsx             # Punto de entrada
```

## 3. Arquitectura y Flujo de Datos

### 3.1. Gestión de Estado (AuthContext)
La aplicación utiliza un patrón de **Provider** para manejar la autenticación.
- **Archivo**: `src/context/AuthContext.jsx`
- **Funcionalidad**:
    - Persiste la sesión usando `localStorage` (token + user data).
    - Provee métodos `login()`, `register()`, `logout()` y `updateUser()` a toda la app.
    - Sincroniza el estado del usuario con el backend al recargar la página (`/auth/me`).

### 3.2. Enrutamiento y Seguridad
El enrutamiento en `App.jsx` implementa protección de rutas mediante componentes wrapper (Higher-Order Components):

- **`PublicRoute`**: Redirige al Dashboard si el usuario ya está logueado (ej: Login, Register).
- **`ProtectedRoute`**: Redirige al Login si no hay sesión activa.
- **`ProtectedLayout`**: Estructura base para usuarios autenticados. Incluye:
    - `<Navbar />` (Barra de navegación)
    - `<Outlet />` (Contenido de la página)
    - `<ChatWidget />` (Asistente IA disponible en todas las vistas internas)

### 3.3. Capa de Servicios (API Integration)
Todas las comunicaciones con el backend están centralizadas en `src/services/api.js`.
- **Axios Instance**: Configuración base con `baseURL`.
- **Interceptors**: Se inyecta automáticamente el token JWT (`Bearer token`) en el header `Authorization` de cada petición saliente.
- **Módulos de Servicio**:
    - `authService`: Autenticación.
    - `profileService`: Datos del usuario.
    - `questionnaireService`: Huella de carbono.
    - *(Nota: Otros servicios como missionsService se importan directamente en sus componentes o están pendientes de refactorización a este archivo central).*

## 4. Componentes Clave

### 4.1. Dashboard (`Dashboard.jsx`)
Es el hub central. Muestra:
- Resumen de huella de carbono.
- Progreso de nivel y rango.
- Acceso rápido a módulos.

### 4.2. Misiones (`Missions.jsx`)
Sistema de pestañas para alternar entre:
- **Diarias**: Lista de checkbox.
- **Semanales**: Cards con progreso acumulativo.
- **Lógica**: Maneja la aceptación, el progreso (updates locales optimistas) y la completitud de misiones.

### 4.3. Mascota (`Pet.jsx` & `GoleminoModel.jsx`)
- **Renderizado 3D**: Utiliza `<Canvas>` de `@react-three/fiber` para mostrar a Golemino.
- **Interfaz**: Botones para Alimentar, Curar y Jugar, que consumen "Brotos" (monedas).
- **Feedback**: Animaciones o cambios visuales según la fase (`baby`, `young`) y estado (`healthy`, `sick`).

### 4.4. Educación (`Education.jsx`)
- Lista de temas de aprendizaje.
- Al hacer clic, abre un `TopicViewer` (modal o vista detalle) con el contenido.

## 5. Estilos y Diseño
El proyecto utiliza una mezcla de CSS global y hojas de estilo por componente.
- **Tema Global**: Definido en `index.css` (variables CSS para colores, fuentes).
- **Componentes**: Archivos como `Dashboard.css`, `Missions.css` contienen estilos específicos para evitar colisiones excesivas, aunque no son CSS Modules estrictos (usan nombres de clase convencionales).

## 6. Buenas Prácticas Implementadas
- **Componentización**: Separación lógica de UI (Navbar, Chat) y Vistas (Pages).
- **Code Splitting**: Implícito por Vite/Rollup en el build de producción.
- **Manejo de Errores**: Feedback visual en formularios de Login/Registro.
- **Loading States**: Spinners de carga durante la verificación de sesión en `App.jsx`.
