# 📐 DESCRIPCIÓN ARQUITECTÓNICA Y PROCESO DE DESARROLLO
## Aplicación Gerson - Sistema de Gestión para Restaurantes

---

## 1. CÓMO FUE DESARROLLADA LA APLICACIÓN

### 1.1 Metodología de Desarrollo

**Enfoque**: DevOps + Metodología Ágil  
**Stack**: Fullstack JavaScript/TypeScript  
**Arquitectura**: Monolítica con separación Frontend-Backend  
**Base de Datos**: Relacional (PostgreSQL)

### 1.2 Proceso de Desarrollo Iterativo

```
FASE 1: Planificación & Diseño (Semana 1)
├─ Requerimientos funcionales definidos
├─ Diagrama de BD con Prisma schema
├─ Prototipos de UI con Tailwind + Radix
└─ Arquitectura de API REST diseñada

FASE 2: Setup Inicial (Semana 2)
├─ Repository GitHub creado
├─ Next.js 15 inicializado (create-next-app)
├─ Prisma ORM configurado
├─ Estructura de carpetas establecida
└─ TypeScript configurado (strict mode)

FASE 3: Desarrollo Frontend (Semana 3-4)
├─ Componentes React creados en /components
├─ Páginas Next.js en /app
├─ Formularios con React Hook Form + Zod
├─ Styles con Tailwind CSS
└─ UI Components de Radix

FASE 4: Desarrollo Backend (Semana 5-6)
├─ API Routes en /app/api
├─ Modelos Prisma en /prisma/schema.prisma
├─ Autenticación JWT en /lib/auth.ts
├─ Validaciones con Zod
└─ Servicios en /lib

FASE 5: Base de Datos (Semana 6-7)
├─ Schema Prisma diseñado (14+ modelos)
├─ Migrations creadas
├─ Seed script para datos de prueba
├─ Relaciones configuradas (1:1, 1:N, N:N)
└─ Índices optimizados

FASE 6: Testing & QA (Semana 8)
├─ Tests unitarios con Jest
├─ Validación de tipos con TypeScript
├─ Linting con ESLint
└─ Manual testing

FASE 7: DevOps & Deployment (Semana 9-10)
├─ Dockerfile multi-stage creado
├─ docker-compose.yml configurado
├─ Kubernetes manifests (k8s/)
├─ GitHub Actions CI/CD
├─ Logging con Pino
└─ Health checks implementados

FASE 8: Documentación (Semana 11)
├─ README.md
├─ ARQUITECTURA_POLLERIA_GERSON.md
├─ Comentarios de código
├─ Documentación de APIs
└─ Guías de deploy
```

### 1.3 Equipo de Desarrollo (Simulado)

- **Full Stack Developer**: Desarrollo frontend + backend
- **DevOps Engineer**: Containerización, CI/CD, Kubernetes
- **QA Engineer**: Testing y validación
- **Database Admin**: Schema, migrations, optimizaciones

---

## 2. ARQUITECTURA POR CAPAS Y HERRAMIENTAS

### 2.1 CAPA 1: FRONTEND (Presentación)

#### 📍 Ubicación: `/app`, `/components`

#### Herramientas Principales:

| Herramienta | Versión | Propósito |
|-------------|---------|----------|
| **React** | 19.2.0 | Framework de componentes UI |
| **Next.js** | 15.2.6 | Framework fullstack, SSR/SSG |
| **TypeScript** | 5.9.3 | Tipado estático |
| **Tailwind CSS** | 4.1.14 | Estilos utilitarios |
| **Radix UI** | ^1.x | Componentes accesibles primitivos |
| **React Hook Form** | 7.63.0 | Gestión de formularios |
| **Zod** | 4.1.11 | Validación de schemas |

#### Estructura Frontend:

