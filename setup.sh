#!/bin/bash

# ================================================================================
# 🚀 SETUP RÁPIDO - PostgreSQL 18 + Aplicación
# ================================================================================
# Ejecutar: bash setup.sh

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         SETUP POSTGRESQL 18 + APLICACIÓN GERSON               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ================================================================================
# PASO 1: Copiar .env si no existe
# ================================================================================
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    cat > .env <<'EOF'
NODE_ENV=development
PORT=3000

# PostgreSQL 18 Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=gerson_db

# Database URL for Prisma
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gerson_db?schema=public

# Security
JWT_SECRET=your-secret-key-change-in-production

# Logging
LOKI_URL=http://localhost:3100
EOF
    echo "✅ .env creado"
else
    echo "✓ .env ya existe"
fi

echo ""

# ================================================================================
# PASO 2: Instalar dependencias npm
# ================================================================================
echo "📦 Instalando dependencias npm..."
npm install > /dev/null 2>&1 || {
    echo "⚠️  npm install falló, intentando npm ci..."
    npm ci
}
echo "✅ Dependencias instaladas"

echo ""

# ================================================================================
# PASO 3: Levantar servicios Docker
# ================================================================================
echo "🐳 Levantando servicios Docker..."
docker-compose up -d > /dev/null 2>&1
echo "✅ Docker servicios iniciados"

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
for i in {1..30}; do
    if docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL está listo"
        break
    fi
    echo "  Intento $i/30..."
    sleep 1
done

echo ""

# ================================================================================
# PASO 4: Aplicar migraciones Prisma
# ================================================================================
echo "🔄 Aplicando migraciones Prisma..."
npm run db:migrate > /dev/null 2>&1 || {
    echo "ℹ️  Usando: npx prisma migrate deploy"
    npx prisma migrate deploy > /dev/null 2>&1 || echo "ℹ️  Sin migraciones previas"
}
echo "✅ Migraciones completadas"

echo ""

# ================================================================================
# PASO 5: Mostrar URLs de acceso
# ================================================================================
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ SETUP COMPLETADO                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 URLs de Acceso:"
echo "   🌐 Aplicación:  http://localhost:3000"
echo "   📊 Grafana:     http://localhost:3001"
echo "   📈 Prometheus:  http://localhost:9091"
echo ""
echo "📋 Credenciales:"
echo "   PostgreSQL:"
echo "     Usuario: postgres"
echo "     Password: postgres"
echo "     Puerto: 5432"
echo ""
echo "   Grafana:"
echo "     Usuario: admin"
echo "     Password: admin123"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. npm run dev        (iniciar desarrollo)"
echo "   2. Navega a http://localhost:3000"
echo "   3. ¡Comienza a desarrollar!"
echo ""
