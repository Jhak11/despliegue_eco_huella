# 📄 Documentación Detallada de Interfaces - EcoHuella

Este documento ofrece un recorrido exhaustivo por todas las interfaces de usuario de la plataforma EcoHuella, describiendo su propósito, componentes clave y funcionalidades.

## 🗺️ Mapa de Navegación

### Rutas Públicas
- `/login` - Inicio de sesión
- `/register` - Registro de nuevos usuarios

### Rutas Protegidas (Requieren Autenticación)
- `/dashboard` - Panel principal (Inicio)
- `/gamified-profile` - Perfil de jugador (Nivel, medallas)
- `/profile` - Configuración de cuenta
- `/missions` - Centro de misiones
- `/education` - Módulos educativos
- `/pet` - Mascota virtual (Golemino)
- `/questionnaire` - Calculadora de huella
- `/results` - Resultados y análisis

---

## 1. 🔐 Autenticación

### Login (`/login`)
Interfaz de entrada para usuarios registrados.
- **Componentes**:
  - Formulario de credenciales (Email, Contraseña)
  - Botón de acción principal "Iniciar Sesión"
  - Enlace a Registro
- **Validaciones**: Campos requeridos, formato de email.
- **Feedback**: Mensajes de error en caso de credenciales inválidas.

### Registro (`/register`)
Interfaz para creación de nuevas cuentas.
- **Componentes**:
  - Formulario extendido (Nombre, Email, Contraseña, Confirmar Contraseña)
  - Selección de Avatar inicial (Emojis)
- **Funcionalidad**: Crea usuario y perfil inicial en base de datos.

---

## 2. 🏠 Núcleo de la Plataforma

### Navbar (Componente Global)
Barra de navegación persistente en la parte superior.
- **Logo**: Enlace directo al Dashboard.
- **Menú de Escritorio**: Enlaces a todas las secciones principales.
- **Menú de Usuario**: Muestra avatar y nombre, acceso a ajustes y logout.
- **Menú Móvil**: Icono de hamburguesa que despliega un drawer lateral en pantallas pequeñas.

### Dashboard (`/dashboard`)
El centro de mando del usuario. Resume toda la actividad importante.
- **Header Personalizado**: Saludo con el nombre del usuario y frase motivacional.
- **Resumen de Nivel**: Barra de progreso de XP y nivel actual.
- **Tarjetas de Resumen (KPIs)**:
  - Huella de Carbono actual (vs promedio regional).
  - Racha de días (Streak).
  - Misiones completadas hoy.
  - Brotos (moneda) disponibles.
- **Accesos Rápidos**: Botones grandes para ir a Misiones, Educación o Mascota.
- **Gráfico Miniatura**: Pequeña visualización de la tendencia de huella.

---

## 3. 👤 Identidad y Gamificación

### Perfil Gamificado (`/gamified-profile`)
La "hoja de personaje" del usuario. Enfocada en logros y progreso.
- **Tarjeta de Héroe**: Avatar grande, rango actual (ej. "Semilla", "Guardián"), nivel y barra de XP detallada.
- **Estadísticas de Juego**:
  - Total de misiones completadas.
  - Mejor racha histórica.
  - Huella de carbono reducida (estimado).
- **Vitrina de Medallas**: Grid con medallas desbloqueadas (a color) y bloqueadas (en gris con candado). Al hacer hover muestra requisitos.
- **Historial de Logros**: Línea de tiempo con los últimos eventos importantes (subida de nivel, medalla ganada).

### Configuración de Perfil (`/profile`)
Gestión de datos personales y preferencias.
- **Edición de Avatar**: Selector de emojis para cambiar la imagen de perfil.
- **Datos Personales**: Actualización de nombre y correo.
- **Seguridad**: Cambio de contraseña.
- **Preferencias**: (Futuro) Configuración de notificaciones y privacidad.

---

## 4. 🌍 Huella de Carbono

### Cuestionario (`/questionnaire`)
Herramienta de medición inicial y periódica.
- **Diseño tipo Wizard**: Formulario paso a paso para no abrumar.
- **Categorías**:
  1. **Transporte**: Vehículo propio, transporte público, vuelos.
  2. **Hogar y Energía**: Tipo de energía, consumo, electrodomésticos.
  3. **Alimentación**: Dieta (Vegana, Carnívora, etc.), origen de alimentos.
  4. **Consumo y Residuos**: Reciclaje, compra de ropa/electrónicos.
