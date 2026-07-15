# 🔐 INSTRUCCIONES FINALES - ACTUALIZAR CONTRASEÑA Y CONECTAR

**Estado actual:** ✅ Aplicación lista, sin referencias antiguas  
**Próximo paso:** Actualizar credenciales en `.env`

---

## 📍 UBICACIÓN DE CONTRASEÑA EN NEON

Ve a tu panel Neon y busca:

1. **Dashboard** → Tu proyecto
2. **Databases** → `neondb`
3. **Connection Details** (o "Conexión")
4. Busca la sección **PostgreSQL** (no "REST API")
5. Copia el string de conexión completo

Debería verse así:
```
postgresql://neondb_owner:[AQUÍ_VA_TU_CONTRASEÑA]@ep-twilight-band-ajmr98xy-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## ✏️ PASO 1: ACTUALIZAR .env

### **Opción A: Con Editor de Texto**

```bash
# 1. Abre .env en tu editor favorito
# Archivo: .env

# 2. Encuentra esta línea:
DATABASE_URL="postgresql://neondb_owner:[REDACTED]@ep-twilight-band-ajmr98xy-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# 3. Reemplaza [REDACTED] con tu contraseña real
# Ejemplo:
DATABASE_URL="postgresql://neondb_owner:miContraseña123@ep-twilight-band-ajmr98xy-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# 4. Guarda el archivo
```

### **Opción B: Comando (Linux/Mac/Windows PowerShell)**

```powershell
# 1. Reemplaza 'miContraseña' con tu contraseña real
$contraseña = "miContraseña"

# 2. Ejecuta este comando
(Get-Content .env) -replace '\[REDACTED\]', $contraseña | Set-Content .env

# 3. Verifica que se actualizó
Get-Content .env | Select-String "DATABASE_URL"
```

### **Opción C: Script Python**

```python
# script_actualizar_env.py
contraseña = input("Ingresa tu contraseña de Neon: ")

with open('.env', 'r') as f:
    contenido = f.read()

contenido_nuevo = contenido.replace('[REDACTED]', contraseña)

with open('.env', 'w') as f:
    f.write(contenido_nuevo)

print("✅ .env actualizado correctamente")
```

---

## 🔗 PASO 2: ACTUALIZAR .env.production (Opcional - para Vercel/Producción)

```bash
# Abre .env.production y haz el mismo cambio
# Esta es para cuando deploys a producción

DATABASE_URL="postgresql://neondb_owner:[TU_CONTRASEÑA]@ep-twilight-band-ajmr98xy-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

---

## 🧪 PASO 3: VALIDAR CONEXIÓN

Después de actualizar el `.env`, ejecuta:

```bash
# Genera cliente Prisma
npm run db:generate

# Verifica que puede conectarse
npm run db:test

# Esperado: "Database connection OK: true"
```

Si funciona ✅ → continúa al PASO 4

Si no funciona ❌ → revisa:
- ¿Contraseña correcta?
- ¿Neon BD está activa (no pausada)?
- ¿Tienes internet?

---

## 🏗️ PASO 4: CREAR TABLAS EN NEON

```bash
# Crea todas las tablas en tu BD Neon
npm run db:migrate

# Esperado:
# ✔ Successfully created 23 migrations
# ✔ All migrations applied
```

---

## 👤 PASO 5: CARGAR DATOS DE PRUEBA (Opcional)

```bash
# Crea usuario demo y datos iniciales
npm run db:seed

# Esperado:
# ✔ Seed data created
# Demo user: demo@gerson.com / Demo123!
```

---

## 🚀 PASO 6: INICIAR LA APLICACIÓN

```bash
# Opción A: Desarrollo local
npm run dev

# Accede a: http://localhost:3000
# Login: demo@gerson.com / Demo123!
```

O

```bash
# Opción B: Con Docker (recomendado)
docker compose -f docker-compose.neon.yml up -d

# Espera a que levante (~30 segundos)
docker compose -f docker-compose.neon.yml exec backend npm run db:migrate

# Accede a: http://localhost:3000
```

---

## ✅ VERIFICACIÓN FINAL

Después de conectar, verifica que TODO funciona:

### 1. **Test de Conexión**
```bash
npm run db:test
# Esperado: Database connection OK: true
```

### 2. **Login Funciona**
- Ve a http://localhost:3000/login
- Usuario: `demo@gerson.com`
- Contraseña: `Demo123!`
- Debe redirigir a /dashboard

### 3. **Crear Pedido**
- Ve a /pedidos/nuevo
- Crea un pedido de prueba
- Debe guardarse sin errores

### 4. **Verificar en Neon**
Ve a tu panel Neon → SQL Editor y ejecuta:

```sql
-- Verifica que hay datos
SELECT COUNT(*) as total_pedidos FROM pedidos;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_ingresos FROM ingresos;

-- Debe mostrar números > 0 si creaste datos
```

---

## 📊 CHECKLIST FINAL

- [ ] .env actualizado con contraseña real
- [ ] npm run db:generate ✓
- [ ] npm run db:test responde "OK: true"
- [ ] npm run db:migrate ✓ (tablas creadas)
- [ ] npm run db:seed ✓ (datos cargados)
- [ ] npm run dev ✓ (sin errores)
- [ ] Login funciona
- [ ] Crear pedido funciona
- [ ] Datos aparecen en Neon SQL Editor

---

## 🎯 CONCLUSIÓN

**Una vez completados estos pasos:**

✅ Tu aplicación está **100% conectada** a PostgreSQL 17 en Neon  
✅ Todos los datos se guardan correctamente:
- Pedidos
- Registros de delivery  
- Costos de insumos
- Ganancias
- Usuarios
- Inventario

✅ **Estás listo para usar la aplicación en producción**

---

## 📞 AYUDA - Errores Comunes

### **Error: "password authentication failed"**
```
Solución: Contraseña incorrecta
- Verifica en Neon dashboard
- Copia exactamente (incluyendo caracteres especiales)
```

### **Error: "connect ECONNREFUSED"**
```
Solución: No puede alcanzar servidor
- Verifica que tienes internet
- Verifica que Neon no está pausado
```

### **Error: "relation \"pedidos\" does not exist"**
```
Solución: Tablas no creadas
- Ejecuta: npm run db:migrate
```

### **Error en Docker: timeout**
```
Solución: Contenedor no puede conectar
- docker logs gerson_backend
- Verifica .env dentro del contenedor
```

---

**¿Listo? Ejecuta los pasos arriba y ¡comienza a usar tu aplicación!** 🎉
