# 🚀 GUÍA COMPLETA - JENKINS + 7 CONTENEDORES MODULARES

## 📊 Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        JENKINS PIPELINE                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼────────┐      │      ┌───────▼────────┐
            │  PostgreSQL    │      │      │     Tests      │
            │  (Database)    │      │      │  (Unit Tests)  │
            └────────────────┘      │      └────────────────┘
                                    │
                              ┌─────▼──────┐
                              │  Builder   │
                              │ Build+Lint │
                              └─────┬──────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
        ┌───────▼────────┐   ┌──────▼──────┐   ┌───────▼────────┐
        │  Backend ⚡    │   │Logging:     │   │  Monitoring    │
        │  (Distroless)  │   │ Loki+       │   │  Prometheus+   │
        │  ~100MB        │   │ Promtail    │   │  Grafana       │
        └────────────────┘   └─────────────┘   └────────────────┘
                │
                │ Integration Tests
                │
        ┌───────▼────────┐
        │  AlertManager  │
        │  (Alerting)    │
        └────────────────┘
```

---

## 🔧 INSTALACIÓN & CONFIGURACIÓN

### 1. Requisitos
```bash
# Jenkins (con Docker plugin)
brew install jenkins
# o docker run -d -p 8080:8080 jenkins/jenkins:lts

# Docker & Docker Compose
docker --version      # >= 20.10
docker compose version  # >= 2.0

# Git (para clonar repo)
git --version

# kubectl (para Kubernetes, opcional)
kubectl version --client
```

### 2. Plugins Jenkins Necesarios
```
Manage Jenkins → Manage Plugins → Available

Instalar:
- Docker plugin
- Docker Compose plugin
- Pipeline plugin (ya incluido)
- GitLab / GitHub plugin
- Email Extension plugin (notificaciones)
- Timestamper plugin
- AnsiColor plugin (logs coloreados)
```

### 3. Configurar Jenkins para Docker
```bash
# Jenkins debe poder ejecutar Docker
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# O si está en contenedor
# Montar socket de Docker
docker run -d \
  -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
```

---

## 🎯 CREAR PIPELINE EN JENKINS

### Opción A: Pipeline desde SCM (Recomendado)

1. **New Item → Pipeline**
   ```
   Name: polleria-gerson-modular
   Type: Pipeline
   ```

2. **Pipeline Configuration**
   ```
   Definition: Pipeline script from SCM
   SCM: Git
   Repository URL: https://github.com/tu-usuario/Aplicacion-web-Gerson
   Branch: */main
   Script Path: Jenkinsfile.modular
   ```

3. **Build Triggers**
   ```
   ✓ Poll SCM: H H * * * (cada 24 horas)
   ✓ GitHub push trigger: (si usas GitHub)
   ```

### Opción B: Pipeline Inline

1. **New Item → Pipeline**
2. **Pipeline → Definition: Pipeline script**
3. **Copy-paste del contenido de `Jenkinsfile.modular`**

---

## 📦 ESTRUCTURA DE CONTENEDORES

### Cada contenedor ejecuta su propia tarea:

| # | Contenedor | Imagen | Puerto | Función | Tiempo Build |
|---|-----------|--------|--------|---------|--------------|
| 1 | **PostgreSQL** | postgres:16-alpine | 5432 | Base de datos | 1-2 min |
| 2 | **Tests** | node:20-alpine | - | Unit tests + coverage | 2-3 min |
| 3 | **Builder** | node:20-alpine | - | Lint + TypeScript | 2-3 min |
| 4 | **Backend** | node:20-distroless | 3000 | Production (~100MB) | 3-5 min |
| 5 | **Loki** | grafana/loki | 3100 | Centralized logs | <1 min |
| 6 | **Prometheus** | prom/prometheus | 9091 | Metrics TSDB | <1 min |
| 7 | **Grafana** | grafana/grafana | 3001 | Dashboards | 1-2 min |
| 8 | **AlertManager** | prom/alertmanager | 9093 | Alerting | <1 min |

**Tiempo total build: ~12-18 minutos (con etapas paralelas)**

---

## 🚀 EJECUTAR PIPELINE

### Opción 1: Desde Jenkins UI
```
1. Abre http://localhost:8080
2. Selecciona "polleria-gerson-modular"
3. Click "Build Now"
4. Observa en real-time: Logs → Stage View → Console Output
```

### Opción 2: Desde CLI
```bash
# Trigger build
curl -X POST http://localhost:8080/job/polleria-gerson-modular/build

