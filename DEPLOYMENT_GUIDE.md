# 🚀 Guía de Despliegue - EcoHuella en Vercel

Esta guía te llevará paso a paso para desplegar tu aplicación **completa** en Vercel:
- **Frontend (React)** → Vercel
- **Backend (Node.js/Express)** → Vercel Serverless Functions
- **Base de Datos (PostgreSQL)** → Supabase (ya configurada)

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:

1. ✅ Cuenta de GitHub (o GitLab/Bitbucket)
2. ✅ Tu proyecto subido a un repositorio Git
3. ✅ API Key de GROQ (para el chatbot Golemino)
4. ✅ Una clave JWT secreta (puedes generar una nueva para producción)
5. ✅ Tu `DATABASE_URL` de Supabase (connection string de PostgreSQL)

---

## 🎯 DESPLIEGUE COMPLETO EN VERCEL

### Paso 1: Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "**Sign Up**" y selecciona "**Continue with GitHub**"
3. Autoriza a Vercel para acceder a tus repositorios

### Paso 2: Importar tu proyecto

1. Haz clic en "**Add New**" → "**Project**"
2. Busca tu repositorio `despliegue_eco_huella` (o el nombre que tenga)
3. Haz clic en "**Import**"

### Paso 3: Configurar el proyecto

En la pantalla de configuración:

1. **Framework Preset**: Selecciona "**Other**" (porque es un monorepo)
2. **Root Directory**: Déjalo en **`./`** (raíz del proyecto)
3. **Build Command**: Déjalo vacío o escribe `npm run build --prefix frontend`
4. **Output Directory**: Escribe `frontend/dist`
5. **Install Command**: `npm install --prefix frontend && npm install --prefix backend`

> **💡 Importante**: Vercel detectará automáticamente el archivo `vercel.json` en la raíz que configura tanto frontend como backend.

### Paso 4: Configurar Variables de Entorno

1. Expande la sección "**Environment Variables**"
2. Agrega las siguientes variables (haz clic en "+ Add variable"):

```
DATABASE_URL=postgresql://postgres.[proyecto]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
NODE_ENV=production
JWT_SECRET=tu-clave-secreta-muy-segura-cambia-esto
GROQ_API_KEY=tu-groq-api-key
```

**Instrucciones para obtener `DATABASE_URL` de Supabase:**

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a "**Settings**" (ícono de engranaje) → "**Database**"
3. Busca la sección "**Connection string**" → Selecciona **"URI"**
4. Copia el Connection string
5. Reemplaza `[password]` con tu contraseña real de la base de datos
6. Pégalo en la variable `DATABASE_URL` en Vercel

> **⚠️ Importante**: Asegúrate de que todas las variables se apliquen a **Production**, **Preview**, y **Development** (marca las 3 casillas).

### Paso 5: Desplegar

1. Haz clic en "**Deploy**"
2. Vercel comenzará a construir tu aplicación
3. Observa el progreso en tiempo real
4. Cuando termine (2-4 minutos), te dará una URL como: `https://tu-proyecto.vercel.app`

### Paso 6: Verificar el Despliegue

#### A) Verificar el Frontend

1. Abre la URL de Vercel en tu navegador
2. Deberías ver la página de inicio de EcoHuella
3. Intenta navegar entre páginas

#### B) Verificar el Backend (API)

1. Abre tu navegador y visita: `https://tu-proyecto.vercel.app/api/health`
2. Deberías ver:
   ```json
   {
     "status": "ok",
     "message": "Carbon Footprint API is running"
   }
   ```

#### C) Verificar la Base de Datos

**IMPORTANTE**: Tu base de datos de Supabase ya debería tener todas las tablas configuradas.

**Para verificar:**

1. Ve a tu proyecto en Supabase Dashboard
2. Haz clic en "**Table Editor**" (ícono de tabla en el menú lateral)
3. Verifica que existen las siguientes tablas:
   - `users`
   - `user_profile`
   - `challenges`
   - `user_missions`
   - `badges`
   - `user_badges`
   - `mission_history`
   - `questionnaire_results`
   - Y otras tablas del sistema

> **💡 Nota**: Si falta alguna tabla, ejecuta el script de inicialización localmente:
> ```bash
> cd backend
> node src/config/init-supabase.js
> ```

### Paso 7: Probar la Integración Completa

1. **Registro de usuario**:
   - Ve a tu app en Vercel: `https://tu-proyecto.vercel.app`
   - Crea una cuenta nueva
   - Si funciona, significa que frontend → backend → database está conectado ✅

2. **Funcionalidades principales**:
   - Inicia sesión
   - Completa el cuestionario de huella de carbono
   - Revisa el dashboard
   - Prueba las misiones diarias

### ✅ ¡Despliegue Completado!

Tu aplicación completa (frontend + backend) ahora está corriendo en Vercel.

---

## 🔄 Actualizaciones Futuras

Para actualizar tu aplicación después del despliegue inicial:

1. Haz cambios en tu código local (frontend o backend)
2. Haz `git add .` y `git commit -m "descripción del cambio"`
3. Haz `git push` a GitHub
4. **Vercel redespleará automáticamente** ✨

