# 🔍 ANÁLISIS DE ERRORES - PROBLEMAS ENCONTRADOS Y SOLUCIONES

## ❌ PROBLEMA PRINCIPAL

**Error:** `docker.io/library/node:20-distroless: not found`

```
ERROR: failed to build: failed to solve: node:20-distroless: 
failed to resolve source metadata for docker.io/library/node:20-distroless
```

### **Causa Raíz:** 
La imagen `node:20-distroless` **NO EXISTE** en Docker Hub. 

La imagen correcta es `gcr.io/distroless/nodejs20-debian12` (en Google Container Registry, no Docker Hub).

---

## 📋 PROBLEMAS ENCONTRADOS

### 1. **Imagen Base Incorrecta - CRÍTICO**
```dockerfile
# ❌ INCORRECTO - No existe en Docker Hub
FROM node:20-distroless AS runtime

# ✅ CORRECTO - Existe en gcr.io
FROM gcr.io/distroless/nodejs20-debian12 AS runtime
```

**Ubicaciones afectadas:**
- `Dockerfile` (línea 18)
- `docker/Dockerfile.runtime` (línea 2)

**Solución:** Usar imagen correcta de Google Distroless

---

### 2. **Health Check Incompatible con Distroless**
```dockerfile
# ❌ INCORRECTO - wget no existe en distroless
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -q --spider http://localhost:3000/api/health || exit 1

# ✅ CORRECTO - node sí existe pero no curl
# En distroless NO hay shell, debe ser formato JSON
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"]
```

**Ubicaciones afectadas:**
- `Dockerfile` (línea 35)
- `docker/Dockerfile.runtime` (línea 16)

---

### 3. **CMD Shell en Distroless**
```dockerfile
# ❌ INCORRECTO - No hay shell en distroless
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]

# ✅ CORRECTO - Formato JSON array, sin shell
CMD ["/nodejs/bin/npm", "start"]
# O ejecutar migrate en el proceso de inicio
```

**Ubicaciones afectadas:**
- `docker/Dockerfile.runtime` (línea 21)

---

### 4. **Multi-stage Build sin Base Builder**
```dockerfile
# ❌ INCORRECTO - Dockerfile.runtime copia de "builder" pero no lo define
COPY --from=builder /app/node_modules ./node_modules

# ✅ CORRECTO - Necesita ser parte de un multi-stage o referencia completo
# docker/Dockerfile.runtime debe tener acceso a builder stage
```

**Ubicación:** `docker/Dockerfile.runtime`

**Solución:** 
- Usar archivo Dockerfile principal (multi-stage completo), O
- Cambiar estrategia a usar Alpine en lugar de Distroless para simplificar

---

### 5. **Imágenes Base que NO son Oficiales**
```dockerfile
# Verificar todas las imágenes base usadas:
docker pull grafana/loki:latest          # ✅ OK
docker pull grafana/promtail:latest      # ✅ OK
docker pull grafana/grafana:latest       # ✅ OK
docker pull prom/prometheus:latest       # ✅ OK
docker pull prom/alertmanager:latest     # ✅ OK
docker pull postgres:16-alpine           # ✅ OK
docker pull node:20-alpine               # ✅ OK
docker pull node:20-distroless           # ❌ NO EXISTE
docker pull gcr.io/distroless/nodejs20   # ✅ OK (pero en gcr.io, no Docker Hub)
```

---

### 6. **Comandos que No Existen en Distroless**
```bash
# ❌ Distroless NO tiene:
wget, curl, sh, bash, apt, yum, grep, sed, awk, etc.

# ✅ Distroless SÍ tiene:
/nodejs/bin/node
/nodejs/bin/npm
```

---

## ✅ SOLUCIONES IMPLEMENTADAS

### Opción A: Usar Alpine (RECOMENDADO - Más Simple)
```dockerfile
# ✅ Cambiar a Alpine (que SÍ existe y es ligero)
FROM node:20-alpine AS runner

# Ventajas:
# - Imagen existe y es oficial
# - Tamaño similar: ~170MB (vs 95MB distroless)
# - Tiene herramientas básicas (sh, curl, wget)
# - Health checks funcionan mejor
# - Multi-stage funciona correctamente
```

### Opción B: Usar Distroless Correctamente
```dockerfile
# ✅ Usar imagen correcta de Google
FROM gcr.io/distroless/nodejs20-debian12 AS runner

# Cambios necesarios:
# 1. HEALTHCHECK debe estar en formato JSON
# 2. CMD debe ser formato JSON array
# 3. No puede haber shell scripts
# 4. Paths absolutos a binarios: /nodejs/bin/npm
```

---

## 🔧 CORRECCIONES A REALIZAR

### Paso 1: Decidir estrategia
```
OPCIÓN A: Alpine (Recomendado para dev/test)
├─ Más compatible
├─ Herramientas disponibles
├─ Tamaño 170MB (vs 95MB)
└─ Todos los Dockerfiles trabajan igual

OPCIÓN B: Distroless (Recomendado para prod)
├─ Más seguro (menos superficie de ataque)
├─ Tamaño 95MB
├─ Requiere ajustes en CMD y HEALTHCHECK
└─ Compatible con multi-stage complejo
```

### Paso 2: Archivos a corregir

**Si eliges OPCIÓN A (Alpine):**
```
- Dockerfile
- docker/Dockerfile.runtime
- No cambiar nada más
```

**Si eliges OPCIÓN B (Distroless):**
```
- Dockerfile (multi-stage completo)
- docker/Dockerfile.runtime (formato JSON)
- Todos los CMD y HEALTHCHECK
```

### Paso 3: Testing antes de push
```bash
# Validar cada Dockerfile
docker build -f docker/Dockerfile.runtime -t test:runtime .
docker build -f docker/Dockerfile.tests -t test:tests .
docker build -f docker/Dockerfile.builder -t test:builder .
```

---

## 📊 OTRAS POTENCIALES ISSUES EN EL REPOSITORIO

### En docker-compose.jenkins.yml:
```yaml
# ⚠️ Verificar que TODOS los services tengan imagen o build válida
services:
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.runtime  # ⬅️ Debe existir y ser válido
    image: gerson-backend:latest
```

### En Jenkinsfile.modular:
```groovy
# ⚠️ Comandos que pueden fallar:
docker compose -f ${DOCKER_COMPOSE_FILE} build backend
# Si docker-compose.jenkins.yml tiene referencias incorrectas

docker tag gerson-backend:latest ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/backend:${BUILD_TAG}
# Si imagen no existe porque build falló
```

### En scripts:
```bash
# ⚠️ Scripts asumen que contenedores existen:
docker compose -f "$COMPOSE_FILE" exec -T backend curl ...
# Fallará si backend no construyó exitosamente
```

---

## 🚀 MI RECOMENDACIÓN

**Usa OPCIÓN A (Alpine) AHORA:**
- ✅ Funciona inmediatamente
- ✅ Sin cambios complejos
- ✅ Distroless es optimización futura
- ✅ En prod después puedes migrar

Después en Producción puedes optimizar a Distroless.

