FROM node:20-alpine

WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json package-lock.json ./
COPY common/package.json ./common/
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install all workspace dependencies
RUN npm ci

# Copy source
COPY common/ ./common/
COPY backend/ ./backend/

WORKDIR /app/backend

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
