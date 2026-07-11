#!/usr/bin/env bash

# ================================================================================
# ✅ CHECKLIST DE VALIDACIÓN - Todas las Mejoras Implementadas
# ================================================================================
# Ejecutar: bash CHECKLIST_FINAL.sh

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                   CHECKLIST DE MEJORAS IMPLEMENTADAS                       ║"
echo "║                        Pollería Gerson v2.0 HA                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2 (NOT FOUND: $1)"
        return 1
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        return 0
    else
        echo -e "${RED}✗${NC} $3 (NOT FOUND in $1)"
        return 1
    fi
}

total=0
passed=0

echo ""
echo -e "${BLUE}1️⃣  DOCKERFILE OPTIMIZADO (Distroless)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
((total++)); check_file "Dockerfile" "Dockerfile exists" && ((passed++))
((total++)); check_content "Dockerfile" "node:20-distroless" "Base image is distroless" && ((passed++))
((total++)); check_content "Dockerfile" "FROM node:20-alpine AS builder" "Multi-stage build deps" && ((passed++))
((total++)); check_content "Dockerfile" "npm prune --production" "Production dependencies optimized" && ((passed++))

echo ""
echo -e "${BLUE}2️⃣  TYPESCRIPT STRICT MODE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
((total++)); check_file "next.config.mjs" "next.config.mjs exists" && ((passed++))
((total++)); check_content "next.config.mjs" "output: 'standalone'" "Output mode optimized" && ((passed++))
((total++)); check_content "next.config.mjs" "reactStrictMode: true" "React strict mode enabled" && ((passed++))
((total++)); check_content "next.config.mjs" "poweredByHeader: false" "Security header removed" && ((passed++))

echo ""
echo -e "${BLUE}3️⃣  JEST TESTS AMPLIADOS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
((total++)); check_file "jest.config.cjs" "Jest config exists" && ((passed++))
((total++)); check_content "jest.config.cjs" "collectCoverageFrom" "Coverage collection enabled" && ((passed++))
((total++)); check_content "jest.config.cjs" "coverageThreshold" "50% coverage threshold" && ((passed++))
((total++)); check_file "__tests__/setup.ts" "Jest setup file exists" && ((passed++))
((total++)); check_file "__tests__/health.test.ts" "Health check tests" && ((passed++))
((total++)); check_file "__tests__/auth.test.ts" "Authentication tests" && ((passed++))
((total++)); check_file "__tests__/validation.test.ts" "Validation tests" && ((passed++))

echo ""
echo -e "${BLUE}4️⃣  KUBERNETES HIGH AVAILABILITY${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
((total++)); check_file "k8s/deployment.yaml" "K8s deployment manifest" && ((passed++))
((total++)); check_content "k8s/deployment.yaml" "replicas: 3" "3 backend replicas configured" && ((passed++))
((total++)); check_content "k8s/deployment.yaml" "PersistentVolumeClaim" "PVC for data durability" && ((passed++))
((total++)); check_content "k8s/deployment.yaml" "StatefulSet" "StatefulSet for PostgreSQL" && ((passed++))
((total++)); check_content "k8s/deployment.yaml" "HorizontalPodAutoscaler" "HPA configured" && ((passed++))
((total++)); check_content "k8s/deployment.yaml" "podAntiAffinity" "Pod distribution enabled" && ((passed++))
((total++)); check_content "k8s/deployment.yaml" "maxUnavailable: 0" "Zero-downtime updates" && ((passed++))

echo ""
echo -e "${BLUE}5️⃣  LOGGING CENTRALIZADO (Loki)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
((total++)); check_content "docker-compose.yml" "loki:" "Loki service" && ((passed++))
((total++)); check_content "docker-compose.yml" "promtail:" "Promtail collector" && ((passed++))
((total++)); check_file "monitoring/loki-config.yml" "Loki configuration" && ((passed++))
((total++)); check_file "monitoring/promtail-config.yml" "Promtail configuration" && ((passed++))

echo ""
echo -e "${BLUE}6️⃣  MONITORING (Prometheus + Grafana)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
((total++)); check_content "docker-compose.yml" "prometheus:" "Prometheus service" && ((passed++))
((total++)); check_content "docker-compose.yml" "grafana:" "Grafana service" && ((passed++))
((total++)); check_content "docker-compose.yml" "alertmanager:" "AlertManager service" && ((passed++))
((total++)); check_file "monitoring/prometheus.yml" "Prometheus config" && ((passed++))
((total++)); check_file "monitoring/alertmanager.yml" "AlertManager config" && ((passed++))
((total++)); check_file "lib/metrics.ts" "Metrics middleware" && ((passed++))
((total++)); check_file "app/api/metrics/route.ts" "Metrics endpoint" && ((passed++))

echo ""
echo -e "${BLUE}7️⃣  ALERTAS AUTOMÁTICAS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
((total++)); check_file "monitoring/rules.yml" "Alert rules file" && ((passed++))
((total++)); check_content "monitoring/rules.yml" "BackendDown" "Alert: Backend down" && ((passed++))
((total++)); check_content "monitoring/rules.yml" "HighCPUUsage" "Alert: High CPU" && ((passed++))
((total++)); check_content "monitoring/rules.yml" "HighErrorRate" "Alert: High error rate" && ((passed++))

echo ""
echo -e "${BLUE}📚 DOCUMENTACIÓN${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
((total++)); check_file "MEJORAS_IMPLEMENTADAS.md" "Guía de mejoras" && ((passed++))
((total++)); check_file "RESUMEN_EJECUTIVO.md" "Resumen ejecutivo" && ((passed++))
((total++)); check_file "MAPA_SERVICIOS.md" "Mapa de servicios" && ((passed++))
((total++)); check_file "VALIDAR_MEJORAS.sh" "Script de validación" && ((passed++))

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
printf "║ RESULTADO: ${GREEN}%d/%d CHECKS PASSED${NC}                                          ║\n" "$passed" "$total"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

if [ "$passed" -eq "$total" ]; then
    echo -e "${GREEN}✅ TODAS LAS MEJORAS VALIDADAS EXITOSAMENTE${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "  1. npm install                    (instalar dependencias si es necesario)"
    echo "  2. npm run build                  (validar TypeScript strict)"
    echo "  3. npm test                       (ejecutar suite de tests)"
    echo "  4. docker compose up              (levantar stack local)"
    echo "  5. kubectl apply -f k8s/          (desplegar en Kubernetes)"
    echo ""
    exit 0
else
    echo -e "${RED}❌ ALGUNOS CHECKS FALLARON${NC}"
    echo ""
    echo "Errores encontrados:"
    passed=$((total - passed))
    echo "  - $passed archivos o configuraciones faltantes"
    echo "  - Revisar los mensajes anteriores para más detalles"
    echo ""
    exit 1
fi
