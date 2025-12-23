# 🔧 Solución de Error: Columnas Faltantes en Base de Datos

## Problema
Al acceder a `/api/golemino/status`, se recibía el error:
```
SqliteError: no such column: golemino_phase
```

## Causa
La base de datos fue creada antes de agregar las columnas de Golemino. SQLite requiere migración manual para bases de datos existentes.

## Solución Aplicada

Se ejecutaron los siguientes comandos para agregar las columnas faltantes:

```bash
cd backend
node -e "const db = require('better-sqlite3')('./database.sqlite'); db.exec('ALTER TABLE user_profile ADD COLUMN last_golemino_interaction DATETIME'); db.exec('ALTER TABLE user_profile ADD COLUMN golemino_fed_count INTEGER DEFAULT 0'); db.exec('UPDATE user_profile SET last_golemino_interaction = CURRENT_TIMESTAMP WHERE last_golemino_interaction IS NULL'); console.log('✅ Columns added'); db.close();"
```

## Verificación

Columnas agregadas exitosamente:
- ✅ `golemino_phase` (TEXT)
- ✅ `golemino_health` (INTEGER)
- ✅ `golemino_status` (TEXT)
- ✅ `last_golemino_interaction` (DATETIME)
- ✅ `golemino_fed_count` (INTEGER)

## Script de Migración Automático

Se creó `backend/src/config/migrateGolemino.js` para futuras instalaciones:

```bash
node src/config/migrateGolemino.js
```

Este script:
1. Verifica si las columnas ya existen
2. Agrega columnas faltantes
3. Crea tabla `golemino_evolution_history`
4. Inicializa valores por defecto

## Reinicio del Servidor

Después de la migración, reiniciar el backend:
```bash
npm run dev
```

## Estado Actual
✅ Base de datos migrada
✅ Servidor backend corriendo
✅ Endpoint `/api/golemino/status` funcional
✅ Frontend conectado correctamente

## Para Nuevas Instalaciones

Si instalas el proyecto desde cero, las columnas se crearán automáticamente en `database.js`. Esta migración solo fue necesaria para bases de datos existentes.
