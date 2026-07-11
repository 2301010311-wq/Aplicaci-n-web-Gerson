# ==================== STAGE: LINT & BUILD ====================
# Ejecuta linting y builds en contenedor
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Lint
RUN npm run lint

# TypeScript check
RUN npx tsc --noEmit

# Build
RUN npx prisma generate
ENV DATABASE_URL=postgresql://build:[REDACTED]@127.0.0.1:5432/build?schema=public
RUN npm run build

# Health check
HEALTHCHECK --interval=5s --timeout=3s --retries=3 \
  CMD ls -la .next || exit 1

CMD ["echo", "Build completed successfully"]
