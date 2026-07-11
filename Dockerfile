# ==================== STAGE 1: DEPENDENCIES ====================
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ==================== STAGE 2: BUILDER ====================
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
ENV DATABASE_URL=postgresql://build:[REDACTED]@127.0.0.1:5432/build?schema=public
RUN npm run build && npm prune --production

# ==================== STAGE 3: PRODUCTION RUNTIME ====================
# Usando Alpine (compatible, funcional, ~170MB)
# Distroless optimización futura cuando esté probado en prod
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copiar solo lo necesario desde builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Health check (Alpine tiene wget/curl)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -q --spider http://localhost:3000/api/health || exit 1

# Ejecutar migraciones y start
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