# Ver logs en tiempo real
curl http://localhost:8080/job/polleria-gerson-modular/lastBuild/consoleText
```

### Opción 3: Trigger automático
```bash
# Webhook en GitHub (Settings → Webhooks)
Payload URL: http://jenkins.tu-dominio.com/github-webhook/
Events: Push events
Active: ✓
```

---

## 📊 MONITOREAR CONSTRUCCIÓN

### Mientras se ejecuta el pipeline:

1. **Console Output**
   ```
   Stage 1: PostgreSQL [████░░░░░░░░░░░░] 5%
   Stage 2: Tests     [██████████████░░░] 45%
   Stage 3: Builder   [██████████████░░░] 50%
   ...
   ```

2. **Stage View**
   ```
   Jenkins UI muestra gráficamente:
   - Cuál stage está ejecutándose
   - Cuánto tiempo lleva cada uno
   - Etapas paralelas destacadas
   ```

3. **Logs en Tiempo Real**
   ```bash
   # Ver logs de Build 123
   docker logs $(docker ps -q -f label=jenkins-build=123) -f
   ```

4. **Métricas**
   ```
   Cada stage reporta:
   ✅ Tiempo de ejecución
   ✅ Tamaño de imagen
   ✅ Resultados de tests
   ✅ Status health checks
   ```

---

## 🔍 INTERPRETACIÓN DE RESULTADOS

### Build Exitoso
```
✅ Build #123 - SUCCESS
├─ PostgreSQL:    PASSED (1.5 min)
├─ Tests:         PASSED - 20 tests, 95% coverage (2 min)
├─ Builder:       PASSED - 0 lint errors (2 min)
├─ Backend:       PASSED - ~95MB distroless (4 min)
├─ Logging:       PASSED (0.5 min)
├─ Monitoring:    PASSED (0.5 min)
├─ Integration:   PASSED - 5/5 endpoints (1 min)
└─ Duration:      ~12 minutes
```

### Build Fallido
```
❌ Build #124 - FAILURE
├─ PostgreSQL:    PASSED
├─ Tests:         FAILED ← Error en test
│  └─ Error: ValidationSchema.test.ts line 45
│     Expected 'active' but got 'disabled'
├─ Status: STOPPED
└─ Action: Fix test → Retry build
```

---

## 🐛 TROUBLESHOOTING

### "Docker daemon not accessible"
```bash
# Solución:
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
# O en Docker: montar socket
-v /var/run/docker.sock:/var/run/docker.sock
```

### "Build timeout"
```bash
# Aumentar timeout en Jenkins → Configure System
Ejecutables → timeout: 120 minutos
# O en Jenkinsfile:
options {
    timeout(time: 2, unit: 'HOURS')
}
```

### "Out of disk space"
```bash
# Limpiar imágenes y contenedores viejos
docker system prune -f --filter "until=168h"
docker image prune -f --filter "dangling=true"
```

### "Port already in use"
```bash
# Encontrar y matar proceso
lsof -i :3000  # Backend
lsof -i :9091  # Prometheus
kill -9 <PID>
```

---

## 📈 DASHBOARD JENKINS

### Vista Principal
```
┌─────────────────────────────────────────────────────────────┐
│ Build History                                               │
├─────────────────────────────────────────────────────────────┤
│ #125 ✅ 2.5 min ago - SUCCESS - 12m 15s                     │
│ #124 ❌ 1 hour ago  - FAILED  - 3m 22s (Tests)             │
│ #123 ✅ 2 hours ago - SUCCESS - 12m 8s                      │
│ #122 ✅ 3 hours ago - SUCCESS - 12m 10s                     │
├─────────────────────────────────────────────────────────────┤
│ Stage Times (promedio):                                     │
│ ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ PostgreSQL |
│ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Tests      |
│ ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Builder    |
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Backend    |
└─────────────────────────────────────────────────────────────┘
```

---

## 🎛️ PARÁMETROS PERSONALIZABLES

### En cada build, puedes elegir:

```bash
# Qué stages ejecutar
BUILD_STAGE = [all | quick | tests-only | deploy-only]

# Si pushear a registry
PUSH_REGISTRY = [true | false]

# Ambiente
ENVIRONMENT = [dev | staging | production]
```

**Ejemplo:**
```
Build con parámetros:
BUILD_STAGE: tests-only (solo tests, 2-3 min)
PUSH_REGISTRY: false
```

---

## 📋 CHECKLIST - CONFIGURACIÓN COMPLETA

- [ ] Jenkins instalado y ejecutándose (http://localhost:8080)
- [ ] Docker plugin instalado y configurado
- [ ] Usuario jenkins puede ejecutar docker (sudo usermod -aG docker jenkins)
- [ ] Git configurado en Jenkins
- [ ] Repo clonado con Jenkinsfile.modular
- [ ] Credenciales Docker configuradas (si usas registry privado)
- [ ] Webhooks GitHub/GitLab configurados
- [ ] Email notifications configuradas
- [ ] Disk space suficiente (>10GB)
- [ ] Monitoreo configurado (opcional)

---

## 🔐 SEGURIDAD

### Mejores prácticas:
```bash
# 1. No guardar secretos en Jenkinsfile
# Usar Jenkins Credentials:
withCredentials([string(credentialsId: 'db-password', variable: 'DB_PASS')]) {
    sh 'export DB_PASSWORD=$DB_PASS'
}

