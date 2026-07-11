#!/bin/bash

# ================================================================================
# 🏥 HEALTH CHECK SCRIPT - Validar todos los contenedores
# ================================================================================

set -e

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMPOSE_FILE="docker-compose.jenkins.yml"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          HEALTH CHECK - Todas las Componentes                  ║"
echo "║          $TIMESTAMP                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Array de servicios y sus health checks
declare -A SERVICES=(
    [postgres]="pg_isready -U postgres"
    [backend]="curl -s http://localhost:3000/api/health"
    [loki]="curl -s http://localhost:3100/loki/api/v1/label"
    [prometheus]="curl -s http://localhost:9091/-/healthy"
    [grafana]="curl -s http://localhost:3001/api/health"
    [alertmanager]="curl -s http://localhost:9093/-/healthy"
)

echo "🔍 Checking service health..."
echo ""

healthy_count=0
total_services=${#SERVICES[@]}

for service in "${!SERVICES[@]}"; do
    check_cmd="${SERVICES[$service]}"
    
    # Obtener ID del contenedor
    container_id=$(docker compose -f "$COMPOSE_FILE" ps -q "$service" 2>/dev/null || echo "")
    
    if [ -z "$container_id" ]; then
        echo "❌ [$service] Container NOT FOUND"
        continue
    fi
    
    # Ejecutar health check
    if docker compose -f "$COMPOSE_FILE" exec -T "$service" \
        sh -c "$check_cmd" &>/dev/null; then
        echo "✅ [$service] HEALTHY"
        ((healthy_count++))
    else
        echo "⚠️  [$service] UNHEALTHY or SLOW"
    fi
done

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Healthy: $healthy_count/$total_services                                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Estadísticas de recursos
echo "📊 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null | \
    grep -E "gerson_|CONTAINER" || true

echo ""
echo "💾 Disk Usage:"
df -h | grep -E '^/dev/|Filesystem' | head -3

echo ""
echo "✅ Health check completed"
