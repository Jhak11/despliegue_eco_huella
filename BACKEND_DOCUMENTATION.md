# Documentación Técnica del Backend - EcoHuella

## 1. Stack Tecnológico

- **Runtime**: [Node.js](https://nodejs.org/) (v16+)
- **Framework Web**: [Express](https://expressjs.com/) v4
- **Base de Datos**: PostgreSQL (vía [Supabase](https://supabase.com/) usando `pg` node-postgres).
- **Autenticación**: JWT (JSON Web Tokens) + Bcrypt.
- **Inteligencia Artificial**: [Groq SDK](https://console.groq.com/docs/libraries/js) (Modelo Llama3-8b).


## 2. Estructura de Directorios

```
backend/src/
├── config/              # Configuración y esquemas
│   └── database.js      # Singleton de conexión DB e inicialización de tablas.
├── controllers/         # Controladores (Lógica de entrada/salida HTTP)
│   ├── authController.js
│   ├── enhancedMissionsController.js # Lógica avanzada de misiones
│   ├── gamificationController.js
│   └── ...
├── middleware/
│   └── auth.js          # Verificación de JWT
├── routes/              # Definición de rutas (Router de Express)
│   ├── api.js           # Índice de rutas
│   └── ...
├── services/            # Lógica de negocio reutilizable (Business Layer)
│   ├── gamificationService.js    # Cálculos de XP, Nivel, Rangos
│   ├── missionAssignmentService.js # Algoritmos de asignación diaria
│   └── goleminoHealthService.js  # Lógica de salud de la mascota
└── server.js            # Punto de entrada (Setup de Express, CORS, Puertos)
```

## 3. Arquitectura y Patrones

El backend sigue una arquitectura **MVC (Model-View-Controller)** simplificada, donde el "Modelo" es reemplazado por consultas SQL directas optimizadas y una capa de Servicios para lógica compleja.

### 3.1. Flujo de una Petición
1.  **Request**: Cliente (Frontend) envía petición HTTP.
2.  **Middleware**: `auth.js` verifica el token `Authorization: Bearer <token>`.
3.  **Router**: Enruta la petición al controlador correspondiente (`routes/`).
4.  **Controlador**:
    *   Valida inputs.
    *   Llama a **Servicios** (si la lógica es compleja) o ejecuta SQL directo.
    *   Construye y envía la respuesta JSON.

### 3.2. Capa de Servicios (Business Logic)
Para evitar controladores "gordos", la lógica crítica se extrae a servicios:

-   **`gamificationService.js`**: Es el motor de recompensas.
    *   `addExperience()`: Suma XP, calcula subidas de nivel y otorga recompensas.
    *   `checkAndUnlockBadges()`: Verifica si el usuario cumple condiciones para nuevas insignias.
    *   `updateStreak()`: Gestiona la racha diaria.

-   **`missionAssignmentService.js`**: Cerebro de asignación.
    *   Genera misiones diarias aleatorias del pool disponible.
    *   Asegura que no se repitan asignaciones activas.
    *   Filtra misiones según preferencias del usuario (si existen).

## 4. Módulos Clave

### 4.1. Misiones (Enhanced System)
El archivo `enhancedMissionsController.js` maneja el ciclo de vida moderno de las misiones:
-   **Pool Diario**: Genera un set de misiones cada dia (`pool_date`).
-   **Validación**: Impide completar la misma misión múltiples veces en un día fuera de lógica.
-   **Lifecycle**: Asignada -> Aceptada -> Progreso (check-in) -> Completada -> Recompensa.

### 4.2. Mascota Virtual (Golemino)
-   **Persistencia**: Estado (`healthy`, `sick`) y fase (`baby`, `young`) guardados en `user_profile`.
-   **Evolución**: Lógica transaccional que verifica saldo de Brotos antes de actualizar la fase.

### 4.3. Chatbot IA
-   Implementado en `chatController.js`.
-   Utiliza **Groq SDK** para inferencia ultra-rápida.
-   **System Prompt**: Configurado para actuar como un experto en sostenibilidad, empático y educativo.

## 5. Base de Datos (PostgreSQL via Supabase)

La persistencia se maneja con `pg` (node-postgres) conectado a Supabase.
-   **Proveedor**: Supabase (PostgreSQL en la nube)
-   **Conexión**: Pool de conexiones configurado en `config/database.js`
-   **SSL**: Activado automáticamente para conexiones Supabase
-   **Migrations**: El esquema se define e inicializa automáticamente al arrancar el servidor en `database.js`
-   **Acceso Web**: Dashboard de Supabase para gestión visual de datos


## 6. Seguridad

-   **Passwords**: Hashing con `bcryptjs` (salt rounds automáticos).
-   **Session**: Stateless mediante JWT firmados. Expiración de 24h.
-   **Input**: Uso estricto de **Prepared Statements** (`db.prepare('...').run(params)`) en todas las consultas para prevenir inyección SQL.

## 7. Scripts de Utilidad

La carpeta `scripts/` contiene herramientas para administración manual:
-   `admin_grant_coins.js`: Permite otorgar Brotos a usuarios manualmente (útil para testing o soporte).
-   `cleanup_logs.js` (si existiera): Mantenimiento.
