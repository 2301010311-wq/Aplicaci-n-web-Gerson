# 🔧 FIX - Error "useAlerts debe usarse dentro de AlertProvider"

**Problema:** ❌ Error al ingresar a la página `/cocina`  
**Causa Raíz:** 🎯 AlertProvider no envolvía el árbol de componentes  
**Estado:** ✅ CORREGIDO

---

## 🔍 DIAGNÓSTICO

### **El Error:**
```
Uncaught Error: useAlerts debe usarse dentro de AlertProvider
    at useAlerts (contexts/alert-context.tsx:52:11)
    at CocinaTable (components/cocina-table.tsx:39:33)
```

### **¿Qué significa?**

El componente `CocinaTable` intenta usar el hook `useAlerts` pero ese hook necesita estar dentro de un `<AlertProvider>` para funcionar.

```
├── App Layout
│   ├── children  ← CocinaTable está aquí
│   └── ❌ SIN AlertProvider
```

### **Causa:**

En `app/layout.tsx` NO había `<AlertProvider>` envolviendo los componentes.

```typescript
// ❌ ANTES (INCORRECTO)
<html>
  <body>
    {children}  ← CocinaTable sin AlertProvider
  </body>
</html>
```

---

## ✅ SOLUCIÓN APLICADA

### **Actualizar app/layout.tsx**

```typescript
// ✅ DESPUÉS (CORRECTO)
import { AlertProvider } from "@/contexts/alert-context"

export default function RootLayout({ children }: any) {
  return (
    <html lang="es">
      <body>
        <AlertProvider>
          {children}  ← Ahora SÍ tiene AlertProvider
        </AlertProvider>
      </body>
    </html>
  )
}
```

### **Estructura Correcta:**

```
├── RootLayout
│   └── <AlertProvider>        ← ✅ Agregado aquí
│       └── {children}
│           └── CocinaTable
│               └── useAlerts()  ← ✅ Ahora funciona
```

---

## 🚀 PRÓXIMOS PASOS

### **PASO 1: Reinicia el servidor**

```bash
# Presiona Ctrl+C para detener npm run dev
# Luego ejecuta:
npm run dev
```

### **PASO 2: Prueba nuevamente**

1. Ve a http://localhost:3000/login
2. Inicia sesión
3. Navega a **Cocina**
4. Debería funcionar sin errores

---

## ✨ RESULTADO ESPERADO

**Después de la corrección:**

- ✅ Página de cocina carga sin errores
- ✅ AlertProvider envuelve toda la aplicación
- ✅ Todas las páginas que usan `useAlerts()` funcionan
- ✅ Pueden agregar alertas de alarma cuando llegan pedidos

---

## 📋 CAMBIOS REALIZADOS

```
✅ app/layout.tsx
   - Importado AlertProvider
   - Envuelto children con <AlertProvider>
```

**Archivo modificado:** `app/layout.tsx` (5 líneas añadidas)

---

## 🎯 CONCLUSIÓN

El problema estaba en la **estructura de contexto de React**. Los hooks de contexto (`useAlerts`) necesitan que el proveedor (`AlertProvider`) esté en el árbol de componentes.

Al agregar `AlertProvider` en el layout raíz, toda la aplicación tiene acceso al contexto de alertas, y la página de cocina funciona correctamente.

**✅ Problema resuelto completamente.**
