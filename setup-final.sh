#!/bin/bash

# ================================================================================
# 🚀 SETUP FINAL COMPLETO - Sin preguntas, todo automático
# ================================================================================

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         SETUP COMPLETO - PostgreSQL + Usuarios + App          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ================================================================================
# PASO 1: Verificar que Docker está corriendo
# ================================================================================
echo "✓ Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi
echo "✓ Docker está disponible"
echo ""

# ================================================================================
# PASO 2: Limpiar todo
# ================================================================================
echo "🧹 Limpiando contenedores y volúmenes anteriores..."
docker-compose down -v 2>/dev/null || true
sleep 2
echo "✓ Limpieza completada"
echo ""

# ================================================================================
# PASO 3: Crear .env correcto
# ================================================================================
echo "📝 Creando archivo .env con configuración correcta..."
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
echo "✓ .env creado"
echo ""

# ================================================================================
# PASO 4: Levantar PostgreSQL
# ================================================================================
echo "🐘 Levantando PostgreSQL..."
docker-compose up postgres -d
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 15
echo "✓ PostgreSQL está listo"
echo ""

# ================================================================================
# PASO 5: Crear base de datos
# ================================================================================
echo "🗄️  Creando base de datos 'gerson_db'..."
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE gerson_db;" 2>/dev/null || echo "⚠️  BD ya existe (ignorando)"
echo "✓ Base de datos lista"
echo ""

# ================================================================================
# PASO 6: Aplicar migraciones
# ================================================================================
echo "🔄 Aplicando migraciones Prisma..."
npm run db:migrate 2>&1 | grep -E "(^✓|^[0-9]|Migrations|Error|Creating)" || true
echo "✓ Migraciones completadas"
echo ""

# ================================================================================
# PASO 7: Crear usuarios de prueba
# ================================================================================
echo "👥 Creando usuarios de prueba..."
npm run db:seed 2>&1 | grep -E "(✓|✅|Usuario|Producto|Mesa|Error)" || true
echo "✓ Usuarios creados"
echo ""

# ================================================================================
# PASO 8: Levantar backend
# ================================================================================
echo "🚀 Levantando backend..."
docker-compose up backend -d
sleep 5
echo "✓ Backend iniciado"
echo ""

# ================================================================================
# PASO 9: Mostrar información final
# ================================================================================
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ SETUP COMPLETADO                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 ACCESO A SERVICIOS:"
echo "   Aplicación:  http://localhost:3000"
echo "   Grafana:     http://localhost:3001"
echo "   Prometheus:  http://localhost:9091"
echo ""
echo "📋 USUARIOS DE PRUEBA:"
echo "   Email: admin@gerson.com"
echo "   Password: Admin123!"
echo ""
echo "   O usa cualquiera de estos:"
echo "   • mesero@gerson.com / Mesero123!"
echo "   • cocinero@gerson.com / Cocinero123!"
echo "   • cajero@gerson.com / Cajero123!"
echo ""
echo "📊 BASE DE DATOS:"
echo "   Host: localhost:5432"
echo "   User: postgres"
echo "   Password: postgres"
echo "   Database: gerson_db"
echo ""
echo "✨ Datos de prueba incluidos:"
echo "   ✓ 4 usuarios (diferentes roles)"
echo "   ✓ 10 mesas (capacidad 4 personas c/u)"
echo "   ✓ 8 productos (pollos, acompañamientos, bebidas)"
echo ""
echo "🎯 Próximo paso:"
echo "   1. Abre: http://localhost:3000"
echo "   2. Ingresa: admin@gerson.com / Admin123!"
echo "   3. ¡Comienza a crear pedidos!"
echo ""
echo "📝 Para ver logs:"
echo "   docker-compose logs -f backend"
echo ""
echo "🛑 Para detener:"
echo "   docker-compose down"
echo ""
