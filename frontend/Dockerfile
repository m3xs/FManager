FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json package-lock.json ./
COPY common/package.json ./common/
COPY frontend/package.json ./frontend/

# Install all workspace dependencies
RUN npm ci

# Copy source
COPY common/ ./common/
COPY frontend/ ./frontend/

WORKDIR /app/frontend

RUN npm run build

# --- Serve with nginx ---
FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
