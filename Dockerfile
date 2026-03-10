# =============================
# Build stage
# =============================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# =============================
# Runtime stage
# =============================
FROM nginx:alpine

# Reemplazar config por defecto de nginx con nuestra config SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

LABEL org.opencontainers.image.source=https://github.com/AITraining-SofkaProyects-Team2/Semana-3-Frontend

CMD ["nginx", "-g", "daemon off;"]