---

## 🐛 Solución de Problemas Comunes

### Error: "Failed to fetch" o "Network Error"

**Problema**: El frontend no puede conectarse al backend.

**Solución**:
1. Verifica que ambos (frontend y backend) estén desplegados en el mismo proyecto de Vercel
2. Abre la consola del navegador (F12) para ver errores específicos
3. Verifica que la URL de la API sea `/api` (relativa, no absoluta)
4. Revisa los logs en Vercel Dashboard → Tu proyecto → "Deployments" → Click en el deployment → "Functions"

### Error: "Database connection failed"

**Problema**: El backend no puede conectarse a PostgreSQL.

**Solución**:
1. En Vercel Dashboard, ve a tu proyecto → "Settings" → "Environment Variables"
2. Verifica que `DATABASE_URL` de Supabase está configurada correctamente
3. Verifica que la URL incluye la contraseña correcta
4. Asegúrate de que tu proyecto de Supabase está activo
5. Revisa los logs de las funciones serverless en Vercel

### Error: "Table does not exist"

**Problema**: La base de datos no está inicializada.

**Solución**:
1. Ejecuta el script de inicialización localmente (Paso 6C)
2. Verifica en Supabase Table Editor que las tablas existen

### Error: "Serverless Function has timed out"

**Problema**: Una función serverless superó el límite de tiempo.

**Solución**:
1. En el plan gratuito, las funciones tienen 10 segundos de límite
2. Para la mayoría de las requests de EcoHuella, esto es suficiente
3. Si necesitas más tiempo, considera actualizar al plan Pro de Vercel (60s de límite)
4. Optimiza las queries de base de datos para que sean más rápidas

### La página se despliega pero muestra página en blanco

**Problema**: Error de build o rutas mal configuradas.

**Solución**:
1. Verifica que `vercel.json` existe en la carpeta raíz
2. Revisa los logs de build en Vercel Dashboard
3. Verifica que el `Output Directory` está configurado como `frontend/dist`

### Error: "Module not found" en Serverless Functions

**Problema**: Dependencias no instaladas correctamente.

**Solución**:
1. Verifica que el `Install Command` incluye `npm install --prefix backend`
2. Asegúrate de que todas las dependencias están en `backend/package.json`
3. Revisa los logs de build para ver qué módulo falta

---

## 📊 Monitoreo y Logs

### Ver logs del Backend (Serverless Functions)

1. Ve a Vercel Dashboard
2. Selecciona tu proyecto
3. Ve a "**Deployments**"
4. Haz clic en el deployment actual
5. Ve a la pestaña "**Functions**"
6. Aquí verás todos los logs de tus API calls

### Ver logs del Frontend

1. En el mismo deployment
2. Ve a la pestaña "**Build Logs**"
3. Aquí verás el proceso de construcción del frontend

---

## 📝 URLs Importantes

Guarda estas URLs para referencia:

- **Aplicación (Frontend + Backend)**: `https://__________.vercel.app`
- **Health Check API**: `https://__________.vercel.app/api/health`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Supabase Dashboard**: `https://supabase.com/dashboard`

---

## ⚙️ Arquitectura del Despliegue

```
┌─────────────────────────────────────┐
│         VERCEL DEPLOYMENT            │
├─────────────────────────────────────┤
│                                     │
│  Frontend (React + Vite)            │
│  ↓ Served as Static Files           │
│  https://tu-app.vercel.app/         │
│                                     │
│  Backend (Express API)              │
│  ↓ Serverless Functions             │
│  https://tu-app.vercel.app/api/*    │
│                                     │
└──────────────┬──────────────────────┘
               │
               ↓ PostgreSQL Connection
         ┌─────────────┐
         │  SUPABASE   │
         │  Database   │
         └─────────────┘
```

---

## 🎉 ¡Felicidades!

Tu aplicación EcoHuella está completamente desplegada en Vercel con:
- ✅ Frontend accesible globalmente
- ✅ Backend API funcionando como serverless functions
- ✅ Conexión segura a base de datos Supabase
- ✅ Deploy automático en cada push a GitHub

### Ventajas de esta configuración:

- 🚀 **Todo en una plataforma**: Más simple de gestionar
- 💰 **Gratis para empezar**: Plan generoso de Vercel
- 🔄 **Auto-deploy**: Push a Git y se despliega automáticamente
- 📈 **Escalable**: Vercel maneja el escalado automáticamente
- 🌍 **CDN Global**: Tu app se sirve desde servidores cercanos a tus usuarios

---

## 🔐 Seguridad

Recuerda:
- ✅ Nunca subas archivos `.env` a Git
- ✅ Usa variables de entorno en Vercel para secretos
- ✅ Genera un nuevo `JWT_SECRET` para producción (no uses el mismo que en desarrollo)
- ✅ Mantén tu `DATABASE_URL` privada

---

## 📞 Soporte

Si encuentras problemas:
- Revisa los logs en Vercel Dashboard
- Verifica las variables de entorno
- Asegúrate de que la base de datos Supabase está activa
- Consulta la [documentación oficial de Vercel](https://vercel.com/docs)
