# 🚀 Jenkins Docker Orchestration Pipeline - Setup Rápido

Tu aplicación **Pollería Gerson** ahora tiene un pipeline completo en Jenkins que **construye, prueba y ejecuta automáticamente todos tus contenedores Docker**.

---

## 📦 Archivos Creados

| Archivo | Propósito |
|---------|-----------|
| `Jenkinsfile.docker-orchestration` | Pipeline principal que orquesta 7 etapas |
| `setup-jenkins-job.sh` | Script para crear el job automáticamente |
| `jenkins-cli.sh` | CLI para gestionar builds desde línea de comandos |
| `JENKINS_SETUP_GUIDE.md` | Guía detallada paso a paso |

---

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Verificar que Jenkins esté corriendo
```bash
curl http://localhost:8080
```

### 2️⃣ Acceder a Jenkins
```
http://localhost:8080
```

### 3️⃣ Crear Credenciales (Interfaz Web)

**Ir a:** `http://localhost:8080/credentials/` → **System** → **Global credentials** → **Add Credentials**

Crear 4 credenciales con tipo **Secret text**:

```
ID: gerson-db-user
Secret: postgres

ID: gerson-db-password
Secret: tu_contraseña

ID: gerson-jwt-secret
Secret: tu_jwt_secret

ID: github-credentials
Type: Username with password
Username: tu_usuario_github
Password: tu_token_github
```

### 4️⃣ Crear Nuevo Pipeline Job

**Jenkins Dashboard** → **New Item**

```
Name: Gerson-Docker-Orchestration
Type: Pipeline
OK
```

**En la sección Pipeline:**
- **Definition:** Pipeline script from SCM
- **SCM:** Git
- **Repository URL:** `https://github.com/tu-usuario/aplicacion-web-gerson.git`
- **Credentials:** github-credentials
- **Script Path:** `Jenkinsfile.docker-orchestration`
- **Save**

### 5️⃣ Ejecutar el Pipeline

**Jenkins Dashboard** → **Gerson-Docker-Orchestration** → **Build Now**

---

## 📊 Etapas del Pipeline (7 en total)

```
1. Database          → PostgreSQL inicializado ✅
2. Tests             → Unit & Integration tests ejecutados ✅
3. Build             → Aplicación compilada ✅
4. Runtime           → Backend desplegado y listo ✅
5. Logging           → Loki + Promtail iniciado ✅
6. Monitoring        → Prometheus + Grafana activo ✅
7. Alerting          → AlertManager configurado ✅
```

---

## 🎯 URLs Durante el Build

Una vez que Jenkins dispare el pipeline, accede a:

| Servicio | URL | Usuario | Contraseña |
|----------|-----|---------|-----------|
| Backend API | http://localhost:3000 | - | - |
| Grafana | http://localhost:3001 | admin | admin123 |
| Prometheus | http://localhost:9091 | - | - |
| AlertManager | http://localhost:9093 | - | - |
| Loki | http://localhost:3100 | - | - |
| PostgreSQL | localhost:5432 | postgres | your_password |

---

## 🔧 Usar el CLI para Gestionar Builds

Después de crear el job, puedes usar el script `jenkins-cli.sh` para gestionar builds desde la terminal:

```bash
# Disparar un build
./jenkins-cli.sh build

# Ver estado del último build
./jenkins-cli.sh status

# Ver logs
./jenkins-cli.sh logs 100

# Ver historial de builds
./jenkins-cli.sh history 10

# Descargar artefactos
./jenkins-cli.sh download-artifacts ./artifacts

# Detener build actual
./jenkins-cli.sh stop

# Ver resultados de tests
./jenkins-cli.sh test-results

# Verificar salud de Jenkins
./jenkins-cli.sh health
```

### Configurar Credenciales para CLI

```bash
export JENKINS_URL="http://localhost:8080"
export JENKINS_USER="admin"
export JENKINS_TOKEN="tu_api_token"

./jenkins-cli.sh status
```

---

## 📁 Artefactos Generados

Después de cada build, los siguientes artefactos se archivan automáticamente:

```
test-results/           → Resultados de pruebas
coverage/               → Reporte de cobertura de código
docker-logs/            → Logs de todos los servicios
  ├── backend.log
  ├── logging.log
  ├── monitoring.log
  ├── alerting.log
  ├── docker-images.txt
  ├── build-info.txt
  └── final-summary.txt
.next/                  → Aplicación compilada
```

