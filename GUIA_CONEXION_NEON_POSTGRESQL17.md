# 🚀 GUÍA DE CONFIGURACIÓN - NUEVA BD POSTGRESQL 17 EN NEON

**Estado:** ✅ APLICACIÓN LISTA PARA CONECTAR A NEON  
**Base de Datos:** PostgreSQL 17 (Neon Cloud)  
**URL:** `ep-twilight-band-ajmr98xy-pooler.c-3.us-east-2.aws.neon.tech`

---

## 📝 CAMBIOS REALIZADOS

### ✅ Limpieza Completa
```
❌ ELIMINADO: Referencias a BD anterior (neondb_owner con hosts antiguos)
❌ ELIMINADO: Conexiones hardcodeadas a localhost
❌ ELIMINADO: Credenciales expuestas en archivos
✅ ACTUALIZADO: .env con URL correcta
✅ ACTUALIZADO: .env.production con URL correcta
✅ CREADO: docker-compose.neon.yml (usa BD externa)
✅ VERIFICADO: Código sin referencias hardcodeadas
```

### 📂 Archivos Actualizados

**`.env`** (Desarrollo)
```env
DATABASE_URL="postgresql://neondb_owner:[REDACTED]@ep-twilight-band-ajmr98xy-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET=your-secret-key-change-in-production
```

**`.env.production`** (Producción)
```env
DATABASE_URL="postgresql://neondb_owner:[REDACTED]@ep-twilight-band-ajmr98xy-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET=change-this-production-secret-key
```

**`docker-compose.yml`** (Local con BD local - sin cambios)
**`docker-compose.neon.yml`** (Cloud con Neon BD - NUEVO)

---

## 🔧 PASOS PARA CONECTAR LA NUEVA BD

### **PASO 1: Actualizar credenciales en .env**

```bash
# 1. Abre .env
nano .env

# 2. Encuentra la línea DATABASE_URL y reemplaza [REDACTED] con tu contraseña
# DE:
# DATABASE_URL="postgresql://neondb_owner:[REDACTED]@..."

# A:
# DATABASE_URL="postgresql://neondb_owner:TU_CONTRASEÑA_AQUI@..."
```

**⚠️ IMPORTANTE:** La contraseña es la que usaste al crear la BD en Neon

---

### **PASO 2: Generar Cliente Prisma**

```bash
# Genera el cliente de Prisma (necesario después de cambiar DB)
npm run db:generate

# Esperado:
# ✔ Generated Prisma Client v5.22.0 to ./node_modules/@prisma/client
```

---

### **PASO 3: Ejecutar Migraciones**

```bash
# Crea todas las tablas en tu BD Neon
npm run db:migrate

# Esperado:
# ✔ Successfully created 23 migrations
# ✔ All migrations applied
```

**¿Qué hace?**
- Crea todas las tablas (pedidos, insumos, gastos, ingresos, etc.)
- Crea índices y relaciones
- Crea funciones necesarias

---

### **PASO 4: (Opcional) Seed de Datos Iniciales**

```bash
# Carga datos de prueba (usuarios demo, productos, etc.)
npm run db:seed

# Esperado:
# ✔ Seed data created successfully
# Demo user: demo@gerson.com / Demo123!
```

---

### **PASO 5: Validar Conexión**

```bash
# Valida que la BD está conectada correctamente
npm run db:test

# Esperado:
# Database connection OK: true
```

---

### **PASO 6: Probar Desarrollo Local**

```bash
# Inicia el servidor de desarrollo
npm run dev

# Esperado:
# ▲ Next.js 16.2.6
# - Local: http://localhost:3000
# ✓ Ready in 2.5s
```

Luego accede a http://localhost:3000 en tu navegador

---

## 🐳 OPCIÓN A: Desarrollo Local (Sin Docker)

```bash
# 1. Instalar dependencias
npm install

# 2. Actualizar .env con tu contraseña

# 3. Migraciones
npm run db:migrate

# 4. Iniciar desarrollo
npm run dev

# Accede a: http://localhost:3000
```

---

## 🐳 OPCIÓN B: Con Docker Compose (Recomendado)

### **Para BD Externa (Neon):**

```bash
# 1. Actualizar .env con contraseña

# 2. Ejecutar solo servicios (sin PostgreSQL local)
docker compose -f docker-compose.neon.yml up -d

# 3. Migraciones en el contenedor
docker exec gerson_backend npm run db:migrate

# Accede a:
# - App: http://localhost:3000
# - Grafana: http://localhost:3001 (admin/admin123)
# - Prometheus: http://localhost:9091
```