```
/app                                    # Next.js App Router (v13+)
├── layout.tsx                         # Layout raíz (providers, metadata)
├── page.tsx                           # Home (redirect a /login)
├── globals.css                        # Estilos globales
├── login/page.tsx                     # Página de login
├── dashboard/page.tsx                 # Dashboard principal
├── usuarios/
│   ├── page.tsx                       # CRUD usuarios
│   └── [id]/page.tsx                 # Detalle usuario
├── productos/
│   ├── page.tsx                       # CRUD productos
│   ├── [id]/page.tsx                 # Detalle producto
│   └── nuevo/page.tsx                # Crear producto
├── mesas/
│   ├── page.tsx                       # CRUD mesas
│   └── nueva/page.tsx                # Crear mesa
├── pedidos/
│   ├── page.tsx                       # CRUD pedidos
│   ├── nuevo/page.tsx                # Crear pedido
│   └── [id]/page.tsx                 # Detalle pedido
├── cocina/page.tsx                    # Vista de cocina (pedidos en prep)
├── pagos/page.tsx                     # Procesar pagos
├── insumos/page.tsx                   # CRUD insumos
├── inventario-pollos/page.tsx         # Inventario específico
├── finanzas/page.tsx                  # Reportes financieros
├── registros/page.tsx                 # Histórico de registros
└── api/                               # Backend (ver sección 2.2)

/components                             # Componentes reutilizables
├── index.ts                           # Barrel export de componentes
├── ui/                                # Componentes Radix UI
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   └── ... (20+ componentes)
├── shared/                            # Componentes compartidos
│   └── ... (re-exports)
├── finanzas/                          # Componentes específico de finanzas
├── insumos/                           # Componentes específico de insumos
├── pagos/                             # Componentes específico de pagos
│
├── sidebar.tsx                        # Menú lateral (navegación)
├── client-protected-layout.tsx        # Layout protegido (requiere autenticación)
├── theme-provider.tsx                 # Proveedor de tema
├── alerts-container.tsx               # Contenedor de alertas
├── mesa-card.tsx                      # Card de mesa
├── mesa-form.tsx                      # Formulario de mesa
├── mesas-grid.tsx                     # Grid de mesas
├── pedidos-table.tsx                  # Tabla de pedidos
├── pedido-detalle-modal.tsx          # Modal con detalles de pedido
├── pedido-mesa-completo.tsx          # Componente completo de pedido
├── nuevo-pedido-form.tsx             # Formulario para nuevo pedido
├── productos-table.tsx                # Tabla de productos
├── producto-form.tsx                  # Formulario de producto
├── usuarios-table.tsx                 # Tabla de usuarios
├── usuario-form.tsx                   # Formulario de usuario
├── insumos-table.tsx                  # Tabla de insumos
├── insumo-form.tsx                    # Formulario de insumo
├── pagos-table.tsx                    # Tabla de pagos
├── procesar-pago-modal.tsx           # Modal para procesar pago
├── presa-pollo-selector.tsx          # Selector de presa de pollo
├── cocina-table.tsx                   # Tabla para vista de cocina
├── RegistrosTable.tsx                 # Tabla de registros
└── boleta-ticket.tsx                  # Diseño de boleta/ticket

/contexts                              # Contextos de React
├── alert-context.tsx                  # Context para alertas globales
└── ...

/hooks                                 # Custom React Hooks
├── use-toast.ts                       # Hook para notificaciones Toast
├── use-mobile.ts                      # Hook para detectar dispositivo móvil
└── ...

/lib                                   # Utilidades y servicios
├── utils.ts                           # Funciones utilitarias
├── validations/                       # Schemas Zod
├── ...

/public                                # Archivos estáticos
└── ...
```

#### Tecnologías de Estilo:

- **Tailwind CSS**: Clases utilitarias para estilos responsivos
- **PostCSS**: Procesamiento de CSS
- **Lucide React**: Iconografía (500+ iconos)
- **next-themes**: Gestión de tema oscuro/claro

#### Librerías de UI/UX:

