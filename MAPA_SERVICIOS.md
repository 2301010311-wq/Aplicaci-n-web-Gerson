# 🗺️ MAPA DE ACCESO A SERVICIOS

## 📍 Docker Compose (Desarrollo Local)

```
┌─────────────────────────────────────────────────────────────────┐
│                      DOCKER COMPOSE STACK                       │
└─────────────────────────────────────────────────────────────────┘

🌐 APLICACIÓN
├─ Backend (Next.js)
│  └─ http://localhost:3000
│     ├─ Health Check    → http://localhost:3000/api/health
│     ├─ Métricas        → http://localhost:3000/api/metrics
│     └─ Dashboard       → http://localhost:3000

📊 OBSERVABILIDAD
├─ Grafana (Dashboards)
│  └─ http://localhost:3001
│     ├─ User: admin
│     ├─ Password: admin123
│     └─ Datasources: Prometheus + Loki
│
├─ Prometheus (TSDB)
│  └─ http://localhost:9091
│     ├─ Targets        → http://localhost:9091/targets
│     ├─ Alerts         → http://localhost:9091/alerts
│     └─ Graph          → http://localhost:9091/graph
│
├─ Loki (Logs)
│  └─ http://localhost:3100
│     └─ API            → http://localhost:3100/loki/api/v1/push
│
├─ AlertManager
│  └─ http://localhost:9093
│     └─ Alerts View    → http://localhost:9093

🗄️ BASES DE DATOS
└─ PostgreSQL
   └─ localhost:5432
      ├─ User: ${DB_USER}
      ├─ Password: ${DB_PASSWORD}
      └─ Database: ${DB_NAME}
```

## ☸️ Kubernetes Cluster

```
┌─────────────────────────────────────────────────────────────────┐
│                      KUBERNETES NAMESPACE                       │
└─────────────────────────────────────────────────────────────────┘

NAMESPACE: gerson

📦 DEPLOYMENTS & STATEFULSETS
├─ Deployment: backend (3 replicas)
│  ├─ Pod 1: backend-xxxxx
│  ├─ Pod 2: backend-yyyyy
│  └─ Pod 3: backend-zzzzz
│
└─ StatefulSet: postgres (1 replica)
   └─ Pod: postgres-0

🔗 SERVICES
├─ Service: backend (LoadBalancer)
│  ├─ HTTP Port: 80 → 3000
│  └─ Metrics Port: 9090 → 9090
│
└─ Service: postgres (Headless)
   └─ Port: 5432

💾 STORAGE
├─ PersistentVolumeClaim: postgres-pvc
│  └─ Size: 10Gi
│
└─ PersistentVolume: pv-xxxxx
   └─ Path: /data/gerson-postgres

⚙️ CONFIGS
├─ ConfigMap: app-config
│  ├─ DB_NAME
│  ├─ NODE_ENV
│  └─ PORT
│
└─ Secret: app-secret
   ├─ DB_USER
   ├─ DB_PASSWORD
   └─ JWT_SECRET

🔄 AUTOSCALING
└─ HorizontalPodAutoscaler: backend-hpa
   ├─ Min Replicas: 3
   ├─ Max Replicas: 10
   ├─ CPU Threshold: 70%
   └─ Memory Threshold: 80%
```

---

## 🔌 API ENDPOINTS

### Health & Monitoring
```
GET  /api/health        → Health check (Docker + K8s)
GET  /api/metrics       → Prometheus metrics format
GET  /api/alerts        → Alert webhook (AlertManager)
POST /api/alerts        → Recibir alertas críticas
POST /api/alerts/critical  → Alertas críticas
POST /api/alerts/warning   → Alertas warning
```

### Autenticación
```
POST /api/auth/login       → Login (JWT)
POST /api/auth/register    → Registro
POST /api/auth/logout      → Logout
GET  /api/auth/session     → Verificar sesión
```

### Negocio (CRUD)
```
PEDIDOS
GET    /api/pedidos               → Lista de pedidos
POST   /api/pedidos               → Crear pedido
GET    /api/pedidos/{id}          → Obtener pedido
PATCH  /api/pedidos/{id}          → Actualizar estado
DELETE /api/pedidos/{id}          → Cancelar pedido

PRODUCTOS
GET    /api/productos             → Lista
POST   /api/productos             → Crear
GET    /api/productos/{id}        → Ver
PUT    /api/productos/{id}        → Actualizar
DELETE /api/productos/{id}        → Eliminar

USUARIOS
GET    /api/usuarios              → Lista (ADMIN only)
POST   /api/usuarios              → Crear
GET    /api/usuarios/{id}         → Ver
PUT    /api/usuarios/{id}         → Actualizar
DELETE /api/usuarios/{id}         → Eliminar

FINANZAS
GET    /api/finanzas/ingresos     → Ingresos
GET    /api/finanzas/gastos       → Gastos
GET    /api/finanzas/reportes     → Reportes
```

---

## 📋 CONFIGURACIÓN POR ENTORNO

### Local (docker-compose)
```bash
# Environment
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@postgres:5432/db

# Access
Backend: http://localhost:3000
Grafana: http://localhost:3001
Prometheus: http://localhost:9091
Loki: http://localhost:3100
```

