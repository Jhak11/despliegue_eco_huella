# Documentación Técnica del Proyecto - EcoHuella

## 1. Visión General del Proyecto
**EcoHuella** es una aplicación web full-stack diseñada para fomentar la sostenibilidad ambiental mediante la gamificación. Los usuarios pueden calcular su huella de carbono, completar misiones diarias y semanales, educarse sobre temas ecológicos y cuidar de una mascota virtual ("Golemino") que evoluciona con sus acciones positivas.

## 2. Arquitectura y Tecnologías (Tech Stack)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5.0
- **Lenguaje**: JavaScript (ES6+ / JSX)
- **Estilos**: CSS Modules (archivos `.css` por componente) y CSS vanilla.
- **Gráficos 3D**: Three.js / React Three Fiber (para la visualización de la mascota Golemino).
- **Animaciones**: Framer Motion.
- **Cliente HTTP**: Axios.
- **Routing**: React Router DOM 6.

### Backend
- **Entorno**: Node.js v22+
- **Framework Web**: Express 4.18
- **Base de Datos**: SQLite (gestionada con `better-sqlite3`).
- **Autenticación**: JWT (JSON Web Tokens) y bcryptjs.
- **AI Integration**: Groq SDK (para el chatbot asistente ecológico).
- **Controladores y Rutas**: Arquitectura MVC simplificada.

## 3. Estructura del Proyecto

```
Proyecto/
├── backend/                  # Servidor API Node.js
│   ├── src/
│   │   ├── config/           # Configuración (DB, seed data)
│   │   ├── controllers/      # Lógica de negocio (Auth, Misiones, Golemino)
│   │   ├── middleware/       # Auth, validaciones
│   │   ├── routes/           # Definición de endpoints API
│   │   ├── services/         # Servicios reusables (Gamification, Assignments)
│   │   └── server.js         # Entrada principal del servidor
│   ├── scripts/              # Scripts de utilidad y mantenimiento
│   ├── database.sqlite       # Archivo de base de datos
│   └── package.json
│
├── frontend/                 # Cliente React
│   ├── public/               # Assets estáticos (imágenes, modelos 3D)
│   ├── src/
│   │   ├── components/       # Componentes UI reutilizables
│   │   ├── context/          # Contextos de React (AuthContext)
│   │   ├── pages/            # Vistas principales (Dashboard, Profile, Missions)
│   │   ├── services/         # Clientes API (api.js)
│   │   └── App.jsx           # Componente raíz y enrutamiento
│   └── package.json
│
└── DATABASE_DOCUMENTATION.md # Documentación detallada del esquema DB
```

## 4. Módulos Principales

### 4.1. Autenticación y Usuarios
- **Registro/Login**: Manejo seguro con `bcrypt` para contraseñas.
- **JWT**: Tokens de acceso para proteger rutas privadas.
- **Perfil**: Almacena datos personales, estadísticas de huella y estado de gamificación.

### 4.2. Huella de Carbono (Cuestionario)
- Cuestionario inicial para calcular la línea base de la huella de carbono del usuario.
- Categorías: Transporte, Energía, Alimentación, Residuos, Agua.
- Resultados visuales y comparativos (Dashboard).

### 4.3. Sistema de Misiones (Gamificación CORE)
- **Tipos**:
    - **Diarias**: Acciones pequeñas y rápidas (ej: "Apagar luces", "Ducha corta"). Expira en 24h.
    - **Semanales**: Desafíos de mayor compromiso (ej: "Semana sin carne"). Duración 7 días.
- **Recompensas**:
    - **XP (Experiencia)**: Sube de nivel al usuario.
    - **Brotos (Monedas)**: Divisa virtual para tienda/mascota.
    - **Insignias**: Logros desbloqueables por hitos (ej: "10 misiones completadas").
- **Flujo**: Asignación automática diaria -> Aceptar Misión -> Registrar Progreso -> Completar -> Recompensa.

### 4.4. Mascota Virtual (Golemino)
- **Concepto**: Una mascota (Golem) que refleja el compromiso ecológico del usuario.
- **Mecánicas**:
    - **Fases**: Baby -> Young -> Titan. Evoluciona pagando Brotos.
    - **Salud**: Depende de la actividad del usuario (misiones completadas). Si se descuida, enferma.
    - **Interacción**: Alimentar, jugar y curar usando Brotos.
- **Técnico**: Renderizado 3D en el frontend usando `react-three-fiber`.

### 4.5. Educación
- Módulo de aprendizaje con temas ecológicos.
- Seguimiento de progreso de lectura.
- Recompensas por completar temas educativos.

### 4.6. Asistente IA (Chat)
- Chatbot integrado potenciado por la API de Groq.
- Contexto: Experto en sostenibilidad que responde dudas sobre reciclaje, ahorro energético, etc.

## 5. API Reference (Resumen de Endpoints)

Pre fijo base: `/api`

### Auth (`/auth`)
- `POST /register`: Crear cuenta.
- `POST /login`: Iniciar sesión.
- `GET /me`: Obtener usuario actual.

### Misiones (`/missions`)
- `GET /today`: Pool de misiones diarias (Mandatorias + Opcionales).
- `GET /weekly`: Misiones semanales.
- `POST /accept/:id`: Aceptar una misión del pool.
- `POST /progress/:id`: Registrar avance (check-in diario).
- `POST /complete/:id`: Finalizar misión y reclamar premios.
- `POST /refresh-pool`: Gastar Brotos para obtener nuevas misiones diarias.

### Perfil (`/profile`)
- `GET /stats`: Estadísticas completas (Nivel, XP, Huella, Ranking).
- `PUT /update`: Actualizar datos personales.
- `GET /leaderboard`: Tabla de clasificación global o semanal.

### Golemino (`/golemino`)
- `GET /status`: Estado actual de la mascota.
- `POST /interact`: Alimentar, curar, jugar.
- `POST /evolve`: Evolucionar a la siguiente fase.

### Cuestionario (`/questionnaire`)
- `POST /submit`: Guardar respuestas y calcular huella.
- `GET /results`: Obtener histórico de resultados.

### Chat (`/chat`)
- `POST /message`: Enviar consulta a la IA.

## 6. Base de Datos
- **Motor**: SQLite.
- **Configuración**: `backend/src/config/database.js`.
- **Esquema Unificado**: Todas las tablas (`users`, `user_profile`, `challenges`, `user_missions`, etc.) se definen e inicializan al arranque del servidor.
- *Ver `DATABASE_DOCUMENTATION.md` para el detalle completo de tablas y columnas.*

## 7. Ejecución y Despliegue

### Requisitos
- Node.js v18+ instalado.
- NPM o Yarn.

### Comandos de Desarrollo
1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   (Corre en puerto 3000)

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   (Corre en puerto 5173 - Vite)

### Notas de Producción
- Recomendado migrar base de datos a **PostgreSQL** para entornos de alta concurrencia.
- Configurar variables de entorno (`.env`) para claves secretas (JWT_SECRET, GROQ_API_KEY).
