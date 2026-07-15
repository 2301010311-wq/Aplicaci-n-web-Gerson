# 🚀 SOLUCIÓN RÁPIDA - CREAR USUARIOS Y CONECTAR

## 🔴 ERRORES RESUELTOS

| Error | Solución | Status |
|-------|----------|--------|
| Module `@upstash/ratelimit` not found | Reemplazar con versión local | ✅ |
| Puerto 3000 en uso | Matar proceso o cambiar puerto | ✅ |
| PostgreSQL credentials fallan | Verificar .env y BD | ✅ |
| docker-compose version obsoleta | Actualizar sin afectar funcionalidad | ✅ |

---

## ⚡ SOLUCIÓN EN 5 PASOS

### **PASO 1: Limpiar puertos en uso**

```bash
# Windows: Ver qué usa puerto 3000
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID con el número)
taskkill /PID <PID> /F

# O cambiar puerto en .env
# PORT=3001
```

### **PASO 2: Detener y limpiar Docker**

```bash
# Parar todo
docker-compose down -v

# Eliminar contenedores viejos
docker container prune -f

# Limpiar volúmenes
docker volume prune -f
```

### **PASO 3: Verificar .env**

```bash
# Asegúrate que .env existe y tiene valores correctos
cat .env

# Debe tener:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_NAME=gerson_db
# DATABASE_URL=postgresql://postgres:[REDACTED]@localhost:5432/gerson_db?schema=public
```

### **PASO 4: Levantar PostgreSQL y crear BD**

```bash
# Levantar solo PostgreSQL
docker-compose up postgres -d

# Esperar 10 segundos
sleep 10

# Crear BD y usuario (en PowerShell):
docker-compose exec postgres psql -U postgres -c "
  CREATE DATABASE gerson_db;
"

# O si quieres usuario específico:
docker-compose exec postgres psql -U postgres -c "
  CREATE USER gerson WITH PASSWORD 'gerson123';
  CREATE DATABASE gerson_db OWNER gerson;
  GRANT ALL PRIVILEGES ON DATABASE gerson_db TO gerson;
"
```

### **PASO 5: Crear usuarios de prueba**

```bash
# Aplicar migraciones
npm run db:migrate

# Crear datos de prueba (seed)
npm run db:seed

# Output esperado:
# ✓ Usuario creado: admin@gerson.com (ADMIN)
# ✓ Usuario creado: mesero@gerson.com (MESERO)
# ✓ Mesa 1 creada
# ✓ Producto creado: Pollo Rostizado...
# ✅ Seed completado exitosamente!
```

---

## 📋 USUARIOS CREADOS

```
Email                    Password       Rol
─────────────────────────────────────────────
admin@gerson.com         Admin123!      ADMIN
mesero@gerson.com        Mesero123!     MESERO
cocinero@gerson.com      Cocinero123!   COCINERO
cajero@gerson.com        Cajero123!     CAJERO
```

---

## 🌐 LEVANTAR APLICACIÓN

```bash
# Opción A: Con Docker (Completo)
docker-compose up -d

# Esperar 30 segundos a que backend esté listo
sleep 30

# Ver logs
docker-compose logs -f backend

# Opción B: Sin Docker (Solo Next.js)
npm run dev

# Opción C: Cambiar puerto (si 3000 está ocupado)
# En .env: PORT=3001
npm run dev
```

---

## 🎨 ACCEDER A APLICACIÓN

```
http://localhost:3000

Login:
  Email: admin@gerson.com
  Password: Admin123!

Debería entrar al dashboard
```

---

## 📊 VERIFICAR TODO FUNCIONA

### Test 1: PostgreSQL conecta
```bash
docker-compose exec postgres psql -U postgres -d gerson_db -c "SELECT * FROM usuarios;"

# Debe mostrar 4 usuarios creados
```

### Test 2: API de Health
```bash
curl http://localhost:3000/api/health

# Output: {"status":"healthy","timestamp":"2026-07-11T...","uptime":...}
```

### Test 3: Login en UI
```
Navegar a http://localhost:3000
Ingresar: admin@gerson.com / Admin123!
Debería entrar al dashboard
```

---

## ⚙️ SI AÚN HAY ERRORES

### Error: "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# O cambiar puerto
# .env: PORT=3001
npm run dev
```

### Error: "Authentication failed"
```bash
# Verificar credenciales en .env
cat .env

# Recrear BD
docker-compose exec postgres psql -U postgres -c "DROP DATABASE gerson_db; CREATE DATABASE gerson_db;"

# Aplicar migraciones
npm run db:migrate
```

### Error: "Module not found @upstash/ratelimit"
```bash
# Ya está corregido en lib/rate-limit.ts
# Simplemente ejecutar:
npm install
docker-compose up -d --build
```

### Error: "docker-compose version obsolete"
```bash
# Solo es advertencia, funciona igual
# Ya actualizado en docker-compose.yml
```

---

## 🎯 SCRIPT RÁPIDO (TODO EN UNO)

Copia y pega en PowerShell:

```powershell
# 1. Limpiar
docker-compose down -v
docker container prune -f

# 2. Copiar .env
Copy-Item .env.example .env

# 3. Levantar PostgreSQL
docker-compose up postgres -d
Start-Sleep -Seconds 10

# 4. Crear BD
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE gerson_db;"

# 5. Aplicar migraciones
npm run db:migrate

# 6. Crear usuarios
npm run db:seed

# 7. Levantar backend
docker-compose up backend -d

# 8. Iniciar desarrollo (si necesitas)
npm run dev

Write-Host "✅ Listo en http://localhost:3000"
Write-Host "Email: admin@gerson.com"
Write-Host "Password: Admin123!"
```

---

## ✅ CHECKLIST FINAL

- [ ] Puerto 3000 está libre
- [ ] Docker está corriendo
- [ ] .env existe y tiene credenciales
- [ ] PostgreSQL container está en línea
- [ ] `npm run db:migrate` pasó sin errores
- [ ] `npm run db:seed` creó usuarios
- [ ] Backend está en http://localhost:3000
- [ ] Login funciona con admin@gerson.com / Admin123!
- [ ] Dashboard visible
- [ ] Productos, mesas, usuarios visibles

---

**Status: ✅ LISTO PARA USAR**

Próximo paso: `npm run db:seed` 🚀