### Staging (Kubernetes)
```bash
# Namespace: gerson-staging
# Replicas: 2
# Database: External RDS (recomendado)
# TLS: ✅ (Ingress)
# Monitoring: ✅ Prometheus + Grafana

# Access (Port Forward)
kubectl port-forward -n gerson-staging svc/backend 3000:80
kubectl port-forward -n gerson-staging svc/grafana 3001:3000
```

### Production (Kubernetes)
```bash
# Namespace: gerson-prod
# Replicas: 3-10 (HPA)
# Database: Managed PostgreSQL (AWS RDS, Azure DB)
# TLS: ✅ HTTPS (cert-manager)
# Monitoring: ✅ Prometheus + Grafana + AlertManager
# Logging: ✅ Centralized (Loki or ELK)

# Access (Ingress)
Backend: https://api.gerson.com
Grafana: https://monitoring.gerson.com (VPN/Private)
Prometheus: https://metrics.gerson.com (VPN/Private)
```

---

## 🔑 Credenciales & Secretos

### Default (Cambiar en Producción)
```
Grafana Admin
├─ User: admin
├─ Password: admin123
└─ Acción: Cambiar vía UI o environment

PostgreSQL
├─ User: postgres (desde .env)
├─ Password: postgres (desde .env)
└─ Database: polleria_gerson (desde .env)

JWT Secret
├─ Generado: ${JWT_SECRET} (desde .env)
└─ Usar: En requests Authorization header
```

### Obtener Secretos en K8s
```bash
# Decodificar base64
kubectl get secret app-secret -n gerson -o jsonpath='{.data.DB_USER}' | base64 -d
kubectl get secret app-secret -n gerson -o jsonpath='{.data.DB_PASSWORD}' | base64 -d
kubectl get secret app-secret -n gerson -o jsonpath='{.data.JWT_SECRET}' | base64 -d
```

---

## 📡 Comunicación Entre Servicios

### Docker Compose Internal DNS
```
backend   → postgres:5432 (DB connection)
promtail  → loki:3100 (enviar logs)
prometheus → backend:9090/api/metrics (scrape metrics)
alertmanager → backend:3000/api/alerts (webhooks)
grafana   → prometheus:9090 (datasource)
grafana   → loki:3100 (datasource)
```

### Kubernetes Internal DNS (gerson namespace)
```
backend.gerson.svc.cluster.local:3000
postgres.gerson.svc.cluster.local:5432
prometheus.gerson.svc.cluster.local:9090
loki.gerson.svc.cluster.local:3100
grafana.gerson.svc.cluster.local:3000
alertmanager.gerson.svc.cluster.local:9093
```

---

## 🎯 Matriz de Acceso por Rol

| Rol | Localhost | K8s | Producción |
|-----|-----------|-----|------------|
| **Developer** | Todos los puertos | Port-forward | VPN + SSH |
| **DevOps** | Todos | Todos | Todos |
| **QA** | App + Logs | App + Logs | App only |
| **Product Owner** | Dashboard | Dashboard | Dashboard (HTTPS) |
| **External API** | - | LoadBalancer | DNS público |

---

## 🔐 Networking & Firewall

### Docker Compose
```
Red: gerson_network (bridge)
├─ backend (puerto 3000, 9090 interno)
├─ postgres (puerto 5432 interno)
├─ loki (puerto 3100 interno)
├─ prometheus (puerto 9090 interno)
├─ grafana (puerto 3001 externo)
└─ alertmanager (puerto 9093 interno)

Puertos expuestos al host:
├─ 3000 (App)
├─ 3001 (Grafana)
├─ 5432 (PostgreSQL)
├─ 9091 (Prometheus)
└─ 9093 (AlertManager)
```

### Kubernetes Network Policies (Recomendado)
```yaml
# Solo backend puede hablar con postgres
# Solo prometheus puede scrapeear backend
# Alertmanager puede enviar webhooks a backend
```

---

## 📊 URLs Rápidas (Copiar-Pegar)

### Local Development
```
App:        http://localhost:3000
Grafana:    http://localhost:3001
Prometheus: http://localhost:9091
AlertMgr:   http://localhost:9093
Loki:       http://localhost:3100
PG Admin:   localhost:5432 (psql client)

Health:     curl http://localhost:3000/api/health
Metrics:    curl http://localhost:3000/api/metrics
```

### Kubernetes (Staging)
```
Port-forward primero:
kubectl port-forward -n gerson svc/backend 3000:80
kubectl port-forward -n gerson svc/grafana 3001:3000

Luego acceder:
http://localhost:3000
http://localhost:3001
```

---

## ⚡ Comandos Útiles

```bash
# Docker Compose
docker compose ps                           # Ver servicios
docker compose logs -f backend              # Ver logs
docker compose down -v                      # Parar y limpiar

# Kubernetes
kubectl get pods -n gerson -w               # Ver pods en tiempo real
kubectl logs -n gerson deployment/backend   # Ver logs
kubectl port-forward -n gerson svc/backend 3000:80
kubectl get hpa -n gerson                   # Ver autoscaling
kubectl describe hpa backend-hpa -n gerson

# Curl Tests
curl http://localhost:3000/api/health
curl http://localhost:3000/api/metrics | head -20
curl http://localhost:3001/api/datasources (Grafana)
```

---

**Mapa actualizado: Julio 2026 | v2.0 (Post-Mejoras)**