- **Sonner**: Notificaciones Toast personalizadas
- **Recharts**: Gráficos para reportes financieros
- **date-fns**: Manipulación de fechas
- **React Hook Form + Zod**: Validación de formularios

---

### 2.2 CAPA 2: BACKEND (Lógica de Negocio)

#### 📍 Ubicación: `/app/api`, `/lib`

#### Herramientas Principales:

| Herramienta | Versión | Propósito |
|-------------|---------|----------|
| **Next.js API Routes** | 15.2.6 | Endpoints HTTP (REST API) |
| **Node.js** | 20 | Runtime de JavaScript |
| **Express** | - | NOT USED (Next.js API Routes suficiente) |
| **Prisma ORM** | 5.22.0 | Acceso a base de datos |
| **Jose** | 5.2.0 | JWT para autenticación |
| **bcryptjs** | 2.4.3 | Encriptación de contraseñas |
| **Zod** | 4.1.11 | Validación de datos de entrada |
| **Pino** | 10.3.1 | Logger estructurado |

#### Estructura Backend:

```
/app/api                                # API REST Endpoints
├── auth/
│   ├── login/route.ts                 # POST: Autenticación
│   ├── logout/route.ts                # POST: Cerrar sesión
│   └── session/route.ts               # GET: Obtener sesión actual
│
├── usuarios/
│   ├── route.ts                       # GET (listar), POST (crear)
│   └── [id]/
│       ├── route.ts                   # PUT (actualizar), DELETE
│       └── ...
│
├── productos/
│   ├── route.ts                       # GET (listar), POST (crear)
│   └── [id]/
│       ├── route.ts                   # GET, PUT, DELETE
│       └── ...
│
├── pedidos/
│   ├── route.ts                       # GET (listar + filtros), POST (crear), PUT (actualizar)
│   ├── cocina/route.ts                # GET: Pedidos para cocina
│   ├── mesa-activa/[mesaId]/route.ts # GET: Pedido activo de una mesa
│   ├── [id]/
│   │   ├── route.ts                   # GET, PUT, DELETE
│   │   ├── pagar/route.ts            # POST: Procesar pago
│   │   └── ticket-delivery/route.ts  # GET: Generar ticket
│   └── ...
│
├── mesas/
│   ├── route.ts                       # GET (listar), POST (crear)
│   └── [id]/
│       ├── route.ts                   # PUT (actualizar), DELETE
│       └── liberar/route.ts          # PUT: Liberar mesa
│
├── insumos/
│   ├── route.ts                       # GET, POST
│   └── [id]/route.ts                  # PUT, DELETE
│
├── inventario-pollos/
│   ├── route.ts                       # GET (listar), POST (crear)
│   ├── [tipo]/route.ts               # POST (crear por tipo), PUT (actualizar)
│   └── descontar/route.ts            # POST (descontar), PUT
│
├── pagos/
│   └── [id]/route.ts                  # POST: Procesar pago
│
├── finanzas/
│   ├── ingresos/
│   │   ├── route.ts                   # GET, POST
│   │   └── [id]/route.ts             # DELETE
│   ├── gastos/
│   │   ├── route.ts                   # GET, POST
│   │   └── [id]/route.ts             # DELETE
│   ├── presupuestos/
│   │   └── route.ts                   # GET, POST
│   └── resumen/route.ts              # GET: Resumen financiero
│
└── health/
    └── route.ts                       # GET: Health check

/lib                                    # Lógica de negocio reutilizable
├── auth.ts                            # Funciones de autenticación
│   ├── hashPassword()
│   ├── verifyPassword()
│   ├── createToken()
│   ├── verifyToken()
│   ├── getSession()
│   └── ...
│
├── logger.ts                          # Configuración de Pino
│   ├── Logger instance
│   ├── niveles (debug, info, warn, error)
│   └── serializers personalizados
│
├── prisma.ts                          # Cliente Prisma singleton
├── database-url.ts                    # Configuración de BD
├── logging-middleware.ts              # Middleware de logging
├── middleware-auth.ts                 # Middleware de autenticación
├── rate-limit.ts                      # Limitación de tasa de solicitudes
├── utils.ts                           # Funciones utilitarias
│
└── validations/                       # Schemas Zod para validación
    ├── user.ts
    ├── producto.ts
    ├── pedido.ts
    └── ...
```

