// lib/validations/auth.ts - Esquemas de validación con Zod
import { z } from 'zod'

// Schema para login
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email es requerido' })
    .min(1, 'Email es requerido')
    .email('Formato de email inválido')
    .transform(email => email.toLowerCase().trim()),

  password: z
    .string({ required_error: 'Contraseña es requerida' })
    .min(1, 'Contraseña es requerida')
})

// Schema para crear usuario
export const createUserSchema = z.object({
  nombre: z
    .string({ required_error: 'Nombre es requerido' })
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nombre solo puede contener letras y espacios'),

  apellido: z
    .string({ required_error: 'Apellido es requerido' })
    .min(2, 'Apellido debe tener al menos 2 caracteres')
    .max(50, 'Apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Apellido solo puede contener letras y espacios'),

  email: z
    .string({ required_error: 'Email es requerido' })
    .min(1, 'Email es requerido')
    .email('Formato de email inválido')
    .transform(email => email.toLowerCase().trim()),

  password: z
    .string({ required_error: 'Contraseña es requerida' })
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .max(128, 'Contraseña no puede exceder 128 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Contraseña debe contener al menos una mayúscula, una minúscula y un número'),

  rol: z.enum(['Admin', 'Mesero', 'Cocinero', 'Cajero'], {
    errorMap: () => ({ message: 'Rol debe ser Admin, Mesero, Cocinero o Cajero' })
  })
})

// Schema para actualizar usuario (campos opcionales)
export const updateUserSchema = z.object({
  nombre: z
    .string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nombre solo puede contener letras y espacios')
    .optional(),

  apellido: z
    .string()
    .min(2, 'Apellido debe tener al menos 2 caracteres')
    .max(50, 'Apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Apellido solo puede contener letras y espacios')
    .optional(),

  email: z
    .string()
    .email('Formato de email inválido')
    .transform(email => email.toLowerCase().trim())
    .optional(),

  rol: z.enum(['Admin', 'Mesero', 'Cocinero', 'Cajero'], {
    errorMap: () => ({ message: 'Rol debe ser Admin, Mesero, Cocinero o Cajero' })
  }).optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  'Al menos un campo debe ser proporcionado para actualizar'
)

// Tipos inferidos de los schemas
export type LoginInput = z.infer<typeof loginSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

// Función helper para validar y retornar errores formateados
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // Formatear errores de Zod a un objeto simple
  const errors: Record<string, string> = {}
  result.error.errors.forEach((error) => {
    const path = error.path.join('.')
    errors[path] = error.message
  })

  return { success: false, errors }
}

### 2. **Falta Rate Limiting**
```typescript
// ❌ ACTUAL: Sin protección contra brute force
// ✅ RECOMENDADO: Implementar rate limiting
// Opciones: express-rate-limit, upstash/ratelimit, o middleware custom
```

### 3. **Secrets Hardcoded**
```typescript
// ❌ ACTUAL: Fallback inseguro
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "polleria-gerson-secret-key-2024")

// ✅ RECOMENDADO: Sin fallbacks, forzar variable de entorno
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no configurado')
}
const secret = new TextEncoder().encode(process.env.JWT_SECRET)
```

### 4. **Falta Protección contra Ataques Comunes**

#### **CORS no configurado**
```typescript
// ❌ ACTUAL: Sin configuración CORS
// ✅ RECOMENDADO: En next.config.mjs
const nextConfig = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGINS || 'http://localhost:3000' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ]
  },
}
```

#### **Falta Headers de Seguridad**
```typescript
// ✅ RECOMENDADO: Agregar headers de seguridad
{
  key: 'X-Frame-Options',
  value: 'DENY'
},
{
  key: 'X-Content-Type-Options',
  value: 'nosniff'
},
{
  key: 'Referrer-Policy',
  value: 'strict-origin-when-cross-origin'
}
```

### 5. **Falta Sanitización de Datos**
```typescript
// ❌ ACTUAL: Sin sanitización
const { nombre, email } = await request.json()

// ✅ RECOMENDADO: Sanitizar inputs
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const window = new JSDOM('').window
const DOMPurifyServer = DOMPurify(window)

const sanitizedNombre = DOMPurifyServer.sanitize(nombre)
```