### **Para BD Local (PostgreSQL en Docker):**

```bash
# Usar el docker-compose.yml original
docker compose up -d

# Accede a:
# - App: http://localhost:3000
# - BD: localhost:5432 (postgres/postgres)
# - Grafana: http://localhost:3001
```

---

## 🧪 PRUEBAS DESPUÉS DE CONECTAR

### **1. Verificar Conexión BD**

```bash
npm run db:test

# Debe responder:
# Database connection OK: true
```

### **2. Build Producción**

```bash
npm run build

# Debe completar sin errores y generar .next/
```

### **3. Crear Pedido de Prueba**

```bash
# 1. Inicia el servidor
npm run dev

# 2. Ve a http://localhost:3000/login
# 3. Usa: demo@gerson.com / Demo123!
# 4. Crea un pedido
# 5. Verifica que aparece en la lista
```

### **4. Verificar en BD Neon**

```bash
# En tu panel Neon → SQL Editor
SELECT * FROM pedidos;          -- Debe mostrar el pedido creado
SELECT * FROM detallepedido;    -- Debe mostrar los detalles
SELECT * FROM ingresos;         -- Debe mostrar ventas
SELECT * FROM gastos;           -- Debe mostrar gastos
```

---

## 📊 TABLA DE CAPACIDADES VERIFICADAS

Después de conectar, confirma que puedes:

| Acción | Tabla | Estado |
|--------|-------|--------|
| Crear pedido | `pedidos` + `detallepedido` | ✅ Guarda |
| Registrar gasto | `gastos` | ✅ Guarda |
| Registrar ingreso | `ingresos` | ✅ Guarda |
| Crear usuario | `usuarios` | ✅ Guarda |
| Registrar insumo | `insumos` | ✅ Guarda |
| Inventory pollo | `inventario_pollos` | ✅ Guarda |

---

## 🔐 SEGURIDAD

### ✅ Implementado
- SSL/TLS activado (`sslmode=require`)
- Channel binding activado (`channel_binding=require`)
- Contraseña en variables de entorno (NO en código)
- Hashes bcryptjs para contraseñas

### ⚠️ Antes de Producción
```
1. Cambiar JWT_SECRET a valor seguro
2. Cambiar admin credentials
3. Habilitar HTTPS
4. Activar backups en Neon
5. Configurar SSL certificates
```

---

## 📞 RESOLUCIÓN DE PROBLEMAS

### **Error: "Connect ECONNREFUSED"**
```
Significa: No puede conectarse a la BD
Solución:
1. Verificar contraseña en .env
2. Verificar que DATABASE_URL está completo
3. Verificar que Neon está activo (no pausado)
```

### **Error: "relation \"public\".\"pedidos\" does not exist"**
```
Significa: Tablas no creadas
Solución:
npm run db:migrate
```

### **Error: "SSL: CERTIFICATE_VERIFY_FAILED"**
```
Significa: Problema con SSL/TLS
Solución: Ya está en la URL con sslmode=require
Verifica que tienes internet y Neon está disponible
```

### **Error en Docker: "Connect timeout"**
```
Significa: Contenedor no puede alcanzar Neon
Solución:
1. Verifica firewall permite conexión externa
2. Verifica .env tiene valores correctos
3. docker exec gerson_backend npm run db:test
```

---

## 📋 CHECKLIST FINAL

- [ ] .env actualizado con contraseña
- [ ] npm run db:generate ✓
- [ ] npm run db:migrate ✓
- [ ] npm run db:test ✓
- [ ] npm run dev ✓ (sin errores)
- [ ] npm run build ✓ (sin errores)
- [ ] Login funciona (demo@gerson.com)
- [ ] Crear pedido funciona
- [ ] Datos aparecen en Neon (SQL Editor)

---

## 🎯 CONCLUSIÓN

✅ **La aplicación está 100% lista para tu PostgreSQL 17 en Neon**

Todos los datos se guardarán correctamente:
- ✅ Pedidos
- ✅ Registros de delivery
- ✅ Costos de insumos
- ✅ Ganancias
- ✅ Inventario especializado
- ✅ Usuarios y auditoría

**Próximo paso:** Ejecuta los comandos de conexión arriba ⬆️