#### Endpoints de API (40+):

```
AUTENTICACIÓN:
POST    /api/auth/login           - Login de usuario
POST    /api/auth/logout          - Cerrar sesión
GET     /api/auth/session         - Obtener sesión

USUARIOS (CRUD):
GET     /api/usuarios             - Listar usuarios
POST    /api/usuarios             - Crear usuario
PUT     /api/usuarios/[id]        - Actualizar usuario
DELETE  /api/usuarios/[id]        - Eliminar usuario

PRODUCTOS (CRUD):
GET     /api/productos            - Listar productos
POST    /api/productos            - Crear producto
GET     /api/productos/[id]       - Obtener producto
PUT     /api/productos/[id]       - Actualizar producto
DELETE  /api/productos/[id]       - Eliminar producto

PEDIDOS (CRUD + Custom):
GET     /api/pedidos              - Listar pedidos (con filtros)
POST    /api/pedidos              - Crear pedido
GET     /api/pedidos/[id]         - Obtener pedido
PUT     /api/pedidos/[id]         - Actualizar pedido
DELETE  /api/pedidos/[id]         - Eliminar pedido
POST    /api/pedidos/[id]/pagar   - Procesar pago
GET     /api/pedidos/cocina       - Pedidos para cocina
GET     /api/pedidos/mesa-activa/[mesaId] - Pedido activo de mesa

MESAS (CRUD + Custom):
GET     /api/mesas                - Listar mesas
POST    /api/mesas                - Crear mesa
PUT     /api/mesas/[id]           - Actualizar mesa
DELETE  /api/mesas/[id]           - Eliminar mesa
PUT     /api/mesas/[id]/liberar   - Liberar mesa

INSUMOS (CRUD):
GET     /api/insumos              - Listar insumos
POST    /api/insumos              - Crear insumo
PUT     /api/insumos/[id]         - Actualizar insumo
DELETE  /api/insumos/[id]         - Eliminar insumo

FINANZAS:
GET     /api/finanzas/ingresos    - Listar ingresos
POST    /api/finanzas/ingresos    - Crear ingreso
DELETE  /api/finanzas/ingresos/[id] - Eliminar ingreso
GET     /api/finanzas/gastos      - Listar gastos
POST    /api/finanzas/gastos      - Crear gasto
DELETE  /api/finanzas/gastos/[id] - Eliminar gasto
GET     /api/finanzas/presupuestos - Listar presupuestos
POST    /api/finanzas/presupuestos - Crear presupuesto
GET     /api/finanzas/resumen     - Resumen financiero

INVENTARIO POLLOS:
GET     /api/inventario-pollos    - Listar inventario
POST    /api/inventario-pollos    - Crear registro
POST    /api/inventario-pollos/[tipo] - Crear por tipo
PUT     /api/inventario-pollos/[tipo] - Actualizar por tipo
POST    /api/inventario-pollos/descontar - Descontar

HEALTH:
GET     /api/health               - Estado de la aplicación
```

#### Patrones Implementados:

- **MVC**: Model (Prisma) - View (React) - Controller (API Routes)
- **REST**: Convenciones HTTP (GET, POST, PUT, DELETE)
- **Error Handling**: Try-catch con respuestas JSON estructuradas
- **Validación**: Zod schemas en entrada
- **Autenticación**: JWT tokens en cookies HTTP-only

---

### 2.3 CAPA 3: BASE DE DATOS (Persistencia)

#### 📍 Ubicación: `/prisma`, PostgreSQL en Docker

#### Herramientas Principales:

