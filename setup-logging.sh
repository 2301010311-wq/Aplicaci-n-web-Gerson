#!/bin/bash

# ============================================
# Script de Instalación de Logging Estructurado
# ============================================
# 
# Uso: bash setup-logging.sh
#
# Este script:
# 1. Instala Pino y sus dependencias
# 2. Crea/actualiza archivos de logger
# 3. Muestra instrucciones siguientes

set -e  # Exit on error

echo "🚀 Iniciando instalación de Logging Estructurado..."
echo ""

# ============================================
# 1. Instalar dependencias
# ============================================

echo "📦 Instalando dependencias..."
echo ""

# Detectar gestor de paquetes
if [ -f "pnpm-lock.yaml" ]; then
    PACKAGE_MANAGER="pnpm"
    INSTALL_CMD="pnpm add"
    ADD_DEV_CMD="pnpm add -D"
elif [ -f "package-lock.json" ]; then
    PACKAGE_MANAGER="npm"
    INSTALL_CMD="npm install"
    ADD_DEV_CMD="npm install --save-dev"
elif [ -f "yarn.lock" ]; then
    PACKAGE_MANAGER="yarn"
    INSTALL_CMD="yarn add"
    ADD_DEV_CMD="yarn add --dev"
else
    echo "❌ No se encontró gestor de paquetes (pnpm, npm o yarn)"
    exit 1
fi

echo "✅ Usando gestor: $PACKAGE_MANAGER"
echo ""

# Instalar dependencias de producción
echo "⏳ Instalando pino..."
$INSTALL_CMD pino

# Instalar dependencias de desarrollo
echo "⏳ Instalando pino-pretty y tipos..."
$ADD_DEV_CMD pino-pretty @types/pino

echo "✅ Dependencias instaladas"
echo ""

# ============================================
# 2. Verificar archivos
# ============================================

echo "📁 Verificando archivos necesarios..."
echo ""

# Verificar que existan los archivos creados
if [ -f "lib/logger.ts" ]; then
    echo "✅ lib/logger.ts"
else
    echo "⚠️  lib/logger.ts no encontrado"
fi

if [ -f "lib/logging-middleware.ts" ]; then
    echo "✅ lib/logging-middleware.ts"
else
    echo "⚠️  lib/logging-middleware.ts no encontrado"
fi

echo ""

# ============================================
# 3. Mostrar instrucciones
# ============================================

echo "🎯 Próximos pasos:"
echo ""
echo "1️⃣  Refactorizar un endpoint (ejemplo: app/api/usuarios/[id]/route.ts)"
echo "   - Importar: import logger from '@/lib/logger'"
echo "   - Importar: import { withApiLogging } from '@/lib/logging-middleware'"
echo "   - Reemplazar console.log() con logger.info()"
echo "   - Reemplazar console.error() con logger.error()"
echo ""
echo "2️⃣  Ver el archivo de ejemplo:"
echo "   - EJEMPLO_REFACTORIZACION_LOGGING.ts"
echo ""
echo "3️⃣  Iniciar desarrollo con logging:"
echo "   - $PACKAGE_MANAGER dev"
echo ""
echo "4️⃣  Hacer un request de prueba:"
echo "   - curl -X PUT http://localhost:3000/api/usuarios/123 \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'x-request-id: test-123' \\"
echo "     -d '{\"nombre\": \"Test\", \"email\": \"test@example.com\", \"rol\": \"admin\"}'"
echo ""
echo "5️⃣  Ver los logs estructurados en la terminal"
echo ""

# ============================================
# 4. Mostrar resumen
# ============================================

echo "📊 Resumen:"
echo "  ✅ Pino instalado"
echo "  ✅ Logging middleware creado"
echo "  ✅ Logger configurado"
echo ""
echo "🎓 Documentación:"
echo "  - LOGGING_ESTRUCTURADO.md (Guía completa)"
echo "  - DEMO_LOGGING_TERMINAL.md (Ejemplos de salida)"
echo "  - EJEMPLO_REFACTORIZACION_LOGGING.ts (Código de ejemplo)"
echo ""
echo "✨ ¡Logging estructurado listo para usar!"
echo ""
