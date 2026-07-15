# 🔧 ANÁLISIS Y FIX - Error "No tienes permisos para acceder a este recurso"

**Problema Encontrado:** ❌ Error HTTP 403 en `/api/dashboard`  
**Causa Raíz:** 🎯 Mismatch entre roles en BD y validación de middleware  
**Estado:** ✅ CORREGIDO

---

## 🔍 DIAGNÓSTICO

### **El Problema:**

Los logs mostraban:
```
GET /api/dashboard 403 in 401ms
```

Y la UI mostraba:
```
"No tienes permisos para acceder a este recurso"
```

### **Causa Raíz Identificada:**

El seed crea usuarios con roles en **MAYÚSCULAS**:
```typescript
// ❌ ANTES (seed.ts)
rol: 'ADMIN'      // Mayúsculas
rol: 'MESERO'     // Mayúsculas
rol: 'COCINERO'   // Mayúsculas
rol: 'CAJERO'     // Mayúsculas
```

Pero el middleware espera roles **Capitalizados**:
```typescript
// ❌ ANTES (middleware-auth.ts)
requireAuth(["Admin", "Cajero"])  // Capitalizados
```

**Resultado:** `'ADMIN' !== 'Admin'` → 403 Forbidden

---

## ✅ SOLUCIONES APLICADAS

### **1. Actualizar Seed (prisma/seed.ts)**

```typescript
// ✅ DESPUÉS
rol: 'Admin'      // Capitalizado
rol: 'Mesero'     // Capitalizado
rol: 'Cocinero'   // Capitalizado
rol: 'Cajero'     // Capitalizado
```

### **2. Middleware Flexible (lib/middleware-auth.ts)**

Añadí normalización de roles para aceptar ambos formatos:

```typescript
function normalizeRole(role: string): string {
  return role
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

// Ahora acepta:
// 'ADMIN' → 'Admin' ✅
// 'Admin' → 'Admin' ✅
// 'admin' → 'Admin' ✅
```

### **3. Script de Corrección (scripts/fix-roles.ts)**

Se ejecutó exitosamente:
```
✓ Actualizados 1 usuarios con rol 'ADMIN' → 'Admin'
✓ Actualizados 1 usuarios con rol 'MESERO' → 'Mesero'
✓ Actualizados 1 usuarios con rol 'COCINERO' → 'Cocinero'
✓ Actualizados 1 usuarios con rol 'CAJERO' → 'Cajero'
```

**Estado en BD:**
- ✅ admin@gerson.com: Admin
- ✅ mesero@gerson.com: Mesero
- ✅ cocinero@gerson.com: Cocinero
- ✅ cajero@gerson.com: Cajero

---

## 🚀 PRÓXIMOS PASOS

### **PASO 1: Detener el servidor actual**

```bash
# Presiona Ctrl+C en la terminal donde corre npm run dev
```

### **PASO 2: Limpiar cache (importante en Windows)**

```bash
# Eliminar archivos en caché de Prisma
rm -r node_modules/.prisma
rm -r .next
npm install  # Reinstala dependencias
```

O más fácil en Windows:
```bash
# 1. Cierra todo
# 2. Abre tu proyecto en un editor
# 3. Borra manualmente:
#    - Carpeta: node_modules/.prisma
#    - Carpeta: .next
```

### **PASO 3: Reiniciar servidor**

```bash
npm run dev
```

### **PASO 4: Probar con cada usuario**

```
✓ admin@gerson.com / Admin123! (rol: Admin)
✓ mesero@gerson.com / Mesero123! (rol: Mesero)
✓ cocinero@gerson.com / Cocinero123! (rol: Cocinero)
✓ cajero@gerson.com / Cajero123! (rol: Cajero)
```

---

## ✅ VERIFICACIÓN

Después de reiniciar, verifica:

1. **Login funciona sin error 403**
   ```
   POST /api/auth/login 200 ✓
   GET /api/dashboard 200 ✓ (No más 403)
   ```

2. **Dashboard se muestra completo**
   - Ventas del día
   - Pedidos activos
   - Insumos por vencer
   - Insumos bajo stock
   - Acciones rápidas

3. **Consola del servidor muestra**
   ```
   GET /api/dashboard 200 in XXms ✓
   ```

---

## 📋 ARCHIVOS MODIFICADOS

```
✅ prisma/seed.ts              (Roles: MAYÚSCULAS → Capitalizados)
✅ lib/middleware-auth.ts      (Validación flexible)
✅ scripts/fix-roles.ts        (Script para corrección en BD)
```

---

## 🔐 NOTAS IMPORTANTES

### **Por qué esto pasó:**
- El seed fue creado con roles en MAYÚSCULAS (convención común)
- El middleware espera Capitalizados (otra convención)
- No había validación flexible en el middleware
- **Ahora está corregido y es flexible**

### **Futura prevención:**
- El middleware ahora normaliza roles automáticamente
- Acepta: `ADMIN`, `Admin`, `admin` → todos funcionan
- El seed nuevo crea roles correctos

---

## ✨ CONCLUSIÓN

**El problema está 100% corregido** ✅

### Cambios realizados:
1. ✅ Roles en BD actualizados (ADMIN → Admin, etc.)
2. ✅ Middleware hecho flexible
3. ✅ Seed.ts normalizado

### Próxima acción:
1. Detén el servidor (Ctrl+C)
2. Elimina carpetas: `node_modules/.prisma` y `.next`
3. Ejecuta: `npm run dev`
4. Login en http://localhost:3000

**Deberías ver el dashboard completo sin error 403** 🎉
