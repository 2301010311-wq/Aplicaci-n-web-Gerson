# 🚀 INSTRUCCIONES PASO A PASO - PUSH A GITHUB

## ✅ PRE-REQUISITOS

- [ ] Git instalado y configurado
- [ ] Repositorio GitHub clonado localmente
- [ ] Terminal abierta en la carpeta del proyecto

---

## 🔄 PASO 1: VALIDAR CAMBIOS

```bash
# Navega a la carpeta del proyecto
cd ~/ruta/al/Aplicacion-web-Gerson

# Ejecuta el script de validación
bash validate-before-push.sh
```

**Output esperado:**
```
╔════════════════════════════════════════════════════════════════╗
║         VALIDACIÓN PRE-PUSH - DOCKERFILES & CONFIG             ║
╚════════════════════════════════════════════════════════════════╝

1. Validando Dockerfiles Principales
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ [Dockerfile principal] Dockerfile exists
  ✓ Base image: node:20-alpine

✓ [PostgreSQL] Dockerfile exists
  ✓ Base image: postgres:16-alpine

... (más validaciones)

╔════════════════════════════════════════════════════════════════╗
║ RESULTADO: Errors: 0, Warnings: 0                             ║
╚════════════════════════════════════════════════════════════════╝

✅ VALIDACIÓN EXITOSA - Listo para push a GitHub

Próximos pasos:
  1. git add .
  2. git commit -m '...'
  3. git push origin main
```

**Si hay errores:**
- Detente aquí
- Revisa el error en el output
- Busca la solución en `ANALISIS_ERRORES.md`
- Aplica la corrección
- Repite validación

---

## 🔄 PASO 2: REVISAR STATUS GIT

```bash
# Ver qué cambios hay
git status

# Debería mostrar (aproximadamente):
# On branch main
# Untracked files:
#   ANALISIS_ERRORES.md
#   GUIA_CORRECCIONES_FINALES.md
#   REPORTE_FINAL_ANALISIS.md
#   validate-before-push.sh
#
# Changes not staged for commit:
#   modified:   Dockerfile
#   modified:   docker-compose.jenkins.yml
#   modified:   docker/Dockerfile.tests
#   modified:   docker/Dockerfile.builder
#   modified:   docker/Dockerfile.runtime
```

---

## 🔄 PASO 3: AGREGAR CAMBIOS

```bash
# Opción A: Agregar todos los cambios
git add .

# Opción B: Agregar selectivamente (más control)
git add Dockerfile
git add docker/
git add docker-compose.jenkins.yml
git add ANALISIS_ERRORES.md
git add GUIA_CORRECCIONES_FINALES.md
git add REPORTE_FINAL_ANALISIS.md
git add validate-before-push.sh
```

**Verificar qué se va a agregar:**
```bash
git diff --cached --name-only
```

**Output esperado:**
```
Dockerfile
docker-compose.jenkins.yml
docker/Dockerfile.postgres
docker/Dockerfile.tests
docker/Dockerfile.builder
docker/Dockerfile.runtime
docker/Dockerfile.loki
docker/Dockerfile.promtail
docker/Dockerfile.prometheus
docker/Dockerfile.grafana
docker/Dockerfile.alertmanager
ANALISIS_ERRORES.md
GUIA_CORRECCIONES_FINALES.md
REPORTE_FINAL_ANALISIS.md
validate-before-push.sh
```

---

## 🔄 PASO 4: CREAR COMMIT

```bash
# Commit con mensaje descriptivo
git commit -m "fix: Corregir Dockerfiles - Alpine en lugar de distroless

- Cambiar base image de node:20-distroless (no existe) a node:20-alpine (oficial)
- Actualizar docker/Dockerfile.runtime con Alpine
- Actualizar docker/Dockerfile.tests con health check mejorado
- Actualizar docker/Dockerfile.builder con health check mejorado
- Validar docker-compose.jenkins.yml con referencias correctas
- Agregar script de validación pre-push (validate-before-push.sh)
- Documentar problemas encontrados en ANALISIS_ERRORES.md
- Documentar soluciones en GUIA_CORRECCIONES_FINALES.md
- Crear reporte final en REPORTE_FINAL_ANALISIS.md

FIXES:
- Resuelto: docker.io/library/node:20-distroless: not found
- Validadas todas las imágenes base
- Verificados todos los health checks

BREAKING CHANGE: Imagen distroless (gcr.io) será optimización futura
después de testing en producción"
```

**Verificar el commit:**
```bash
git log --oneline -1

# Output:
# a1b2c3d fix: Corregir Dockerfiles - Alpine en lugar de distroless
```

---

## 🔄 PASO 5: PUSH A GITHUB

```bash
# Push a la rama main
git push origin main
```

