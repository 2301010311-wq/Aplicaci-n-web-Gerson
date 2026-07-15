# 🐘 GUÍA COMPLETA - CONECTAR POSTGRESQL 18 A LA APLICACIÓN

## 📋 PASO 1: VERIFICAR QUE POSTGRESQL 18 ESTÉ CORRIENDO

### En Windows

**Opción A: PostgreSQL instalado localmente**
```powershell
# Verificar si PostgreSQL está corriendo
Get-Process postgres

# Si no aparece, iniciar el servicio
# Buscar "Services" en Windows
# Encontrar "PostgreSQL" en la lista
# Hacer click derecho → Start

# O desde PowerShell (Admin):
Start-Service postgresql-x64-18
```

**Opción B: PostgreSQL en Docker (Recomendado)**
```bash
# Verificar contenedores corriendo
docker ps

# Debería mostrar gerson_postgres corriendo
# Si no:
docker-compose up postgres -d
```

### Verificar conexión
```bash
# Test de conexión
psql -h localhost -U postgres -d gerson_db

# Debería pedir password (por defecto: postgres)
# Si conecta: ✅ PostgreSQL está corriendo
# Si falla: ❌ Revisar configuración
```

---

## 🔧 PASO 2: CREAR USUARIO Y BASE DE DATOS

### Opción A: Desde SQL Shell (PostgreSQL)

```bash
# Abrir SQL Shell o psql
psql -U postgres

# Conectar a la BD predeterminada (si pide):
Server: localhost
Database: postgres
Port: 5432
Username: postgres
Password: postgres

# Luego ejecutar:
```

```sql
-- Crear usuario gerson (si no existe)
CREATE USER gerson WITH PASSWORD 'gerson123';

-- Crear base de datos
CREATE DATABASE gerson_db OWNER gerson;

-- Dar permisos
ALTER ROLE gerson SUPERUSER CREATEROLE CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE gerson_db TO gerson;

-- Conectar a la BD
\c gerson_db

-- Dar más permisos
GRANT ALL ON SCHEMA public TO gerson;
GRANT ALL ON ALL TABLES IN SCHEMA public TO gerson;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO gerson;

-- Verificar
\dt
```

### Opción B: Desde Docker

```bash
# Conectar al contenedor PostgreSQL
docker exec -it gerson_postgres psql -U postgres

# Luego ejecutar los comandos SQL arriba
```

### Opción C: Desde GUI (pgAdmin o DBeaver)

1. Descargar pgAdmin o DBeaver
2. Conectar a `localhost:5432` con usuario `postgres`
3. Crear usuario y BD manualmente

---

## 📝 PASO 3: ACTUALIZAR ARCHIVO .env

```env
# .env (IMPORTANTE: Este archivo está en .gitignore, no se sube a GitHub)

NODE_ENV=development
PORT=3000

# PostgreSQL 18 - Usa esos valores
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres          # O gerson si creaste el usuario
DB_PASSWORD=postgres      # Cambiar con tu password
DB_NAME=gerson_db        # Cambiar con tu nombre de BD

# DATABASE_URL = postgresql://usuario:password@host:puerto/database?schema=public
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gerson_db?schema=public

JWT_SECRET=your-secret-key-change-in-production
LOKI_URL=http://localhost:3100
```

**IMPORTANTE:**
- ❌ NO subir `.env` a GitHub (está en `.gitignore`)
- ✅ Cambiar `postgres` con tus credenciales reales
- ✅ Cambiar `postgres` password con tu password
- ✅ Cambiar `gerson_db` con el nombre de tu BD

---

## 🚀 PASO 4: INICIAR APLICACIÓN

### Opción A: Con Docker Compose (RECOMENDADO)

```bash
# 1. Copiar archivo .env.example a .env (si no existe)
cp .env.example .env

# 2. Editar .env con tus credenciales PostgreSQL
# Abrir .env y cambiar:
#   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# 3. Levantar servicios
docker-compose up -d

# 4. Verificar logs
docker-compose logs -f backend

# 5. Crear migraciones
docker-compose exec backend npx prisma migrate dev --name init

# 6. Ver resultado
# Backend debe estar en http://localhost:3000
# Grafana en http://localhost:3001
```

### Opción B: Sin Docker (Local)

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar .env
cp .env.example .env

# 3. Editar .env con credenciales PostgreSQL

# 4. Crear migraciones
npm run db:migrate

# 5. Iniciar desarrollo
npm run dev

# 6. Abrir http://localhost:3000
```

---

## 🧪 PASO 5: VERIFICAR CONEXIÓN A BD

### Test 1: Desde CLI

```bash
# Con npx
npx prisma db push

# Output esperado:
# ✅ Pushed 21 models to database successfully
```

### Test 2: Desde Node/REPL

```javascript
// Crear archivo test-db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Intentar conexión
    await prisma.$connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // Contar usuarios
    const userCount = await prisma.usuarios.count();
    console.log(`📊 Total de usuarios: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

```bash
# Ejecutar
node test-db.js
```

### Test 3: Desde Grafana (si Docker)

```
http://localhost:3001
Usuario: admin
Password: admin123

Ir a: Explore → Loki
Query: {job="backend"}

Debería mostrar logs de la aplicación
```

---

## 🔑 PASO 6: CREAR USUARIOS EN LA APLICACIÓN

### Opción A: Desde Script Seed

```bash
# Crear datos iniciales (seed)
npm run db:seed

# Debería crear:
# - Usuarios (admin, mesero, cocinero, cajero)
# - Productos de ejemplo
# - Mesas
```

### Opción B: Desde API

```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "rol": "ADMIN"
  }'
