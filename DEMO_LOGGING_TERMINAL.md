# 🎯 Demostración Práctica de Logging Estructurado

## 📋 Requisitos para la Implementación

### 1. Instalar las dependencias

```bash
pnpm add pino
pnpm add -D pino-pretty @types/pino
```

### 2. Actualizar package.json

```json
{
  "dependencies": {
    "pino": "^8.x.x"
  },
  "devDependencies": {
    "pino-pretty": "^10.x.x",
    "@types/pino": "^7.x.x"
  },
  "scripts": {
    "dev": "LOG_LEVEL=debug next dev -H 0.0.0.0 -p 3000",
    "dev:trace": "LOG_LEVEL=trace next dev -H 0.0.0.0 -p 3000",
    "start": "next start",
    "logs:error": "grep '\"level\":50' logs/app.log | jq .",
    "logs:warn": "grep '\"level\":40' logs/app.log | jq .",
    "logs:user": "grep 'userId' logs/app.log | jq ."
  }
}
```

---

## 🖥️ Salida en Terminal (Desarrollo)

### Cuando se inicia un request de actualización de usuario:

```
[14:23:45.123] DEBUG (12345): 📥 PUT /api/usuarios/123
    requestId: "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8"
    userId: "user-admin-001"
    method: "PUT"
    path: "/api/usuarios/123"
    action: "request_received"

[14:23:45.134] DEBUG (12345): Solicitud de actualización de usuario recibida
    requestId: "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8"
    userId: "user-admin-001"
    usuarioId: "123"
    email: "juan.perez@example.com"
    rol: "admin"
    action: "usuario_update_received"

[14:23:45.156] DEBUG (12345): Datos preparados para actualización
    requestId: "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8"
    userId: "user-admin-001"
    usuarioId: "123"
    updateData: {
      "correo_user": "juan.perez@example.com",
      "rol": "ADMIN",
      "nombre_user": "Juan",
      "apellido_user": "Pérez"
    }
    action: "usuario_update_data_prepared"

[14:23:45.245] INFO (12345): ✅ PUT /api/usuarios/123 200 (122ms)
    requestId: "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8"
    userId: "user-admin-001"
    method: "PUT"
    path: "/api/usuarios/123"
    statusCode: 200
    duration_ms: 122
    action: "api_request_success"

[14:23:45.247] INFO (12345): Usuario actualizado exitosamente
    requestId: "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8"
    userId: "user-admin-001"
    usuarioId: "123"
    updatedFields: ["correo_user", "rol", "nombre_user", "apellido_user"]
    dbDuration_ms: 89
    action: "usuario_update_success"
```

### Cuando ocurre un error:

```
[14:25:12.456] WARN (12345): Validación fallida: Campos requeridos faltantes
    requestId: "b2c3d4e5-f6g7-5890-b123-c4d5e6f7g8h9"
    userId: "user-admin-001"
    usuarioId: "456"
    missingFields: {
      "email": false,
      "rol": true
    }
    action: "usuario_update_validation_failed"
    reason: "missing_required_fields"

[14:25:12.459] ERROR (12345): ❌ PUT /api/usuarios/456 400 (3ms)
    requestId: "b2c3d4e5-f6g7-5890-b123-c4d5e6f7g8h9"
    userId: "user-admin-001"
    method: "PUT"
    path: "/api/usuarios/456"
    duration_ms: 3
    error: "Email y Rol son requeridos"
    action: "api_request_error"
```

---

## 📊 Salida en Producción (JSON)

Los logs se escriben en formato JSON, listos para ser procesados:

```json
{"level":30,"time":"2026-04-29T14:23:45.123Z","pid":12345,"hostname":"server-1","requestId":"a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8","userId":"user-admin-001","method":"PUT","path":"/api/usuarios/123","action":"request_received","msg":"📥 PUT /api/usuarios/123"}

{"level":20,"time":"2026-04-29T14:23:45.134Z","pid":12345,"hostname":"server-1","requestId":"a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8","userId":"user-admin-001","usuarioId":"123","email":"juan.perez@example.com","rol":"admin","action":"usuario_update_received","msg":"Solicitud de actualización de usuario recibida"}

{"level":20,"time":"2026-04-29T14:23:45.156Z","pid":12345,"hostname":"server-1","requestId":"a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8","userId":"user-admin-001","usuarioId":"123","updateData":{"correo_user":"juan.perez@example.com","rol":"ADMIN","nombre_user":"Juan","apellido_user":"Pérez"},"action":"usuario_update_data_prepared","msg":"Datos preparados para actualización"}

{"level":30,"time":"2026-04-29T14:23:45.245Z","pid":12345,"hostname":"server-1","requestId":"a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8","userId":"user-admin-001","method":"PUT","path":"/api/usuarios/123","statusCode":200,"duration_ms":122,"action":"api_request_success","msg":"✅ PUT /api/usuarios/123 200 (122ms)"}

{"level":30,"time":"2026-04-29T14:23:45.247Z","pid":12345,"hostname":"server-1","requestId":"a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8","userId":"user-admin-001","usuarioId":"123","updatedFields":["correo_user","rol","nombre_user","apellido_user"],"dbDuration_ms":89,"action":"usuario_update_success","msg":"Usuario actualizado exitosamente"}
```

---

## 🔍 Cómo Queryar los Logs

### 1. **Todos los logs de un usuario específico**

```bash
cat logs/app.log | jq 'select(.userId == "user-admin-001")'
```

