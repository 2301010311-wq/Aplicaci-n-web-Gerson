#!/bin/bash

# ================================================================================
# ✅ VALIDACIÓN PRE-PUSH - Verificar todos los Dockerfiles antes de subir a GitHub
# ================================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         VALIDACIÓN PRE-PUSH - DOCKERFILES & CONFIG             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

errors=0
warnings=0

# Función para check
check_dockerfile() {
    local dockerfile=$1
    local name=$2
    
    if [ ! -f "$dockerfile" ]; then
        echo -e "${RED}✗${NC} [$name] Dockerfile NO ENCONTRADO: $dockerfile"
        ((errors++))
        return 1
    fi
    
    echo -e "${GREEN}✓${NC} [$name] Dockerfile exists"
    
    # Verificar imágenes base válidas
    local base_image=$(grep "^FROM" "$dockerfile" | head -1 | awk '{print $2}')
    
    if [[ "$base_image" == *"distroless"* ]]; then
        if [[ "$base_image" != "gcr.io/distroless/"* ]]; then
            echo -e "${RED}  ✗ Distroless image incorrecta: $base_image${NC}"
            echo -e "    CORRECTO: gcr.io/distroless/nodejs20-debian12"
            ((errors++))
        else
            echo -e "  ✓ Distroless image válida"
        fi
    else
        echo -e "  ✓ Base image: $base_image"
    fi
    
    return 0
}

# ================================================================================
# VALIDAR DOCKERFILES PRINCIPALES
# ================================================================================
echo -e "${BLUE}1. Validando Dockerfiles Principales${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_dockerfile "Dockerfile" "Dockerfile principal" || true
check_dockerfile "docker/Dockerfile.postgres" "PostgreSQL" || true
check_dockerfile "docker/Dockerfile.tests" "Tests" || true
check_dockerfile "docker/Dockerfile.builder" "Builder" || true
check_dockerfile "docker/Dockerfile.runtime" "Runtime" || true
check_dockerfile "docker/Dockerfile.loki" "Loki" || true
check_dockerfile "docker/Dockerfile.promtail" "Promtail" || true
check_dockerfile "docker/Dockerfile.prometheus" "Prometheus" || true
check_dockerfile "docker/Dockerfile.grafana" "Grafana" || true
check_dockerfile "docker/Dockerfile.alertmanager" "AlertManager" || true

echo ""

# ================================================================================
# VALIDAR docker-compose.yml
# ================================================================================
echo -e "${BLUE}2. Validando docker-compose Files${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}✗${NC} docker-compose.yml NO ENCONTRADO"
    ((errors++))
else
    echo -e "${GREEN}✓${NC} docker-compose.yml existe"
    # Validar sintaxis YAML (básico)
    if docker compose -f docker-compose.yml config > /dev/null 2>&1; then
        echo -e "  ✓ Sintaxis YAML válida"
    else
        echo -e "${YELLOW}⚠${NC}  Advertencia: No se pudo validar sintaxis YAML (docker compose no disponible)"
        ((warnings++))
    fi
fi

if [ ! -f "docker-compose.jenkins.yml" ]; then
    echo -e "${RED}✗${NC} docker-compose.jenkins.yml NO ENCONTRADO"
    ((errors++))
else
    echo -e "${GREEN}✓${NC} docker-compose.jenkins.yml existe"
    if docker compose -f docker-compose.jenkins.yml config > /dev/null 2>&1; then
        echo -e "  ✓ Sintaxis YAML válida"
    else
        echo -e "${YELLOW}⚠${NC}  Advertencia: No se pudo validar sintaxis YAML"
        ((warnings++))
    fi
fi

echo ""

# ================================================================================
# VALIDAR JENKINSFILES
# ================================================================================
echo -e "${BLUE}3. Validando Jenkinsfiles${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for jenkinsfile in Jenkinsfile Jenkinsfile.modular Jenkinsfile.simple; do
    if [ -f "$jenkinsfile" ]; then
        echo -e "${GREEN}✓${NC} $jenkinsfile existe"
    else
        echo -e "${YELLOW}⚠${NC}  $jenkinsfile NO encontrado (opcional)"
        ((warnings++))
    fi
done

echo ""

# ================================================================================
# VALIDAR MONITORING CONFIGS
# ================================================================================
echo -e "${BLUE}4. Validando Archivos de Monitoreo${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

monitoring_files=(
    "monitoring/loki-config.yml"
    "monitoring/promtail-config.yml"
    "monitoring/prometheus.yml"
    "monitoring/alertmanager.yml"
    "monitoring/rules.yml"
)

for file in "${monitoring_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file existe"
    else
        echo -e "${RED}✗${NC} $file NO ENCONTRADO"
        ((errors++))
    fi
done

echo ""

# ================================================================================
# VALIDAR SCRIPTS
# ================================================================================
echo -e "${BLUE}5. Validando Scripts Auxiliares${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

scripts=(
    "scripts/health-check.sh"
    "scripts/build-all.sh"
    "scripts/start-all.sh"
)

for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        echo -e "${GREEN}✓${NC} $script existe"
        if [ -x "$script" ]; then
            echo -e "  ✓ Es ejecutable"
        else
            echo -e "${YELLOW}⚠${NC}  No es ejecutable (chmod +x recomendado)"
            ((warnings++))
        fi
    else
        echo -e "${YELLOW}⚠${NC}  $script NO encontrado (opcional)"
        ((warnings++))
    fi
done

echo ""

# ================================================================================
# VALIDAR TESTS
# ================================================================================
echo -e "${BLUE}6. Validando Test Files${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_files=(
    "__tests__/health.test.ts"
    "__tests__/auth.test.ts"
    "__tests__/validation.test.ts"
    "__tests__/setup.ts"
)

for test in "${test_files[@]}"; do
    if [ -f "$test" ]; then
        echo -e "${GREEN}✓${NC} $test existe"
    else
        echo -e "${YELLOW}⚠${NC}  $test NO encontrado"
        ((warnings++))
    fi
done

echo ""

# ================================================================================
# VALIDAR DOCUMENTACIÓN
# ================================================================================
echo -e "${BLUE}7. Validando Documentación${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

docs=(
    "JENKINS_GUIA_COMPLETA.md"
    "JENKINS_RESUMEN_VISUAL.md"
    "ANALISIS_ERRORES.md"
    "INDICE_JENKINS_COMPLETO.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc existe"
    else
        echo -e "${YELLOW}⚠${NC}  $doc NO encontrado"
        ((warnings++))
    fi
done

echo ""

# ================================================================================
# RESUMEN FINAL
# ================================================================================
echo "╔════════════════════════════════════════════════════════════════╗"
printf "║ RESULTADO: ${GREEN}Errors: $errors${NC}, ${YELLOW}Warnings: $warnings${NC}                                   ║\n"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ VALIDACIÓN EXITOSA - Listo para push a GitHub${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "  1. git add ."
    echo "  2. git commit -m 'Fix: Corregir Dockerfiles y validar antes de push'"
    echo "  3. git push origin main"
    echo ""
    exit 0
else
    echo -e "${RED}❌ VALIDACIÓN FALLIDA - Se encontraron $errors errores${NC}"
    echo ""
    echo "Errores a corregir:"
    echo "  - Revisar Dockerfiles con imágenes inválidas"
    echo "  - Verificar paths en docker-compose.yml"
    echo "  - Validar archivos de configuración"
    echo ""
    exit 1
fi
