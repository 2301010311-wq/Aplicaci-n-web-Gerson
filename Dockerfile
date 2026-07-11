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

# ==================== STAGE 3: DISTROLESS RUNTIME ====================
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
COPY --from=builder /app/middleware.ts ./

EXPOSE 3000

# Distroless no tiene curl, usar node para health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -q --spider http://localhost:3000/api/health || exit 1

CMD ["sh", "-c", "npm run db:deploy && npm run start"]