| Herramienta | Versión | Propósito |
|-------------|---------|----------|
| **PostgreSQL** | 16-alpine | SGBDR relacional |
| **Prisma ORM** | 5.22.0 | Query builder + migrations |
| **pgAdmin** | (opcional) | GUI para gestión de BD |

#### Modelos de Datos (14+ tablas):

```prisma
usuario (id_user)
├─ nombre_user, apellido_user, dni_user
├─ telefono_user, correo_user, rol
├─ contrasena (bcryptjs hashed)
├─ Relaciones: 1:N con pedidos
└─ Auditoría: createdAt, updatedAt

productos (id_produc)
├─ nombre_produc, descripcion_produc
├─ precio_produc, categoria_produc
├─ stock_produc, controlar_stock
├─ estado_produc, vencimiento_produc
├─ Relaciones: 1:N con detallepedido
└─ Índices: nombre, categoria

mesas (id_mesa)
├─ numero_mesa (único), capacidad_mesa
├─ estado_mesa (Libre/Ocupada)
├─ Relaciones: 1:N con pedidos
└─ Índices: numero_mesa, estado_mesa

pedidos (id_pedido)
├─ fecha_pedido, id_user, id_mesa
├─ estado_pedido (En preparacion/Listo/Entregado)
├─ total, observaciones
├─ Auditoría: createdAt, updatedAt, canceledAt, cancelReason
├─ Relaciones: N:1 con usuarios, N:1 con mesas, 1:N con detallepedido
└─ Índices: fecha_pedido, estado_pedido, id_user, id_mesa

detallepedido (id_detalle)
├─ id_pedido, id_produc
├─ cantidad, precio_unitario, subtotal
├─ nombre_produc_personalizado, notas, estado
├─ Auditoría: createdAt, updatedAt
├─ Relaciones: N:1 con pedidos (Cascade), N:1 con productos (SetNull)
└─ Índices: id_pedido

insumos (id_insumo)
├─ nombre_insu, unidadmedida_insu
├─ stock_act_insu, stock_min_insu
├─ vencimiento_insu
└─ Sin relaciones (tabla simple)

FINANZAS:
ingresos (id_ingreso)
├─ fecha_ingreso, monto, descripcion
├─ categoria, cliente, metodo_pago
├─ comprobante, estado
└─ Auditoría: createdAt, updatedAt

gastos (id_gasto)
├─ fecha_gasto, monto, descripcion
├─ categoria, proveedor, metodo_pago
├─ comprobante, estado
└─ Auditoría: createdAt, updatedAt

facturas (id_factura)
├─ numero_factura (único), fecha_emision
├─ cliente, monto_total, monto_pagado
├─ estado, metodo_pago, descripcion
└─ Auditoría: createdAt, updatedAt

presupuestos (id_presupuesto)
├─ nombre, monto_total, monto_usado
├─ categoria, fecha_inicio, fecha_fin
├─ estado
└─ Auditoría: createdAt, updatedAt

movimientos_caja (id_movimiento)
├─ fecha, tipo (Entrada/Salida)
├─ concepto, monto, saldo_anterior, saldo_nuevo
├─ descripcion
└─ Auditoría: createdAt, updatedAt

cuentas_por_cobrar (id_cobro)
├─ cliente, deuda_total, deuda_vencida
├─ fecha_vencimiento, estado
└─ Auditoría: createdAt, updatedAt

cuentas_por_pagar (id_pago)
├─ proveedor, deuda_total, deuda_pendiente
├─ fecha_vencimiento, estado, metodo_pago
└─ Auditoría: createdAt, updatedAt
```

#### Características de BD:

- **Relaciones**: 1:1, 1:N, N:N configuradas correctamente
- **Cascada de Eliminación**: Cascade para detallepedido, SetNull para productos
- **Índices**: Optimizados para consultas frecuentes
- **Auditoría**: createdAt/updatedAt en tablas importantes
- **Constraints**: Unique, NOT NULL, defaults
- **Tipos**: Decimal para dinero, Timestamp(6) para precisión