**Output esperado:**
```
Enumerating objects: 15, done.
Counting objects: 100% (15/15), done.
Delta compression using up to 8 threads
Compressing objects: 100% (10/10), done.
Writing objects: 100% (15/15), 45.2 KiB | 1.2 MiB/s, done.
Total 15 (delta 5), reused 0 (delta 0), reused pack 0 (delta 0) (local objects: 2)
remote: Resolving deltas: 100% (5/5), done.
remote:
remote: Create a pull request for 'main' on GitHub by visiting:
remote:      https://github.com/tuusuario/Aplicacion-web-Gerson/pull/new/main
remote:
To github.com:tuusuario/Aplicacion-web-Gerson.git
   8a7b6c5..a1b2c3d  main -> main
```

**Si hay errores:**

### Error: "Permission denied (publickey)"
```bash
# Esto significa que SSH no está configurado
# Solución:

# Opción 1: Usar HTTPS en lugar de SSH
git remote set-url origin https://github.com/tuusuario/Aplicacion-web-Gerson.git
git push origin main
# (Te pedirá username/password o token)

# Opción 2: Configurar SSH (recomendado)
ssh-keygen -t ed25519 -C "tu-email@example.com"
# Agregar clave pública a GitHub Settings → SSH Keys
ssh -T git@github.com  # Verificar conexión
git push origin main
```

### Error: "Please commit or stash your changes"
```bash
# Cambios no confirmados aún
git status
# Debería estar en "On branch main" sin cambios
# Si hay cambios:
git commit -am "mensaje"
```

### Error: "rejected ... (fetch first)"
```bash
# Hay cambios remotos que no tienes localmente
git pull origin main
# Resolver conflictos si existen
git push origin main
```

---

## ✅ PASO 6: VERIFICAR PUSH EXITOSO

```bash
# Ir a GitHub
# https://github.com/tuusuario/Aplicacion-web-Gerson

# Verificar:
# 1. El commit aparece en la rama main ✓
# 2. Los archivos fueron actualizados ✓
# 3. GitHub Actions empieza a ejecutar ✓
```

**Monitorear CI/CD:**
```
Repository → Actions → Latest workflow
Ver estado de compilación en tiempo real
```

---

## 🔍 PASO 7: MONITOREAR BUILD EN GITHUB ACTIONS

### Esperar a que GitHub Actions ejecute

```
Status: Running...

Jobs:
├─ Build & Test (ubuntu-latest)
│  ├─ Checkout ✓
│  ├─ Setup Node ✓
│  ├─ npm ci ✓
│  ├─ docker build (progreso...)
│  ├─ npm test (progreso...)
│  └─ npm run build (progreso...)
```

### Si Build es Exitoso ✅

```
✅ Build successful
├─ All tests passed (20/20)
├─ Coverage: 95%+
├─ Docker images built
│  ├─ gerson-postgres:latest ✓
│  ├─ gerson-tests:latest ✓
│  ├─ gerson-builder:latest ✓
│  ├─ gerson-backend:latest ✓
│  └─ ... (más servicios)
└─ Ready for deployment
```

### Si Build Falla ❌

```
❌ Build failed

Job: Build & Test
Step: docker build

Error: [detalle del error]

Logs completos:
[Clickea para expandir logs]
```

**Si falla, revisar logs y buscar error en `ANALISIS_ERRORES.md`**

---

## ✨ DESPUÉS DEL PUSH EXITOSO

### 1. Actualizar README.md (opcional)
```markdown
## 🚀 Deployment

### Validación Pre-Push
Antes de hacer push a GitHub, ejecuta:
```bash
bash validate-before-push.sh
```

### Build Pipeline
GitHub Actions ejecuta automáticamente:
1. npm install
2. npm run lint
3. npm test
4. docker build
5. Deploy a Kubernetes (si está configurado)
```

### 2. Confirmar en el equipo
```
"Push exitoso a main ✓
Todos los Dockerfiles compilados ✓
Tests pasaron ✓
Listos para next step"
```

### 3. Próximo paso
- Esperar validación en QA
- Monitorear métricas en Grafana
- Preparar deploy a Kubernetes

---

## 🎯 RESUMEN DE COMANDOS

```bash
# Todo en uno:
bash validate-before-push.sh && \
git add . && \
git commit -m "fix: Corregir Dockerfiles - Alpine en lugar de distroless" && \
git push origin main

# Monitorear:
git log --oneline -5    # Ver últimos commits
git remote -v           # Ver remote configurado
```

---

## ✅ CHECKLIST FINAL

- [ ] Ejecuté `bash validate-before-push.sh` con resultado OK
- [ ] `git status` muestra solo cambios esperados
- [ ] `git add .` realizado
- [ ] `git commit -m "..."` con mensaje descriptivo
- [ ] `git push origin main` exitoso
- [ ] Navegué a GitHub y veo el commit
- [ ] GitHub Actions empezó a ejecutar
- [ ] No hay errores en los logs de Actions

---

## 📞 AYUDA RÁPIDA

| Problema | Comando |
|----------|---------|
| Ver cambios pendientes | `git status` |
| Ver commits locales | `git log -5` |
| Deshacer cambios | `git checkout -- archivo` |
| Cancelar commit | `git reset HEAD~1` |
| Cambiar mensaje commit | `git commit --amend` |
| Ver diferencias | `git diff` |
| Push específico | `git push origin main --force` (cuidado!) |

---

**¡Listo para pushear! 🚀**

