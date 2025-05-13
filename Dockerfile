# ------------- Fase de construcción -------------
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar los archivos de dependencias para aprovechar el caché
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci --silent

# Copiar todo el código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build --prod

# ------------- Fase de producción -------------
FROM nginx:1.25-alpine

# Eliminar el contenido predeterminado de Nginx para evitar que se muestre la página por defecto
RUN rm -rf /usr/share/nginx/html/*

# Crear directorio para los certificados SSL
RUN mkdir -p /etc/nginx/ssl

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar certificados SSL (asegúrate de que estos archivos estén en el mismo directorio que tu Dockerfile)
COPY ./ssl/pronunciapp_me.crt /etc/nginx/ssl/
COPY ./ssl/pronunciapp.me.key /etc/nginx/ssl/
COPY ./ssl/pronunciapp_me.ca-bundle /etc/nginx/ssl/

# Copiar los archivos construidos desde la fase de build
# Se usa el directorio correcto según el "outputPath" de tu angular.json
COPY --from=build /app/dist/frontend-pronunci-app/ /usr/share/nginx/html

# Exponer el puerto 80 (HTTP)
EXPOSE 80 443

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
