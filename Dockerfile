# ------------- Fase de construcción -------------
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias para aprovechar el caché
COPY package.json package-lock.json ./

# Instalar dependencias (sin salida innecesaria)
RUN npm ci --silent

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build --prod

# ------------- Fase de producción -------------
FROM nginx:1.25-alpine

# Eliminar el contenido predeterminado de Nginx (opcional pero recomendable)
RUN rm -rf /usr/share/nginx/html/*

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos desde la fase de build.
# Asegúrate de que "frontend-PronunciAPP" sea el nombre correcto que se genera
# en la carpeta dist (consulta angular.json: "outputPath").
COPY --from=build /app/dist/frontend-PronunciAPP/ /usr/share/nginx/html

# Exponer el puerto 80 (HTTP)
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
