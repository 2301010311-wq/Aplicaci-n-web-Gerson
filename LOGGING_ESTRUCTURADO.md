# Logging Estructurado - Análisis y Propuesta

## 📊 Estado Actual del Proyecto

### ❌ NO tiene logging estructurado implementado

El proyecto actualmente usa `console.log()` y `console.error()` de manera **desordenada y inconsistente**.

#### Ejemplos del estado actual:

```typescript
// app/api/usuarios/[id]/route.ts
console.log("PUT /api/usuarios/[id] - Datos recibidos:", { id, nombre, email, rol })
console.log("PUT /api/usuarios/[id] - Datos a actualizar:", updateData)
console.log("PUT /api/usuarios/[id] - Usuario actualizado exitosamente")

// app/api/auth/login/route.ts
console.error("Error en login:", error)

// app/api/finanzas/gastos/route.ts
console.error("Error:", error)

// components/registros-table.tsx
console.log(`Total pedidos del API: ${pedidosData.length}`)
console.log("Estados únicos:", [...new Set(pedidosData.map((p: any) => p.estado))])
```

**Problemas:**
- ✗ Logs en texto plano (no JSON)
- ✗ Sin timestamps automáticos
- ✗ Sin niveles de severidad (info, warn, error)
- ✗ Sin identificadores de request (request ID, user ID)
- ✗ Difícil de buscar y analizar
- ✗ Imposible integrar con herramientas de observabilidad
- ✗ Inconsistencia de formato

---

## 📚 ¿Qué es Logging Estructurado?

Logging estructurado significa registrar eventos en **formato JSON con contexto estructurado**:

### Ejemplo de Logging Tradicional (❌):
```
2026-04-29T14:23:45 Error al actualizar usuario: TypeError: Cannot read property...
```

### Ejemplo de Logging Estructurado (✅):
```json
{
  "timestamp": "2026-04-29T14:23:45.123Z",
  "level": "error",
  "service": "gerson-api",
  "module": "usuarios",
  "method": "PUT",
  "path": "/api/usuarios/123",
  "userId": "user-456",
  "requestId": "req-789-abc",
  "message": "Error al actualizar usuario",
  "error": "TypeError: Cannot read property",
  "errorStack": "...",
  "duration_ms": 245,
  "statusCode": 500
}
```

---

## 🎯 Ventajas del Logging Estructurado

| Aspecto | Logging Tradicional | Logging Estructurado |
|--------|-------------------|----------------------|
| **Búsqueda** | Grep text plano | Queries JSON complejas |
| **Análisis** | Manual | Automatizado |
| **Contexto** | Limitado | Completo |
| **Observabilidad** | No | Sí (Datadog, ELK, etc.) |
| **Performance** | - | Se puede medir |
| **Debugging** | Lento | Rápido |
| **Escalabilidad** | ❌ | ✅ |

---

## 🚀 Cómo Implementar: Opción Recomendada (Pino)

### 1. Instalar Pino

```bash
pnpm add pino
pnpm add -D @types/pino
```

### 2. Crear utilidad de logger

**`lib/logger.ts`:**
```typescript
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    }
  }
})

export default logger
```

### 3. Usar en APIs

**Antes (❌):**
```typescript
export async function PUT(request: NextRequest) {
  try {
    const { id, nombre, email, rol } = await request.json()
    console.log("PUT /api/usuarios/[id] - Datos recibidos:", { id, nombre, email, rol })
    
    const usuario = await prisma.usuarios.update({
      where: { id: Number(id) },
      data: { nombre_user: nombre, correo_user: email, rol }
    })
    
    console.log("PUT /api/usuarios/[id] - Usuario actualizado exitosamente")
    return NextResponse.json(usuario)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}
```

**Después (✅):**
```typescript
import logger from '@/lib/logger'
import { requireAuth } from '@/lib/middleware-auth'

export async function PUT(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
  const auth = await requireAuth(["Admin"])
  
  try {
    const { id, nombre, email, rol } = await request.json()
    
    logger.info({
      requestId,
      userId: auth.userId,
      action: 'usuario_update_start',
      usuarioId: id,
      email
    }, "Iniciando actualización de usuario")
    
    const usuario = await prisma.usuarios.update({
      where: { id: Number(id) },
      data: { nombre_user: nombre, correo_user: email, rol }
    })
    
    logger.info({
      requestId,
      userId: auth.userId,
      action: 'usuario_update_success',
      usuarioId: id
    }, "Usuario actualizado exitosamente")
    
    return NextResponse.json(usuario)
  } catch (error) {
    logger.error({
      requestId,
      userId: auth.userId,
      action: 'usuario_update_error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, "Error al actualizar usuario")
    
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}
```