Acceso: `http://localhost:8080/job/Gerson-Docker-Orchestration/lastBuild/artifact/`

---

## 🚀 Opciones Avanzadas

### Ejecutar Build con Parámetros

```bash
./jenkins-cli.sh build-params main true false
```

Parámetros disponibles:
- `GIT_BRANCH` - Rama a compilar (default: main)
- `CLEAN_BUILD` - Limpiar contenedores previos (default: true)
- `RUN_PERFORMANCE_TESTS` - Ejecutar pruebas de rendimiento (default: false)

### Trigger Automático por Git Push

1. En GitHub: Settings → Webhooks → Add webhook
2. **Payload URL:** `http://tu-jenkins:8080/github-webhook/`
3. **Content type:** application/json
4. **Events:** Just the push event

Ahora, cada `git push` a `main` disparará automáticamente un build en Jenkins.

---

## 🔍 Monitorear Build

### Opción 1: UI de Jenkins
```
http://localhost:8080/job/Gerson-Docker-Orchestration/lastBuild/console
```

### Opción 2: CLI
```bash
./jenkins-cli.sh logs 50
```

### Opción 3: Watch en tiempo real (Linux/Mac)
```bash
watch -n 2 "./jenkins-cli.sh status"
```

---

## 📊 Verificar Servicios

Mientras corre un build, verificar que los servicios estén sanos:

```bash
# Verificar Backend API
curl http://localhost:3000/api/health

# Verificar Database
PGPASSWORD=password psql -h localhost -U postgres -c "SELECT version();"

# Verificar Prometheus
curl http://localhost:9091/-/ready

# Verificar Grafana
curl http://localhost:3001/api/health

# Verificar Loki
curl http://localhost:3100/ready
```

---

## 🐛 Troubleshooting

### Error: "Docker daemon not accessible"

```bash
# Dar permisos a Jenkins para acceder a Docker
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Error: "Port already in use"

```bash
# Ver qué está usando los puertos
lsof -i :3000
lsof -i :5432
lsof -i :9091

# Detener contenedores previos
docker compose -f docker-compose.jenkins.yml down --volumes
```

### Error: "Failed to connect to repository"

- Verificar que la URL del repositorio es correcta
- Verificar que las credenciales de GitHub son válidas
- Probar acceso manual: `git clone https://github.com/...`

### Build se queda en espera (hang)

```bash
# Ver logs de Jenkins
docker logs jenkins

# Detener build desde CLI
./jenkins-cli.sh stop

# O manualmente en Jenkins UI: Build → Stop
```

---

## 📈 Siguientes Pasos

1. **Configurar Notificaciones:**
   - Slack: Agregue `slackSend()` en `post` del Jenkinsfile
   - Email: Agregue `emailext()` en `post`

2. **Agregar Más Etapas:**
   - Security scanning (OWASP, Snyk)
   - SonarQube para análisis de código
   - SAST/DAST
   - Deploy automático a producción

3. **Optimizar Performance:**
   - Cache de layers de Docker
   - Parallel execution de tests
   - Retry logic para operaciones flaky

4. **Monitoreo Avanzado:**
   - Custom dashboards en Grafana
   - Alertas en AlertManager
   - Integración con ELK Stack

---

## 📚 Documentación Completa

Para instrucciones detalladas paso a paso, ver: **`JENKINS_SETUP_GUIDE.md`**

---

## ✅ Checklist de Verificación

Antes de ejecutar el pipeline:

- [ ] Jenkins está corriendo en http://localhost:8080
- [ ] Docker está instalado y funcionando
- [ ] Credenciales creadas en Jenkins (DB, JWT, GitHub)
- [ ] Job "Gerson-Docker-Orchestration" creado
- [ ] Script path = `Jenkinsfile.docker-orchestration`
- [ ] Repositorio Git es accesible
- [ ] Puertos 3000, 3001, 5432, 9091, 9093, 3100 están libres

---

## 🎉 ¡Listo!

Tu pipeline está configurado. Ahora puedes:

```bash
# Ver estado
./jenkins-cli.sh status

# Disparar build
./jenkins-cli.sh build

# Monitorear
./jenkins-cli.sh logs 100
```

---

**Última actualización:** 2026-07-11  
**Versión:** 2.0 - Docker Orchestration Pipeline
