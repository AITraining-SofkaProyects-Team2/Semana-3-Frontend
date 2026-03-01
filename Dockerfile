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

# Copiar entrypoint para inyectar variables en runtime
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