---

## 📋 Salida Estructurada Ejemplo

### Stdout en Desarrollo (Pretty):
```
[14:23:45.123] INFO: Iniciando actualización de usuario
    requestId: req-789-abc
    userId: user-456
    action: usuario_update_start
    usuarioId: 123
    email: gerson@example.com

[14:23:45.345] INFO: Usuario actualizado exitosamente
    requestId: req-789-abc
    userId: user-456
    action: usuario_update_success
    usuarioId: 123
```

### JSON en Producción:
```json
{"level":30,"time":"2026-04-29T14:23:45.123Z","requestId":"req-789-abc","userId":"user-456","action":"usuario_update_start","usuarioId":123,"email":"gerson@example.com","msg":"Iniciando actualización de usuario"}
{"level":30,"time":"2026-04-29T14:23:45.345Z","requestId":"req-789-abc","userId":"user-456","action":"usuario_update_success","usuarioId":123,"msg":"Usuario actualizado exitosamente"}
```

---

## 🔍 Middleware para Auto-Logging

**`lib/logging-middleware.ts`:**
```typescript
import logger from './logger'
import { NextRequest, NextResponse } from 'next/server'

export async function withLogging(
  handler: (req: NextRequest) => Promise<NextResponse>,
  request: NextRequest
) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  const { method, url, headers } = request
  const userId = headers.get('x-user-id') || 'anonymous'
  
  logger.info({
    requestId,
    userId,
    method,
    path: new URL(url).pathname,
    action: 'request_start'
  }, `${method} ${url}`)
  
  try {
    const response = await handler(request)
    const duration = Date.now() - startTime
    
    logger.info({
      requestId,
      userId,
      method,
      path: new URL(url).pathname,
      statusCode: response.status,
      duration_ms: duration,
      action: 'request_success'
    }, `${method} ${url} ${response.status}`)
    
    return response
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error({
      requestId,
      userId,
      method,
      path: new URL(url).pathname,
      duration_ms: duration,
      error: error instanceof Error ? error.message : String(error),
      action: 'request_error'
    }, 'Request error')
    
    throw error
  }
}
```

---

## 📊 Cómo Demostrarlo

### 1. **En Desarrollo Local**
```bash
# Con salida pretty (legible)
LOG_LEVEL=debug pnpm dev
```

### 2. **Buscar Logs por Request**
```bash
# Todos los logs de un usuario específico
cat logs/app.log | grep "userId.*user-456"

# Todos los errores
cat logs/app.log | grep "level.*error"

# Logs de una acción específica
cat logs/app.log | grep "action.*usuario_update"
```

### 3. **Integración con Herramientas**
Enviar logs a:
- **Datadog**: Dashboard centralizado
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **CloudWatch** (AWS)
- **Splunk**
- **New Relic**

---

## ✅ Checklist de Implementación

- [ ] Instalar `pino`
- [ ] Crear `lib/logger.ts`
- [ ] Crear middleware de logging
- [ ] Actualizar `app/api/auth/login/route.ts`
- [ ] Actualizar `app/api/usuarios/route.ts`
- [ ] Actualizar `app/api/pedidos/route.ts`
- [ ] Agregar contexto de request ID
- [ ] Configurar niveles de log por entorno
- [ ] Documentar patrones de logging
- [ ] Integrar con herramienta de observabilidad

---

## 📝 Comparativa de Opciones

| Logger | Ventajas | Desventajas |
|--------|----------|------------|
| **Pino** ⭐ | Ultra rápido, JSON, popular | Requiere setup |
| **Winston** | Flexible, múltiples transportes | Más complejo |
| **Bunyan** | JSON structure | Menos mantenido |
| **console.log** | Nativo | Desordenado, lento |

**Recomendación: Usar Pino**

---

## 🎓 Conclusión

**El proyecto GERSON NO tiene logging estructurado.**

Para implementarlo:
1. Instalar Pino
2. Crear `lib/logger.ts`
3. Reemplazar `console.log()` con `logger.info()`
4. Reemplazar `console.error()` con `logger.error()`
5. Agregar contexto (requestId, userId, action)

Esto permitirá:
- ✅ Búsqueda y análisis eficiente
- ✅ Observabilidad en producción
- ✅ Debugging rápido
- ✅ Integración con herramientas profesionales