### 6. **Falta Validación de Sesiones**
```typescript
// ❌ ACTUAL: Sin validación adicional de sesiones
// ✅ RECOMENDADO: Verificar sesiones expiradas en middleware
export async function validateSession(session: JWTPayload): Promise<boolean> {
  // Verificar si el usuario aún existe
  // Verificar si el rol no cambió
  // Verificar si la sesión no fue revocada
}
```

### 7. **Falta Protección CSRF**
```typescript
// ❌ ACTUAL: Sin protección CSRF
// ✅ RECOMENDADO: Implementar tokens CSRF para forms sensibles
// O usar SameSite cookies estrictas
```

### 8. **Falta Auditoría de Seguridad**
```typescript
// ❌ ACTUAL: Sin logging de eventos de seguridad
// ✅ RECOMENDADO: Log de eventos críticos
logger.security({
  event: 'login_attempt',
  userId: user?.id,
  ip: request.ip,
  userAgent: request.headers.get('user-agent'),
  success: true/false
})
```

---

## 📊 MATRIZ DE RIESGOS

| Categoría | Riesgo | Severidad | Estado |
|-----------|--------|-----------|--------|
| **Autenticación** | JWT secret fallback | Alto | ⚠️ Parcial |
| **Autorización** | Sin rate limiting | Alto | ❌ Faltante |
| **Input Validation** | Sin schemas Zod | Medio | ❌ Faltante |
| **XSS** | Sin sanitización | Medio | ❌ Faltante |
| **CSRF** | Sin protección | Medio | ❌ Faltante |
| **Headers** | Sin security headers | Bajo | ❌ Faltante |
| **CORS** | Sin configuración | Bajo | ❌ Faltante |
| **Auditoría** | Sin logs de seguridad | Bajo | ❌ Faltante |

---

## 🚀 RECOMENDACIONES DE MEJORA

### **Prioridad Alta (Implementar primero)**
1. **Eliminar JWT_SECRET fallback** - Forzar variable de entorno
2. **Implementar rate limiting** en endpoints de auth
3. **Usar Zod para validación** de todos los inputs

### **Prioridad Media**
4. **Configurar CORS** apropiadamente
5. **Agregar headers de seguridad** básicos
6. **Implementar sanitización** de inputs

### **Prioridad Baja**
7. **Agregar auditoría** de eventos de seguridad
8. **Implementar CSRF protection**
9. **Validación avanzada de sesiones**

---

## 🛠️ EJEMPLO DE IMPLEMENTACIÓN RÁPIDA

### **1. Rate Limiting Básico**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests por minuto
})

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier)
  return success
}
```

### **2. Validación con Zod**
```typescript
// lib/validations/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida')
})

export const createUserSchema = z.object({
  nombre: z.string().min(2, 'Nombre muy corto').max(50, 'Nombre muy largo'),
  apellido: z.string().min(2, 'Apellido muy corto').max(50, 'Apellido muy largo'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener mayúscula, minúscula y número'),
  rol: z.enum(['Admin', 'Mesero', 'Cocinero', 'Cajero'], {
    errorMap: () => ({ message: 'Rol inválido' })
  })
})
```

### **3. Middleware de Seguridad**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Headers de seguridad
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: '/api/:path*'
}
```

---

## 📈 PUNTUACIÓN DE SEGURIDAD ACTUAL

**Puntuación: 6.5/10**

### **Breakdown:**
- ✅ Autenticación: 8/10 (bcrypt + JWT bueno, pero secret fallback)
- ✅ Autorización: 7/10 (roles implementados)
- ✅ SQL Injection: 9/10 (Prisma protege bien)
- ❌ Input Validation: 3/10 (básica, sin schemas)
- ❌ Rate Limiting: 0/10 (no implementado)
- ❌ Headers/CORS: 2/10 (mínimo)
- ✅ Password Hashing: 9/10 (bcrypt correcto)

**El proyecto tiene bases sólidas de seguridad pero necesita mejoras en validación y protección contra ataques comunes.**</content>
<parameter name="filePath">c:\Users\DAVID\OneDrive\Escritorio\GERSON-main\ANALISIS_SEGURIDAD.md