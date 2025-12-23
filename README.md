# 🌱 EcoHuella - Plataforma de Gamificación Ecológica

EcoHuella es una aplicación web integral diseñada para educar, medir y reducir la huella de carbono personal a través de estrategias de gamificación y cambio de comportamiento. La plataforma combina una calculadora de huella de carbono rigurosa con un sistema de misiones diarias, niveles, medallas y un asistente virtual inteligente.

## 📋 Características Principales

### 1. 🔐 Módulo de Identidad y Seguridad (Auth)
- **Registro e Inicio de Sesión**: Sistema seguro con JWT y encriptación bcrypt.
- **Perfil de Usuario**: Gestión de datos personales y avatar.
- **Seguridad**: Rutas protegidas y validación de sesiones.

### 2. 📊 Motor de Huella de Carbono (Carbon Engine)
- **Cuestionario Detallado**: Basado en estándares internacionales (IPCC, GHG Protocol).
- **Cálculo por Categorías**: Transporte, Energía, Alimentación, Residuos y Agua.
- **Resultados Visuales**: Gráficos y comparativas con el promedio regional.
- **Historial**: Seguimiento de la evolución de la huella a lo largo del tiempo.

### 3. 🎮 Gamificación y Misiones
Este es el núcleo de la retención de usuarios, diseñado para convertir hábitos sostenibles en un juego.
- **Sistema de Niveles y Rangos**: Desde "Semilla" hasta "Leyenda Verde". Progresión basada en experiencia (XP).
- **Misiones Diarias y Semanales**: Retos ecológicos (ej. "Ducha corta", "Día sin carne") que otorgan XP y "Brotos" (moneda virtual).
- **Rachas (Streaks)**: Bonificaciones por constancia diaria.
- **Medallas (Badges)**: Logros desbloqueables por hitos específicos (ej. "Eco Guerrero" por completar 10 misiones).
- **Leaderboard**: Tabla de clasificación semanal para competir con otros usuarios.
- **Tienda de Recompensas**: Usa tus "Brotos" para refrescar misiones o adquirir personalizaciones (próximamente).

### 4. 🤖 Asistente Virtual (Golemino)
- Chatbot integrado para resolver dudas sobre ecología y la plataforma.
- Proporciona consejos personalizados basados en el progreso del usuario.

### 5. 📚 Educación
- Módulos educativos sobre sostenibilidad.
- Seguimiento de progreso en temas de aprendizaje.

### 6. 🐾 Mascota Virtual (Golemino AR)
Sistema inmersivo de mascota virtual con realidad aumentada que fomenta el engagement diario.

**Características**:
- **Modelo 3D Interactivo**: Visualización en tiempo real con animaciones
- **Sistema de Evolución**: 3 fases (Bebé → Joven → Titán) desbloqueables con Brotos
- **Mecánica de Salud**: Sistema de porcentaje (0-100%) con 5 estados etiquetados
- **Degradación Automática**: -20 salud por día de inactividad
- **Interacciones**:
  - 🍃 Alimentar (20 Brotos): +30 salud
  - ✋ Acariciar (Gratis, 1/día): +5 salud
  - 💊 Curar (50 Brotos): Restauración completa
  - ⭐ Evolucionar (500/1500 Brotos): Cambio de fase
- **Modo AR**: Visualiza a Golemino en tu entorno real usando la cámara
- **Efectos Visuales**: Partículas flotantes, animaciones, colores dinámicos

**Estados de Salud**:
- 💚 Excelente (80-100%)
- 😷 Bueno (60-79%)
- 🤒 Regular (40-59%)
- 🤢 Malo (20-39%)
- ☠️ Crítico (0-19%)

**Costos de Evolución**:
- Bebé → Joven: 500 Brotos
- Joven → Titán: 1500 Brotos


---

## 🛠️ Stack Tecnológico

### Frontend (Cliente)
- **Framework**: React.js + Vite
- **Lenguaje**: JavaScript (ES6+)
- **Estilos**: CSS3 Moderno (Variables, Flexbox, Grid)
- **Navegación**: React Router DOM v6
- **Estado**: React Context API
- **Cliente HTTP**: Axios
- **3D/AR**: Three.js + React Three Fiber + Drei

### Backend (Servidor)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL para escalabilidad y persistencia robusta.
- **Autenticación**: JSON Web Tokens (JWT)
- **Seguridad**: `bcryptjs` para hashing, `cors` para seguridad de origen cruzado.

---

## 📁 Estructura del Proyecto