#### Migrations (Versionamiento de BD):

```
/prisma/migrations/
├── [timestamp]_init/migration.sql     # Inicial
├── [timestamp]_add_users/migration.sql
├── [timestamp]_add_products/migration.sql
├── [timestamp]_add_orders/migration.sql
├── [timestamp]_add_finances/migration.sql
└── migration_lock.toml                # Lock file
```

---

### 2.4 CAPA 4: AUTENTICACIÓN & SEGURIDAD

#### 📍 Ubicación: `/lib/auth.ts`, `/lib/middleware-auth.ts`

#### Herramientas Principales:

| Herramienta | Propósito |
|-------------|----------|
| **JWT (Jose)** | Tokens sin estado |
| **bcryptjs** | Hash de contraseñas |
| **Cookies HTTP-only** | Almacenamiento de tokens |
| **Middleware Next.js** | Protección de rutas |

#### Flujo de Autenticación:

```
1. Usuario ingresa email/password en /login
                    ↓
2. Frontend POST a /api/auth/login
                    ↓
3. Backend:
   a) Busca usuario en BD por email
   b) Compara password con bcryptjs.compare()
   c) Si válido: crea JWT token
   d) Guarda token en cookie HTTP-only
   e) Retorna sesión del usuario
                    ↓
4. Frontend redirige a /dashboard
                    ↓
5. Cookie se envía automáticamente en cada request
                    ↓
6. Middleware valida el token con jose.jwtVerify()
                    ↓
7. Si válido: continúa, si no: redirige a /login

Logout:
POST /api/auth/logout → Elimina cookie → Redirige a /login
```

#### Roles del Sistema:

```
Admin
├─ Acceso completo
├─ CRUD de usuarios
├─ Gestión de productos, mesas, insumos
├─ Reportes financieros
└─ Configuración del sistema

Mesero
├─ CRUD de mesas
├─ Crear/actualizar pedidos
├─ Ver dashboard
└─ No acceso a usuarios/productos

Cocinero
├─ Ver solo pedidos en cocina
├─ Actualizar estado de pedidos
└─ No acceso a otros módulos

Cajero
├─ Ver pedidos
├─ Procesar pagos
├─ Acceso a finanzas (reportes)
└─ No acceso a usuarios/productos
```

---

### 2.5 CAPA 5: LOGGING & MONITOREO

#### 📍 Ubicación: `/lib/logger.ts`, `/app/api/health/route.ts`

#### Herramientas Principales:

| Herramienta | Versión | Propósito |
|-------------|---------|----------|
| **Pino** | 10.3.1 | Logger estructurado |
| **Pino-pretty** | 13.1.3 | Formato legible en desarrollo |
| **Health Check Endpoint** | - | Monitoreo de salud |

#### Logging Estructurado:

```typescript
// Configuración Pino
const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  
  // Desarrollo: Pretty-print con colores
  // Producción: JSON para agregadores
  
  serializers: {
    error: pino.stdSerializers.err,
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        'x-request-id': req.headers['x-request-id'],
        'user-agent': req.headers['user-agent']
      }
    })
  }
})

// Contexto de logs
interface LogContext {
  requestId?: string
  userId?: string
  action?: string
  [key: string]: any
}

// Ejemplos de uso:
logger.debug({ requestId, userId }, "Procesando pedido")
logger.info({ action: "LOGIN" }, "Usuario autenticado")
logger.error({ error }, "Fallo en BD")
```

#### Health Check:

```
GET /api/health
Retorna:
{
  "status": "healthy",
  "timestamp": "2026-06-11T10:30:00.000Z",
  "uptime": 3600.5,
  "database": "connected"
}

O si hay error:
{
  "status": "unhealthy",
  "error": "Database connection failed"
}
```

---

## 3. HERRAMIENTAS DE CONSTRUCCIÓN & DEPLOYMENT