**Salida:**
```json
{
  "level": 30,
  "time": "2026-04-29T14:23:45.123Z",
  "userId": "user-admin-001",
  "requestId": "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8",
  "action": "usuario_update_success",
  "msg": "Usuario actualizado exitosamente"
}
```

### 2. **Todos los errores (level 50 = ERROR)**

```bash
cat logs/app.log | jq 'select(.level == 50)' | jq '.msg, .error, .errorType'
```

**Salida:**
```json
"Error al actualizar usuario"
"User not found"
"user_not_found"
```

### 3. **Logs de una acción específica**

```bash
cat logs/app.log | jq 'select(.action == "usuario_update_success")'
```

### 4. **Logs entre timestamps específicos**

```bash
cat logs/app.log | jq 'select(.time > "2026-04-29T14:00:00Z" and .time < "2026-04-29T15:00:00Z")'
```

### 5. **Rastrear un request completo por ID**

```bash
cat logs/app.log | jq 'select(.requestId == "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8")' | jq '.time, .action, .msg'
```

**Salida:**
```json
"2026-04-29T14:23:45.123Z"
"request_received"
"📥 PUT /api/usuarios/123"
"2026-04-29T14:23:45.134Z"
"usuario_update_received"
"Solicitud de actualización de usuario recibida"
"2026-04-29T14:23:45.156Z"
"usuario_update_data_prepared"
"Datos preparados para actualización"
"2026-04-29T14:23:45.245Z"
"api_request_success"
"✅ PUT /api/usuarios/123 200 (122ms)"
"2026-04-29T14:23:45.247Z"
"usuario_update_success"
"Usuario actualizado exitosamente"
```

### 6. **Performance: encontrar requests lentos**

```bash
cat logs/app.log | jq 'select(.duration_ms > 1000)' | jq '.path, .method, .duration_ms, .statusCode'
```

**Salida:**
```json
"/api/pedidos"
"POST"
1234
201
```

### 7. **Alertas: encontrar errores por tipo**

```bash
cat logs/app.log | jq 'select(.level == 50) | group_by(.errorType) | map({errorType: .[0].errorType, count: length})'
```

**Salida:**
```json
[
  {
    "errorType": "user_not_found",
    "count": 3
  },
  {
    "errorType": "unique_constraint_violation",
    "count": 1
  },
  {
    "errorType": "unauthorized",
    "count": 2
  }
]
```

---

## 🎨 Niveles de Log Explicados

| Nivel | Valor | Color | Uso | Ejemplo |
|-------|-------|-------|-----|---------|
| **TRACE** | 10 | Magenta | Detalles muy granulares | Entrada/salida de función |
| **DEBUG** | 20 | Azul | Información de debugging | Variables, estado intermedio |
| **INFO** | 30 | Verde | Eventos importantes | Éxito de operación, inicio/fin |
| **WARN** | 40 | Amarillo | Advertencias | Validación fallida, timeout |
| **ERROR** | 50 | Rojo | Errores | Excepciones, fallos |
| **FATAL** | 60 | Rojo Bold | Errores críticos | Crash de aplicación |

---

## 🚀 Cómo Iniciar para Demostrarlo

### Paso 1: Instalar dependencias
```bash
pnpm add pino pino-pretty
```

### Paso 2: Crear archivos
- `lib/logger.ts` ✅ (ya creado)
- `lib/logging-middleware.ts` ✅ (ya creado)

### Paso 3: Reemplazar en un endpoint
Usar `EJEMPLO_REFACTORIZACION_LOGGING.ts` como referencia

### Paso 4: Iniciar desarrollo
```bash
pnpm dev
```

### Paso 5: Hacer un request
```bash
curl -X PUT http://localhost:3000/api/usuarios/123 \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-admin-001" \
  -H "x-request-id: a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "admin"
  }'
```

### Paso 6: Ver los logs en la terminal

¡Deberías ver el output estructurado como se muestra arriba!

---

## 📈 Integración con Herramientas de Observabilidad

### Datadog

```typescript
import DatadogHttpLoggerTransport from 'winston-datadog-http-transport'

export const datadogTransport = new DatadogHttpLoggerTransport({
  apiKey: process.env.DATADOG_API_KEY,
  service: 'gerson-api',
  hostname: os.hostname(),
  region: 'us'
})
```

### ELK Stack (Elasticsearch)

```bash
# Enviar logs a Elasticsearch
cat logs/app.log | jq -s . | curl -X POST "localhost:9200/logs/_doc" -H 'Content-Type: application/json' -d @-
```

### CloudWatch (AWS)

```typescript
import AWSSDKv3 from 'pino-aws-cloudwatch'

const transport = pino.transport({
  target: 'pino-aws-cloudwatch',
  options: {
    logGroupName: '/aws/lambda/gerson-api',
    logStreamName: 'production',
    awsRegion: 'us-east-1'
  }
})
```

---

## ✅ Resumen de Beneficios

| Aspecto | Antes | Después |
|--------|-------|---------|
| **Búsqueda** | ❌ grep text | ✅ jq queries complejas |
| **Timestamps** | ❌ No | ✅ Automático (ms precision) |
| **Contexto** | ❌ Manual | ✅ Estructura JSON |
| **Request ID** | ❌ No | ✅ Trazabilidad completa |
| **Performance** | ❌ Desconocido | ✅ duration_ms medido |
| **Análisis** | ❌ Manual | ✅ Automático/BI tools |
| **Escalabilidad** | ❌ Logs perdidos | ✅ Centralizados |
| **Alertas** | ❌ No | ✅ Basadas en eventos |