```
Proyecto/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración de DB y scripts de migración
│   │   ├── controllers/     # Lógica de negocio (Gamification, Missions, Auth...)
│   │   ├── middleware/      # Middlewares (Auth check)
│   │   ├── routes/          # Definición de endpoints API
│   │   ├── services/        # Lógica compleja y servicios auxiliares
│   │   ├── utils/           # Utilidades y constantes
│   │   └── server.js        # Punto de entrada del servidor
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes UI reutilizables
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Vistas (Dashboard, Missions, Profile...)
│   │   ├── services/        # Cliente API (axios configuration)
│   │   └── main.jsx         # Punto de entrada de React
└── README.md
```

---

## 💾 Esquema de Base de Datos

El proyecto utiliza una base de datos relacional PostgreSQL con las siguientes tablas principales:

- **`users`**: Credenciales y datos de acceso.
- **`user_profile`**: Estado de gamificación (nivel, XP, monedas, racha, huella actual).
- **`challenges`**: Catálogo de retos disponibles con su impacto ambiental y recompensas.
- **`user_missions`**: Instancias de retos asignados a usuarios y su estado (active, completed).
- **`badges`**: Definición de logros disponibles.
- **`user_badges`**: Logros desbloqueados por los usuarios.
- **`mission_history`**: Registro histórico de misiones completadas.
- **`questionnaire_results`**: Historial de cálculos de huella de carbono.

---

## 📝 Documentación de API

### Autenticación (`/api/auth`)
- `POST /register`: Crear cuenta.
- `POST /login`: Iniciar sesión y obtener token.
- `GET /me`: Obtener datos del usuario autenticado.

### Gamificación (`/api/gamification`)
- `GET /profile`: Obtener perfil de juego completo (Nivel, XP, Monedas).
- `GET /leaderboard`: Obtener ranking semanal de usuarios.
- `GET /badges/user`: Ver medallas ganadas.
- `GET /badges/all`: Ver todas las medallas disponibles.
- `POST /badges/equip/:badgeId`: Equipar una medalla en el perfil.

### Misiones (`/api/missions`)
- `GET /today`: Obtener misiones diarias asignadas.
- `GET /weekly`: Obtener misiones semanales.
- `POST /accept/:missionId`: Aceptar una misión.
- `POST /complete/:missionId`: Marcar misión como completada (gana XP/Monedas).
- `POST /refresh-pool`: Gastar monedas para obtener nuevas misiones diarias.

### Cuestionario (`/api/questionnaire`)
- `POST /submit`: Enviar respuestas para cálculo de huella.
- `GET /results`: Obtener historial de cálculos.

### Golemino (`/api/golemino`)
- `GET /status`: Obtener estado completo de Golemino (fase, salud, estado).
- `POST /feed`: Alimentar a Golemino (cuesta 20 Brotos, +30 salud).
- `POST /heal`: Curar enfermedad (cuesta 50 Brotos, salud → 100).
- `POST /pet`: Acariciar a Golemino (gratis, 1 vez al día, +5 salud).
- `POST /evolve`: Evolucionar a siguiente fase (500/1500 Brotos).
- `GET /evolution-history`: Obtener historial de evoluciones.


---

## 🚀 Instalación y Despliegue

### Requisitos Previos
- Node.js (v16 o superior)
- npm (v8 o superior)

### 1. Configurar Backend

#### a) Instalar dependencias
```bash
cd backend
npm install
```

#### b) Configurar base de datos Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a **Settings → Database** y copia tu **Connection String**
3. Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:

```bash
DATABASE_URL=tu-connection-string-de-supabase
NODE_ENV=production
JWT_SECRET=tu-secret-key-cambiar-en-producción
GROQ_API_KEY=tu-api-key-de-groq
```

#### c) Inicializar la base de datos
```bash
node scripts/init-supabase.js
```

Este script creará todas las tablas y datos semilla (niveles, rangos, categorías, misiones).

#### d) Iniciar el servidor
```bash
npm start
```
Servidor corriendo en: `http://localhost:3000`

#### e) Verificar conexión (opcional)
```bash
node test-db-connection.js
node scripts/test-write-operations.js
```

### 2. Configurar Frontend
```bash
cd frontend
npm install
npm run dev
```
Cliente corriendo en: `http://localhost:5173`

## 👥 Contribución
Para contribuir, por favor crea un Fork del repositorio, realiza tus cambios en una rama dedicada (`feature/nueva-funcionalidad`) y envía un Pull Request.

---
© 2025 EcoHuella Team
