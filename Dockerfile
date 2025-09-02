# Estágio 1: Build com Node.js
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
# O VITE_API_BASE_URL será passado no momento do build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Estágio 2: Servidor web com Nginx
FROM nginx:stable-alpine
# Copia os arquivos estáticos gerados no estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html
# Copia a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]