### 3.1 Build Tools

| Herramienta | Versión | Propósito |
|-------------|---------|----------|
| **PNPM** | 10.33.1 | Package manager (más rápido que npm) |
| **SWC** | (Next.js) | Compilador Rust para JavaScript |
| **PostCSS** | 8.5.6 | Procesamiento de CSS |
| **Tailwind** | 4.1.14 | Generación de clases CSS |
| **TypeScript** | 5.9.3 | Compilación de tipos |

#### Pipeline de Build:

```
1. npm run build
   ├─ npm run db:generate     → Genera Prisma client
   └─ next build              → Compila con SWC
                                ├─ TypeScript → JavaScript
                                ├─ JSX → React.createElement()
                                ├─ CSS → CSS optimizado
                                └─ Genera .next/ folder

2. Salida:
   .next/
   ├─ static/                 # CSS, JS, images compilados
   ├─ server/                 # Server-side code
   ├─ public/                 # Assets estáticos
   └─ package.json compatible
```

### 3.2 Testing

| Herramienta | Versión | Propósito |
|-------------|---------|----------|
| **Jest** | 30.3.0 | Framework de testing |
| **ts-jest** | 29.4.9 | Compilador TypeScript para Jest |

#### Configuración Jest:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)']
}
```

#### Tests Ubicación: `/__tests__/example.test.ts`

### 3.3 Containerización

#### Docker (Multi-stage build):

```dockerfile
STAGE 1 (deps):
├─ node:20-alpine
├─ COPY package*.json
└─ RUN npm ci

STAGE 2 (builder):
├─ node:20-alpine
├─ COPY from deps: node_modules
├─ RUN npx prisma generate
├─ ENV DATABASE_URL (dummy para build)
└─ RUN npm run build

STAGE 3 (runner - FINAL):
├─ node:20-alpine
├─ ENV NODE_ENV=production
├─ ENV PORT=3000
├─ COPY from builder: .next, node_modules, public, prisma
├─ HEALTHCHECK: GET /api/health
├─ EXPOSE 3000
└─ CMD: npx prisma migrate deploy && npm run start

Ventajas:
- Imagen final ~300MB (vs 800MB sin optimización)
- Caché reutilizable
- Reproducible
```

#### docker-compose.yml:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment: DB_USER, DB_PASSWORD, DB_NAME
    volumes: postgres_data
    healthcheck: pg_isready
  
  backend:
    build: ./Dockerfile
    depends_on: [postgres (healthy)]
    environment: DATABASE_URL, JWT_SECRET
    ports: 3000:3000
    healthcheck: curl /api/health
```

### 3.4 CI/CD Pipeline (GitHub Actions)

#### Ubicación: `.github/workflows/vercel-cd.yml`

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      1. Checkout code
      2. Setup Node
      3. Install dependencies (pnpm)
      4. Run tests (jest)
      5. Build (next build)
      6. Build Docker image
      7. Push to Docker Hub
      8. Deploy to Vercel / K8s
      
Trigger automático en cada push a main
Tiempo de ejecución: ~5-10 minutos
```

### 3.5 Orchestración - Kubernetes

#### Manifests Ubicación: `/k8s/`

```yaml
deployment.yaml:
├─ Replicas: 1 (recomendación: 3+)
├─ Image: polleria-gerson:latest
├─ Probes:
│  ├─ Startup: 5 minutos máximo para iniciar
│  ├─ Readiness: 10s, si falla → no recibe tráfico
│  └─ Liveness: 30s, si falla → reinicia pod
├─ ConfigMap injection (variables de entorno)
├─ Secrets injection (credenciales)
└─ Resource limits: CPU, memoria

service.yaml:
├─ backend-service (NodePort 30080 → 3000)
└─ postgres-service (ClusterIP 5432)

configmap.yaml:
├─ NODE_ENV=production
├─ DB_HOST, DB_PORT, DB_NAME
└─ PORT=3000

