#!/bin/bash

# ================================================================================
# 📦 BUILD & TEST SCRIPT - Ejecutar todos los contenedores
# ================================================================================

set -e

COMPOSE_FILE="docker-compose.jenkins.yml"
BUILD_TAG="${1:-dev}"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          BUILD ALL CONTAINERS - Tag: $BUILD_TAG                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Función para build con validación
build_container() {
    local service=$1
    local desc=$2
    
    echo "🔨 Building $desc..."
    if docker compose -f "$COMPOSE_FILE" build "$service"; then
        echo "✅ [$service] Built successfully"
        
        # Tag
        docker tag "gerson-$service:latest" "localhost:5000/gerson/$service:$BUILD_TAG" 2>/dev/null || true
    else
        echo "❌ [$service] Build FAILED"
        exit 1
    fi
    echo ""
}

# Construir en orden
build_container "postgres" "PostgreSQL"
build_container "tests" "Tests"
build_container "builder" "Builder"
build_container "backend" "Backend Runtime"
build_container "loki" "Loki Logging"
build_container "promtail" "Promtail Collector"
build_container "prometheus" "Prometheus Metrics"
build_container "grafana" "Grafana Dashboards"
build_container "alertmanager" "AlertManager"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║             ALL CONTAINERS BUILT SUCCESSFULLY                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Mostrar imágenes
echo "📊 Images Summary:"
docker images | grep -E "gerson|REPOSITORY" | head -10

echo ""
echo "✅ Build completed - Tag: $BUILD_TAG"
