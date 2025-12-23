# Imagen base
FROM node:20-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto del backend
EXPOSE 3000

# Comando de arranque (producción)
CMD ["npm", "start"]