#!/bin/bash

# ================================================================================
# 🚀 START & TEST SCRIPT - Levantar todos los servicios y validar
# ================================================================================

set -e

COMPOSE_FILE="docker-compose.jenkins.yml"
MAX_RETRIES=30
RETRY_INTERVAL=2

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          STARTING ALL SERVICES                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Levantar stack
echo "🚀 Starting services..."
docker compose -f "$COMPOSE_FILE" up -d

echo "⏳ Waiting for services to be healthy..."
echo ""

# Funciones de espera por servicio
wait_for_postgres() {
    echo "Waiting for PostgreSQL..."
    for i in $(seq 1 $MAX_RETRIES); do
        if docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U postgres &>/dev/null; then
            echo "✅ PostgreSQL ready"
            return 0
        fi
        echo "  Attempt $i/$MAX_RETRIES..."
        sleep $RETRY_INTERVAL
    done
    return 1
}

wait_for_backend() {
    echo "Waiting for Backend..."
    for i in $(seq 1 $MAX_RETRIES); do
        if docker compose -f "$COMPOSE_FILE" exec -T backend \
            node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" &>/dev/null; then
            echo "✅ Backend ready"
            return 0
        fi
        echo "  Attempt $i/$MAX_RETRIES..."
        sleep $RETRY_INTERVAL
    done
    return 1
}

wait_for_prometheus() {
    echo "Waiting for Prometheus..."
    for i in $(seq 1 10); do
        if curl -s http://localhost:9091/-/healthy &>/dev/null; then
            echo "✅ Prometheus ready"
            return 0
        fi
        echo "  Attempt $i/10..."
        sleep 2
    done
    return 1
}

wait_for_grafana() {
    echo "Waiting for Grafana..."
    for i in $(seq 1 10); do
        if curl -s http://localhost:3001/api/health &>/dev/null; then
            echo "✅ Grafana ready"
            return 0
        fi
        echo "  Attempt $i/10..."
        sleep 2
    done
    return 1
}

# Ejecutar esperas
wait_for_postgres || { echo "❌ PostgreSQL failed"; exit 1; }
wait_for_backend || { echo "❌ Backend failed"; exit 1; }
wait_for_prometheus || { echo "⚠️  Prometheus not ready (will retry)"; }
wait_for_grafana || { echo "⚠️  Grafana not ready (will retry)"; }

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║             ALL SERVICES STARTED SUCCESSFULLY                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# URLs de acceso
echo "📍 Access URLs:"
echo "   Backend:      http://localhost:3000"
echo "   Grafana:      http://localhost:3001 (admin/admin123)"
echo "   Prometheus:   http://localhost:9091"
echo "   AlertManager: http://localhost:9093"
echo "   Loki:         http://localhost:3100"
echo ""

# Status
echo "📊 Services Status:"
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "✅ All services ready for testing"