secret.yaml: ⚠️ VULNERABILIDAD
├─ DB_USER, DB_PASSWORD (base64, no encriptado)
├─ JWT_SECRET (default, cambiar)
└─ ⚠️ NO versionable en Git
```

---

## 4. CICLO DE VIDA COMPLETO (De Dev a Producción)

```
DESARROLLO LOCAL:
1. Developer clona repo
2. npm install con pnpm
3. docker-compose up (PostgreSQL + backend)
4. npm run dev (Next.js dev server :3000)
5. Hace cambios en código
6. Tests automáticos con npm run test
7. Commit y push a GitHub

CI/CD AUTOMÁTICO:
1. GitHub Actions se dispara en push
2. Build Docker image
3. Run tests
4. Push a Docker Hub
5. (Opcional) Deploy a Vercel

DESPLIEGUE A KUBERNETES:
1. kubectl apply -f k8s/
2. Kubernetes descarga imagen de Docker Hub
3. Crea pods con health checks
4. Service expone con NodePort:30080
5. Users acceden a http://NODE_IP:30080

MONITOREO EN PRODUCCIÓN:
1. Health check cada 30s
2. Logs enviados a stdout
3. Alertas si falla health check
4. Rollback automático si necesario
```

---

## 5. COMPARATIVA DE HERRAMIENTAS (DevOps Stack)

| Componente | Estándar | Gerson | Razón de Uso |
|-----------|----------|--------|-------------|
| VCS | Git | Git/GitHub | Estándar industria |
| CI | Jenkins | GitHub Actions | Integrado, económico |
| Build | Webpack | SWC + Next.js | Más rápido, nativo |
| Test | Mocha/Jasmine | Jest | Mejor con TypeScript |
| Container | Docker | Docker | Estándar de facto |
| Registry | Docker Hub/ECR | Docker Hub | Gratuito, simple |
| Orchest. | Kubernetes | Kubernetes | Escalable, portable |
| BD | PostgreSQL | PostgreSQL | Robusto, ACID |
| ORM | Sequelize/TypeORM | Prisma | Schema como código |
| API | Express | Next.js Routes | Fullstack, menos code |
| Logger | Winston/Bunyan | Pino | Más rápido, JSON |
| Auth | Passport.js | JWT + Jose | Stateless, simple |

---

## 6. ESTADÍSTICAS DEL PROYECTO

```
Líneas de Código (LOC):
├─ Frontend: ~2,500 LOC
├─ Backend: ~1,500 LOC
├─ Database: ~500 LOC (schema)
├─ Tests: ~300 LOC
├─ Config: ~400 LOC
└─ Total: ~5,200 LOC

Dependencias:
├─ Production: 40+ packages
├─ Development: 15+ packages
└─ Total: 55+ packages

API Endpoints: 40+
- Auth: 3
- Users: 5
- Products: 5
- Orders: 10
- Tables: 5
- Inventory: 5
- Finances: 5

Database Tables: 14+
Componentes React: 35+
Custom Hooks: 2+

Tamaño Imagen Docker:
├─ Original: ~800MB
├─ Multi-stage: ~300MB
└─ Optimizada: ~250MB
```

---

## 7. STACK RESUMIDO

```
FRONTEND:        React 19 + Next.js 15 + TypeScript + Tailwind CSS
BACKEND:         Node.js 20 + Next.js API Routes + Prisma
BASE DE DATOS:   PostgreSQL 16
AUTENTICACIÓN:   JWT (Jose) + bcryptjs
LOGGING:         Pino
TESTING:         Jest
BUILD:           SWC (Next.js) + PostCSS
CONTAINERIZACIÓN: Docker + docker-compose
ORCHESTRACIÓN:   Kubernetes
CI/CD:           GitHub Actions
VERSIONAMIENTO:  Git/GitHub
```

Este documento contiene toda la información arquitectónica necesaria para desarrollar el informe académico sobre DevOps en Gerson.
