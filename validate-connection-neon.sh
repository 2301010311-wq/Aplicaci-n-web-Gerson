#!/bin/bash

# Script de Validación - BD Nueva PostgreSQL 17 en Neon
# Verifica que NO hay referencias hardcodeadas a BD anterior

echo "🔍 VALIDANDO APLICACIÓN PARA NUEVA BD..."
echo "=========================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de errores
ERRORS=0

# 1. Verificar que .env existe
echo "1️⃣  Verificando archivo .env..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env existe"
else
    echo -e "${RED}✗${NC} .env NO existe"
    ERRORS=$((ERRORS+1))
fi

# 2. Verificar que DATABASE_URL no tiene [REDACTED]
echo ""
echo "2️⃣  Verificando que DATABASE_URL está completo..."
if grep -q "DATABASE_URL.*\[REDACTED\]" .env; then
    echo -e "${YELLOW}⚠️  ATENCIÓN:${NC} DATABASE_URL aún tiene [REDACTED]"
    echo "    Reemplaza [REDACTED] con tu contraseña de Neon"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✓${NC} DATABASE_URL no tiene [REDACTED] (pero verifica que sea correcto)"
fi

# 3. Verificar que no hay referencias a BD antigua
echo ""
echo "3️⃣  Verificando que NO hay referencias a BD antigua..."
FOUND_OLD_DB=0

# Buscar referencias a localhost en archivos importantes
if grep -r "localhost:5432" --include="*.ts" --include="*.tsx" --include="*.js" app/ lib/ 2>/dev/null; then
    echo -e "${RED}✗${NC} Encontrada referencia a localhost:5432 en código"
    FOUND_OLD_DB=1
    ERRORS=$((ERRORS+1))
fi

# Buscar referencias a ep-morning-cherry (BD antigua)
if grep -r "ep-morning-cherry" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.md" 2>/dev/null | grep -v "node_modules" | grep -v ".next"; then
    echo -e "${RED}✗${NC} Encontrada referencia a BD antigua (ep-morning-cherry)"
    FOUND_OLD_DB=1
    ERRORS=$((ERRORS+1))
fi

if [ $FOUND_OLD_DB -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No hay referencias a BD antigua"
fi

# 4. Verificar que Dockerfile no tiene DATABASE_URL hardcodeado
echo ""
echo "4️⃣  Verificando Dockerfile..."
if grep -q "ENV DATABASE_URL=postgresql://.*@" Dockerfile; then
    echo -e "${YELLOW}⚠️  ATENCIÓN:${NC} Dockerfile tiene DATABASE_URL hardcodeado en build stage"
    echo "    Esto es normal para build sin BD"
else
    echo -e "${GREEN}✓${NC} Dockerfile correcto (usa variables de entorno en runtime)"
fi

# 5. Verificar que existen archivos docker-compose
echo ""
echo "5️⃣  Verificando archivos Docker Compose..."
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓${NC} docker-compose.yml existe (con BD local)"
else
    echo -e "${RED}✗${NC} docker-compose.yml NO existe"
    ERRORS=$((ERRORS+1))
fi

if [ -f "docker-compose.neon.yml" ]; then
    echo -e "${GREEN}✓${NC} docker-compose.neon.yml existe (con BD Neon)"
else
    echo -e "${YELLOW}⚠️${NC} docker-compose.neon.yml NO existe (se recomienda crear)"
fi

# 6. Verificar estructura Prisma
echo ""
echo "6️⃣  Verificando estructura Prisma..."
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✓${NC} prisma/schema.prisma existe"
    # Contar tablas
    TABLE_COUNT=$(grep -c "^model " prisma/schema.prisma)
    echo "    Tablas disponibles: $TABLE_COUNT"
else
    echo -e "${RED}✗${NC} prisma/schema.prisma NO existe"
    ERRORS=$((ERRORS+1))
fi

# 7. Verificar que no hay .env en .gitignore (aunque sí debería estar)
echo ""
echo "7️⃣  Verificando .gitignore..."
if grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✓${NC} .env está en .gitignore (seguro)"
else
    echo -e "${YELLOW}⚠️${NC} .env podría NO estar en .gitignore"
    echo "    Asegúrate que .env NO se commitea a Git"
fi

# 8. Verificar variables de entorno en docker-compose
echo ""
echo "8️⃣  Verificando docker-compose variables..."
if grep -q "DATABASE_URL: \${DATABASE_URL}" docker-compose.neon.yml 2>/dev/null; then
    echo -e "${GREEN}✓${NC} docker-compose.neon.yml usa variable de entorno"
else
    echo -e "${YELLOW}⚠️${NC} docker-compose variables podrían no estar correctas"
fi

# 9. Resumen
echo ""
echo "=========================================="
echo "RESUMEN DE VALIDACIÓN"
echo "=========================================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ TODO CORRECTO - Aplicación lista para nueva BD${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Actualiza .env con tu contraseña"
    echo "2. npm run db:generate"
    echo "3. npm run db:migrate"
    echo "4. npm run db:test"
    echo "5. npm run dev"
else
    echo -e "${RED}❌ ENCONTRADOS $ERRORS PROBLEMA(S)${NC}"
    echo "Revisa los errores arriba"
fi

echo ""
