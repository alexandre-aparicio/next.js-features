# Usamos la imagen oficial de Node
FROM node:20-alpine

# Crear directorio de la app
WORKDIR /app

# Copiar solo package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Construir la app
RUN npm run build

# Exponer el puerto
EXPOSE 6010

# Comando para arrancar Next.js en modo producción
CMD ["npm", "start"]
