# 🐾 Documentación del Módulo de Mascota (Golemino)

## Índice
1. [Descripción General](#descripción-general)
2. [Características](#características)
3. [Arquitectura](#arquitectura)
4. [Guía de Usuario](#guía-de-usuario)
5. [API Reference](#api-reference)
6. [Base de Datos](#base-de-datos)
7. [Frontend](#frontend)
8. [Configuración](#configuración)
9. [Troubleshooting](#troubleshooting)

---

## Descripción General

El **Módulo de Mascota (Golemino)** es un sistema de gamificación inmersivo que introduce una mascota virtual interactiva en 3D con capacidades de realidad aumentada. El módulo está diseñado para aumentar el engagement del usuario mediante mecánicas de cuidado, evolución y recompensas.

### Objetivos
- **Retención**: Incentivar visitas diarias mediante mecánicas de salud
- **Engagement**: Crear vínculo emocional con la mascota
- **Monetización de Brotos**: Dar utilidad a la moneda virtual del juego
- **Experiencia Inmersiva**: Ofrecer visualización 3D y AR

---

## Características

### 1. Sistema de Salud
- **Rango**: 0-100% de salud
- **Degradación**: -20 puntos por día de inactividad
- **Estados Etiquetados**:
  - 💚 **Excelente** (80-100%): Golemino completamente sano
  - 😷 **Bueno** (60-79%): Salud ligeramente reducida
  - 🤒 **Regular** (40-59%): Necesita atención
  - 🤢 **Malo** (20-39%): Estado crítico
  - ☠️ **Crítico** (0-19%): Requiere curación urgente

### 2. Sistema de Evolución
Golemino puede evolucionar a través de 3 fases:

| Fase | Costo | Escala Visual | Descripción |
|------|-------|---------------|-------------|
| **Bebé** 🪨 | - | 1x | Fase inicial, pequeño y vulnerable |
| **Joven** 🗿 | 500 Brotos | 1.5x | Fase intermedia, más robusto |
| **Titán** ⛰️ | 1500 Brotos | 2.2x | Fase final, imponente y poderoso |

**Nota**: La evolución es irreversible y permanente.

### 3. Interacciones

#### 🍃 Alimentar
- **Costo**: 20 Brotos
- **Beneficio**: +30 salud
- **Frecuencia**: Ilimitada (mientras tengas Brotos)
- **Uso**: Recuperación rápida de salud

#### ✋ Acariciar
- **Costo**: Gratis
- **Beneficio**: +5 salud
- **Frecuencia**: 1 vez cada 24 horas
- **Uso**: Interacción diaria gratuita

#### 💊 Curar
- **Costo**: 50 Brotos
- **Beneficio**: Salud → 100%
- **Frecuencia**: Ilimitada
- **Condición**: Solo disponible si está enfermo (salud < 80%)
- **Uso**: Restauración completa instantánea

#### ⭐ Evolucionar
- **Costo**: 500 (Bebé→Joven) o 1500 (Joven→Titán) Brotos
- **Beneficio**: Cambio de fase permanente
- **Frecuencia**: Una vez por fase
- **Uso**: Progresión visual y de estatus

### 4. Visualización 3D y AR

#### Modo 3D (Navegador)
- Visualizador interactivo con Three.js
- Rotación automática cuando está sano
- Control manual: zoom, pan, rotate
- Efectos de partículas flotantes:
  - 💚 Corazones cuando está sano
  - 🦠 Gérmenes cuando está enfermo
- Fondo con estrellas animadas

#### Modo AR (Realidad Aumentada)
- Acceso a cámara del dispositivo
- Visualización del Golemino en el entorno real
- Controles de posición y escala
- Funciona mejor en dispositivos móviles
- Requiere HTTPS (excepto localhost)

---

## Arquitectura

### Stack Tecnológico

**Backend**:
- Node.js + Express
- SQLite (better-sqlite3)
- JWT Authentication

**Frontend**:
- React.js
- Three.js + React Three Fiber
- @react-three/drei (helpers)
- Axios (HTTP client)

### Flujo de Datos

```
Usuario → Frontend (Pet.jsx)
    ↓
API Request (axios)
    ↓
Backend (goleminoController.js)
    ↓
Database (SQLite)
    ↓
Response → Frontend
    ↓
UI Update + 3D Rendering
```

---

## Guía de Usuario

### Acceso al Módulo
1. Inicia sesión en EcoHuella
2. Navega a **"🐾 Mi Mascota"** en el menú
3. Verás a Golemino en el visualizador 3D

### Cuidado Diario
**Rutina Recomendada**:
1. **Acaricia** a Golemino cada día (gratis, +5 salud)
2. **Alimenta** si la salud baja de 70% (20 Brotos, +30 salud)
3. **Cura** si está en estado crítico (50 Brotos, salud completa)

### Evolución
**Para evolucionar**:
1. Acumula Brotos completando misiones
2. Cuando tengas suficientes, aparecerá el botón "⭐ Evolucionar"
3. Haz clic y confirma en el modal
4. ¡Golemino cambiará de fase instantáneamente!

### Modo AR
**Activar AR**:
1. Haz clic en "📷 Modo AR"
2. Permite acceso a la cámara
3. Apunta a una superficie plana
4. Verás a Golemino en tu entorno
5. Usa gestos para mover/rotar

**Desactivar AR**:
- Haz clic en "✕ Cerrar AR"

---

## API Reference

### Base URL
```
http://localhost:3000/api/golemino
```

Todos los endpoints requieren autenticación JWT en el header:
```
Authorization: Bearer <token>
```

### Endpoints

#### 1. Obtener Estado de Golemino
```http
GET /status
```

**Response**:
```json
{
  "golemino_phase": "baby",
  "golemino_health": 85,
  "golemino_status": "healthy",
  "last_golemino_interaction": "2025-12-16T05:30:00.000Z",
  "golemino_fed_count": 12,
  "coins": 450,
  "healthLabel": "Excelente",
  "canEvolve": false
}
```

#### 2. Alimentar a Golemino
```http
POST /feed
```

**Response**:
```json
{
  "success": true,
  "message": "¡Golemino alimentado! 🍃",
  "healthGained": 30,
  "newHealth": 100,
  "newStatus": "healthy",
  "brotosSpent": 20
}
```

**Errores**:
- `400`: No tienes suficientes Brotos

#### 3. Curar a Golemino
```http
POST /heal
```

**Response**:
```json
{
  "success": true,
  "message": "¡Golemino curado completamente! 💚",
  "brotosSpent": 50
}
```

**Errores**:
- `400`: No tienes suficientes Brotos
- `400`: Golemino ya está sano

#### 4. Acariciar a Golemino
```http
POST /pet
```

**Response**:
```json
{
  "success": true,
  "message": "¡Golemino está feliz! 💚",
  "healthGained": 5,
  "newHealth": 90
}
```

**Errores**:
- `400`: Ya acariciaste a Golemino hoy (incluye `nextPetAvailable`)

#### 5. Evolucionar a Golemino
```http
POST /evolve
```

**Response**:
```json
{
  "success": true,
  "message": "¡Golemino evolucionó a YOUNG! 🎉",
  "fromPhase": "baby",
  "toPhase": "young",
  "brotosSpent": 500
}
```

**Errores**:
- `400`: Golemino ya está en su fase máxima
- `400`: Necesitas X Brotos para evolucionar

#### 6. Historial de Evoluciones
```http
GET /evolution-history
```

**Response**:
```json
[
  {
    "id": 1,
    "user_id": 5,
    "from_phase": "baby",
    "to_phase": "young",
    "brotos_spent": 500,
    "evolved_at": "2025-12-15T10:30:00.000Z"
  }
]
```

---

## Base de Datos

### Tabla: `user_profile` (Columnas de Golemino)

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `golemino_phase` | TEXT | 'baby' | Fase actual (baby/young/titan) |
| `golemino_health` | INTEGER | 100 | Salud (0-100) |
| `golemino_status` | TEXT | 'healthy' | Estado calculado |
| `last_golemino_interaction` | DATETIME | NULL | Última interacción |
| `golemino_fed_count` | INTEGER | 0 | Contador de alimentaciones |

### Tabla: `golemino_evolution_history`

```sql
CREATE TABLE golemino_evolution_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  from_phase TEXT NOT NULL,
  to_phase TEXT NOT NULL,
  brotos_spent INTEGER NOT NULL,
  evolved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Migración para Bases de Datos Existentes

Si ya tienes una base de datos, ejecuta:
```bash
cd backend
node src/config/migrateGolemino.js
```

---

## Frontend

### Componentes

#### 1. `Pet.jsx` (Página Principal)
**Ubicación**: `frontend/src/pages/Pet.jsx`

**Responsabilidades**:
- Cargar estado de Golemino desde API
- Renderizar visualizador 3D
- Manejar interacciones del usuario
- Mostrar estadísticas y controles
- Gestionar modal de evolución

**Estados**:
```javascript
const [goleminoData, setGoleminoData] = useState(null);
const [arMode, setArMode] = useState(false);
const [message, setMessage] = useState('');
const [actionLoading, setActionLoading] = useState(false);
const [showEvolutionModal, setShowEvolutionModal] = useState(false);
```

#### 2. `GoleminoModel.jsx` (Modelo 3D)
**Ubicación**: `frontend/src/components/GoleminoModel.jsx`

**Props**:
- `phase`: 'baby' | 'young' | 'titan'
- `status`: 'healthy' | 'sick_mild' | 'sick_moderate' | 'sick_severe' | 'sick_critical'
- `health`: 0-100

**Características**:
- Carga modelos .glb dinámicamente
- Fallback a cubo placeholder si no hay modelo
- Escala según fase
- Color según salud
- Soporte para animaciones

#### 3. `ARViewer.jsx` (Visor AR)
**Ubicación**: `frontend/src/components/ARViewer.jsx`

**Props**:
- `isActive`: boolean
- `onClose`: function
- `children`: React nodes (modelo 3D)

**Características**:
- Acceso a cámara trasera
- Overlay de canvas 3D
- Controles de AR
- Manejo de errores

### Estilos

**Archivo**: `frontend/src/pages/Pet.css`

**Características visuales**:
- Gradiente animado de fondo
- Glassmorphism en paneles
- Partículas flotantes CSS
- Barra de salud con gradiente
- Botón de evolución con efecto shimmer
- Diseño responsive

---

## Configuración

### Modelos 3D

**Ubicación**: `frontend/public/models/`

**Archivos requeridos**:
- `golemino_baby.glb`
- `golemino_young.glb`
- `golemino_titan.glb`

**Especificaciones**:
- Formato: GLB (binary glTF)
- Tamaño: < 5MB por modelo
- Animaciones opcionales: idle, sick, happy

**Placeholder**:
Actualmente se usa un cubo de colores como placeholder. El color cambia según la salud.

### Variables de Entorno

No se requieren variables específicas para el módulo de mascota. Usa las mismas del proyecto principal.

---

## Troubleshooting

### Error: "no such column: golemino_phase"

**Causa**: Base de datos creada antes de agregar el módulo.

**Solución**:
```bash
cd backend
node src/config/migrateGolemino.js
```

### Error: "Cannot read properties of undefined (reading 'forEach')"

**Causa**: Modelos 3D no encontrados.

**Solución**: Ya está solucionado en la versión actual. El componente usa un placeholder automáticamente.

### Error 400 al acariciar

**Causa**: `last_golemino_interaction` era NULL.

**Solución**: Ya está solucionado. Ahora permite primera interacción sin validación.

### Modo AR no funciona

**Posibles causas**:
1. **Navegador no soporta WebXR**: Usa Chrome/Edge en Android o Safari en iOS
2. **Sin HTTPS**: AR requiere conexión segura (localhost está exento)
3. **Permisos de cámara**: Verifica que el navegador tenga acceso

**Solución**:
- Usa dispositivo móvil moderno
- Permite acceso a cámara cuando se solicite
- Si estás en producción, asegúrate de usar HTTPS

### Salud no se degrada automáticamente

**Causa**: El servicio de degradación no está ejecutándose.

**Solución futura**: Implementar cron job:
```javascript
import cron from 'node-cron';
import { updateAllGoleminoHealth } from './services/goleminoHealthService.js';

// Ejecutar diariamente a las 00:00
cron.schedule('0 0 * * *', () => {
  updateAllGoleminoHealth();
});
```

---

## Próximas Mejoras

### Corto Plazo
- [ ] Modelos 3D reales (actualmente placeholder)
- [ ] Animaciones de idle, sick, happy
- [ ] Sonidos para interacciones
- [ ] Notificaciones push cuando Golemino está enfermo

### Mediano Plazo
- [ ] Accesorios comprables (sombreros, collares)
- [ ] Mini-juegos con Golemino
- [ ] Compartir fotos AR en redes sociales
- [ ] Personalización de nombre

### Largo Plazo
- [ ] Múltiples especies de mascotas
- [ ] Sistema de cría
- [ ] Batallas PvP
- [ ] Marketplace de accesorios

---

## Recursos Adicionales

### Documentación Técnica
- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [WebXR API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)

### Obtener Modelos 3D
- [Sketchfab](https://sketchfab.com) - Modelos gratuitos y premium
- [Poly Pizza](https://poly.pizza) - Modelos low-poly gratuitos
- [Quaternius](https://quaternius.com) - Modelos game-ready gratuitos

### Herramientas de Creación
- [Blender](https://www.blender.org/) - Software 3D gratuito
- [Blockbench](https://www.blockbench.net/) - Editor voxel/blocky
- [MagicaVoxel](https://ephtracy.github.io/) - Editor voxel

---

## Contacto y Soporte

Para reportar bugs o sugerir mejoras del módulo de mascota, abre un issue en el repositorio del proyecto.

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2025  
**Autor**: EcoHuella Team