# 2. Usar HTTPS en Jenkins
# Generar certificado SSL
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/jenkins.key \
  -out /etc/ssl/certs/jenkins.crt

# 3. Configurar RBAC (Role-Based Access Control)
# Manage Jenkins → Manage Users → Configure matriz

# 4. Limitar acceso a Docker
# Solo pull images de registros confiables
```

---

## 📊 REPORTES & MÉTRICAS

### Jenkins genera automáticamente:

1. **Test Reports**
   ```
   Jenkins → Build → Test Result
   - Total tests: 20+
   - Passed: 20
   - Failed: 0
   - Coverage: 95%+
   ```

2. **Image Size Tracking**
   ```
   Backend image trend:
   Build 120: 110MB
   Build 121: 105MB
   Build 122: 100MB (optimizado ✅)
   ```

3. **Build Duration Trend**
   ```
   Tiempo promedio: 12.5 min
   Máximo: 18 min (con logs)
   Mínimo: 8 min (etapas paralelas)
   ```

4. **Success Rate**
   ```
   Últimos 30 builds: 28 SUCCESS, 2 FAILED
   Success rate: 93%
   ```

---

## 🚀 FLUJO COMPLETO

### Ejemplo: Developer pushea código a main

```
1. Developer hace git push origin main
   ↓
2. GitHub webhook → Jenkins
   ↓
3. Jenkins clona repo
   ↓
4. Ejecuta Jenkinsfile.modular
   ├─ Stage 1: PostgreSQL [████░░░░░░] 10%
   ├─ Stage 2: Tests [████████░░] 40%
   ├─ Stage 3: Builder [██████████░░░░░] 55%
   ├─ Stage 4: Backend [██████████████░░░] 75%
   ├─ Stage 5: Logging [██████████████░░░░░░] 85%
   ├─ Stage 6: Monitoring [██████████████░░░░░░░░] 95%
   └─ Stage 7: Integration [██████████████████████] 100%
   ↓
5. Jenkins genera reporte:
   ✅ 20 tests PASSED
   ✅ Coverage 95%+
   ✅ Image size: 100MB (✓ dentro del target)
   ✅ 8 containers built successfully
   ↓
6. Envía notificación:
   ✉️ Email team: "Build #125 SUCCESS"
   📱 Slack: "Deployment ready for QA"
   ↓
7. Push a registry (opcional):
   localhost:5000/gerson/backend:125-a1b2c3d
   localhost:5000/gerson/postgres:125-a1b2c3d
   localhost:5000/gerson/prometheus:125-a1b2c3d
   ↓
8. Ready para:
   - QA testing
   - Deployment a K8s
   - Monitoreo en Grafana
```

---

## 📞 COMANDOS ÚTILES

```bash
# Ver todos los builds
curl http://localhost:8080/job/polleria-gerson-modular/api/json | jq '.builds[]'

# Trigger build
curl -X POST http://localhost:8080/job/polleria-gerson-modular/build

# Ver logs del último build
curl http://localhost:8080/job/polleria-gerson-modular/lastBuild/consoleText | tail -50

# Obtener status actual
curl http://localhost:8080/job/polleria-gerson-modular/lastBuild/api/json | jq '.result'

# Limpieza
docker system prune -af
docker volume prune -f
docker network prune -f
```

---

## ✅ BENEFICIOS DE ESTA ARQUITECTURA

1. **Modular** — Cada contenedor es independiente
2. **Parallelizable** — Múltiples etapas corren simultáneamente
3. **Reproducible** — Mismo resultado siempre
4. **Observable** — Logs centralizados, métricas, alertas
5. **Escalable** — Fácil agregar más etapas o servicios
6. **Testeable** — Integration tests automáticos
7. **Seguro** — Aislamiento de procesos, sin secretos en git

---

## 🎯 PRÓXIMOS PASOS

1. Instalar Jenkins + plugins
2. Configurar Docker daemon
3. Clonar repositorio
4. Crear pipeline desde SCM
5. Hacer push a main
6. Ver build en tiempo real
7. Monitorear métricas en Grafana
8. Configurar alertas automáticas
9. Deployar a Kubernetes
10. ¡Celebrar! 🎉