```

### Opción C: Desde pgAdmin/DBeaver (Manual)

```sql
-- Conectar a gerson_db
INSERT INTO usuarios (
  nombre_user,
  apellido_user,
  correo_user,
  rol,
  contrasena
) VALUES (
  'Juan',
  'Pérez',
  'juan@example.com',
  'ADMIN',
  'hashed_password_here'  -- Debería ser hasheada
);
```

---

## 🌐 PASO 7: ACCEDER A LA APLICACIÓN

```
URL: http://localhost:3000

Login:
Email: juan@example.com
Password: password123

Debería entrar a dashboard
```

---

## 📊 ARQUITECTURA FINAL

```
┌──────────────────────────────────────┐
│   Tu Máquina Local (Windows)         │
├──────────────────────────────────────┤
│                                      │
│  ┌─────────────────────────────┐    │
│  │ PostgreSQL 18               │    │
│  │ (localhost:5432)            │    │
│  │ DB: gerson_db               │    │
│  │ User: postgres / gerson     │    │
│  └─────────────────────────────┘    │
│            ▲                         │
│            │ Conexión               │
│            │                         │
│  ┌─────────▼─────────────────────┐  │
│  │ Docker Container              │  │
│  │ - Next.js Backend (3000)      │  │
│  │ - PostgreSQL Container (5432) │  │
│  │ - Loki (3100)                 │  │
│  │ - Prometheus (9091)           │  │
│  │ - Grafana (3001)              │  │
│  └─────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘

   Tu Navegador
   ├─ http://localhost:3000 (App)
   ├─ http://localhost:3001 (Grafana)
   └─ http://localhost:9091 (Prometheus)
```

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### Error: "P1000: Authentication failed"
```
Causa: Credenciales incorrectas
Solución:
1. Verificar .env tiene contraseña correcta
2. Verificar usuario existe en PostgreSQL
3. Verificar PostgreSQL está corriendo (psql -U postgres)
```

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
```
Causa: PostgreSQL no está corriendo
Solución:
1. Iniciar PostgreSQL (Services en Windows)
2. O: docker-compose up postgres -d
3. Verificar: psql -h localhost -U postgres
```

### Error: "database "gerson_db" does not exist"
```
Causa: BD no fue creada
Solución:
1. Conectar con: psql -U postgres
2. Ejecutar: CREATE DATABASE gerson_db;
3. O: npm run db:migrate (auto-crea)
```

### Error: "permission denied for schema public"
```
Causa: Usuario no tiene permisos
Solución:
Ejecutar como admin PostgreSQL:
GRANT ALL ON SCHEMA public TO gerson;
```

---

## ✅ CHECKLIST FINAL

- [ ] PostgreSQL 18 está corriendo (docker-compose up postgres -d)
- [ ] BD `gerson_db` creada
- [ ] Usuario `postgres` o `gerson` existe
- [ ] Archivo `.env` configurado correctamente
- [ ] `npm install` ejecutado
- [ ] `npm run db:migrate` pasó (o `docker-compose exec backend npx prisma migrate dev`)
- [ ] `npm run dev` o `docker-compose up -d` backend está corriendo
- [ ] Acceso a http://localhost:3000 ✅
- [ ] Login funciona ✅
- [ ] Dashboard visible ✅

---

## 🚀 SCRIPT RÁPIDO (TODO EN UNO)

```bash
#!/bin/bash
# setup-postgres.sh

echo "🐘 Configurando PostgreSQL 18..."

# 1. Crear archivo .env
cp .env.example .env
echo "✓ .env creado"

# 2. Levantar PostgreSQL en Docker
docker-compose up postgres -d
echo "✓ PostgreSQL iniciado"

# 3. Esperar a que PostgreSQL esté listo
sleep 5

# 4. Crear BD y usuario (si es necesario)
docker-compose exec postgres psql -U postgres -c "
  CREATE DATABASE gerson_db;
  CREATE USER gerson WITH PASSWORD 'gerson123';
  GRANT ALL PRIVILEGES ON DATABASE gerson_db TO gerson;
" || echo "⚠ BD ya existe"

echo "✓ BD creada"

# 5. Migrar
npm run db:migrate
echo "✓ Migraciones aplicadas"

# 6. Iniciar aplicación
npm run dev
echo "✓ Aplicación iniciada en http://localhost:3000"
```

**Usar:**
```bash
bash setup-postgres.sh
```

---

## 📞 SOPORTE

Si tienes errores:
1. Revisa los logs: `docker-compose logs backend`
2. Verifica conectividad: `psql -h localhost -U postgres`
3. Revisa archivo `.env`
4. Ejecuta: `npm run db:migrate` nuevamente