- **Feedback Inmediato**: Validación de cada paso antes de continuar.

### Resultados (`/results`)
Análisis detallado del impacto ambiental.
- **Gráfico Principal**: Visualización comparativa (Tu Huella vs Promedio Regional vs Objetivo Global).
- **Desglose por Categoría**: Gráfico de torta o barras mostrando qué sector contribuye más.
- **Recomendaciones**: Lista de acciones sugeridas basadas en la categoría con mayor impacto.
- **Historial**: Gráfico de línea mostrando la evolución de la huella mes a mes.

---

## 5. 🎮 Engagement y Retención

### Centro de Misiones (`/missions`)
Panel de retos diarios para fomentar hábitos sostenibles.
- **Selector de Misiones**: Pool de 3 misiones diarias aleatorias.
- **Tarjeta de Misión**:
  - Icono y Título.
  - Descripción breve.
  - Recompensa (XP y Brotos).
  - Estado (Pendiente, Completada).
  - Botón "Completar" (o "Verificar").
- **Barra de Progreso Diaria**: Se llena al completar las 3 misiones del día (otorga bono extra).
- **Tienda de Canje**: (Futuro) Lugar para gastar Brotos en power-ups o donaciones reales.

### Mascota Virtual - Golemino (`/pet`)
Módulo de realidad aumentada y cuidado de mascota.
- **Visor 3D**: Renderizado interactivo de Golemino (usando Three.js).
- **HUD de Estado**:
  - Barra de Salud (cambia de color según estado).
  - Contador de Brotos.
  - Fase Evolutiva actual.
- **Panel de Acciones**:
  - **Alimentar**: Gasta Brotos, sube salud.
  - **Acariciar**: Gratis (1/dia), sube salud.
  - **Curar**: Gasta Brotos, restaura salud completa.
  - **Evolucionar**: Botón especial disponible solo al cumplir requisitos.
- **Modo AR**: Botón que activa la cámara del dispositivo para superponer el modelo 3D en el mundo real.

---

## 6. 📚 Educación

### Módulo Educativo (`/education`)
Centro de aprendizaje sobre sostenibilidad.
- **Grid de Temas**: Tarjetas para diferentes áreas (Agua, Energía, Residuos, Biodiversidad).
- **Vista de Lección**:
  - Contenido rico en texto e imágenes.
  - Videos incrustados.
  - Quiz al final de la lección para validar conocimientos.
- **Barra de Progreso**: Indicador visual de qué porcentaje del curso se ha completado.

---

## 7. 🤖 Asistencia Inteligente

### EcoBot Chat (Widget Global)
Asistente virtual disponible en todas las pantallas.
- **Botón Flotante (FAB)**: Esquina inferior derecha. Abre/cierra el chat.
- **Interfaz de Chat**:
  - Historial de mensajes tipo mensajería moderna.
  - Indicador de "Escribiendo...".
- **Capacidades**:
  - Responder dudas sobre cambio climático.
  - Explicar funciones de la plataforma.
  - Dar consejos rápidos de sostenibilidad.

---

## 🎨 Guía de Estilos UI

### Paleta de Colores
- **Primario**: Verde Eco (#10B981) - Acciones principales, éxito, naturaleza.
- **Secundario**: Azul Océano (#3B82F6) - Información, enlaces, tecnología.
- **Acento**: Naranja Sol (#F59E0B) - Advertencias, medallas, monedas.
- **Fondo**: Degradados suaves (Blanco a Gris muy claro) o modo oscuro (Slate-900).

### Tipografía
- **Fuente Principal**: Inter o Roboto (Sans-serif moderna).
- **Headings**: Negrita, colores oscuros para contraste.
- **Cuerpo**: Legibilidad alta, espaciado generoso (1.5 line-height).

### Componentes UI Comunes
- **Cards (Tarjetas)**: Contenedores blancos con sombra suave (`box-shadow`), bordes redondeados (`border-radius: 12px`).
- **Botones**:
  - Primarios: Fondo sólido, texto blanco, hover con ligero brillo.
  - Secundarios: Borde sólido, fondo transparente.
  - Icon Buttons: Para acciones rápidas (cerrar, menú).
- **Modales**: Ventanas superpuestas con fondo oscurecido (backdrop blur) para confirmaciones importantes.
- **Toasts/Notificaciones**: Mensajes flotantes temporales para feedback de acciones (ej. "¡Misión completada!").
