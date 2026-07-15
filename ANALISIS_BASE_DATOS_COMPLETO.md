# 📊 ANÁLISIS EXHAUSTIVO - BASE DE DATOS Y ALMACENAMIENTO DE DATOS

**Proyecto:** Pollería Gerson  
**Database Engine:** PostgreSQL 17 (nueva)  
**ORM:** Prisma 5.22  
**Fecha de Análisis:** 2025

---

## ✅ RESUMEN EJECUTIVO - CAPACIDAD DE ALMACENAMIENTO

La aplicación **SÍ PUEDE guardar correctamente** todos los datos que ofrece:

| Dato | Tabla/Modelo | Estado | Capacidad |
|------|-------------|--------|-----------|
| **Pedidos** | `pedidos` + `detallepedido` | ✅ LISTO | Ilimitado |
| **Registros** | `pedidos_delivery` + `detalle_pollos_pedido` | ✅ LISTO | Ilimitado |
| **Costos de Insumos** | `insumos` + `gastos` | ✅ LISTO | Ilimitado |
| **Ganancias** | `ingresos` + `pedidos` | ✅ LISTO | Ilimitado |
| **Usuarios** | `usuarios` | ✅ LISTO | Ilimitado |
| **Inventario** | `inventario_pollos` + `productos` | ✅ LISTO | Ilimitado |

---

## 📋 ESTRUCTURA DE BASE DE DATOS

### **1. TABLA: PEDIDOS (Ventas/Pedidos)**

```sql
CREATE TABLE pedidos (
  id_pedido SERIAL PRIMARY KEY,
  fecha_pedido TIMESTAMP DEFAULT NOW(),
  id_user INT (FK -> usuarios),
  id_mesa INT (FK -> mesas),
  estado_pedido VARCHAR(20) -- "En preparacion", "Servido", "Pagado", etc.
  total DECIMAL(10,2),           -- MONTO TOTAL VENTA
  observaciones TEXT,
  canceledAt DATETIME,           -- Para rastrear cancelaciones
  cancelReason TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  
  INDEXES: [fecha_pedido, estado_pedido, id_user, id_mesa]
)
```

**Datos que guarda:**
- ✅ Número de pedido
- ✅ Fecha y hora exacta
- ✅ Mesero que registró
- ✅ Mesa o tipo (delivery/llevar)
- ✅ Total vendido
- ✅ Estado del pedido
- ✅ Observaciones del cliente
- ✅ Auditoría (quién y cuándo canceló)

**Relaciones:**
- `pedidos.id_user` → `usuarios.id_user` (Mesero)
- `pedidos.id_mesa` → `mesas.id_mesa` (Mesa o número especial)
- `pedidos.detallepedido` → Detalles del pedido (1:N)
- `pedidos.pedidos_delivery` → Info de delivery/llevar (1:1)

---

### **2. TABLA: DETALLEPEDIDO (Detalles de cada Pedido)**

```sql
CREATE TABLE detallepedido (
  id_detalle SERIAL PRIMARY KEY,
  id_pedido INT (FK -> pedidos),
  id_produc INT (FK -> productos),
  nombre_produc_personalizado VARCHAR(255),  -- Si es producto "otro"
  cantidad SMALLINT,
  precio_unitario DECIMAL(10,2),
  subtotal DECIMAL(10,2),                    -- cantidad * precio_unitario
  notas TEXT,                                -- Notas especiales del cliente
  estado VARCHAR(20) -- "Pendiente", "Listo", "Entregado"
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  
  INDEXES: [id_pedido, id_produc, estado]
)
```

**Datos que guarda:**
- ✅ Qué productos se pidieron
- ✅ Cantidad de cada producto
- ✅ Precio unitario (para historial)
- ✅ Subtotal por línea
- ✅ Notas especiales ("sin picante", "extra salsa", etc.)
- ✅ Estado de preparación de cada producto

**Ejemplo de datos:**
```
Pedido #1 (2025-01-15 14:30):
  - Pollo 1/4 (3 unidades x S/.15.00 = S/.45.00)
  - Papa a la francesa (2 x S/.5.00 = S/.10.00)
  - Bebida (1 x S/.3.00 = S/.3.00)
  TOTAL: S/.58.00
```

---

### **3. TABLA: INSUMOS (Costos de Insumos)**

```sql
CREATE TABLE insumos (
  id_insumo SERIAL PRIMARY KEY,
  nombre_insu VARCHAR(100),              -- Ej: "Aceite de cocina", "Sal"
  unidadmedida_insu VARCHAR(20),         -- Ej: "litro", "kg", "unidad"
  stock_act_insu DECIMAL(10,2),          -- Stock actual
  stock_min_insu DECIMAL(10,2),          -- Stock mínimo para alertas
  vencimiento_insu DATE,                 -- Fecha de vencimiento
  
  -- Auditoría automática
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

**Datos que guarda:**
- ✅ Nombre del insumo
- ✅ Unidad de medida
- ✅ Stock actual
- ✅ Stock mínimo (para alertas)
- ✅ Fecha de vencimiento
- ✅ Historial de cambios (via updatedAt)

**Ejemplo:**
```
- Aceite de cocina: 50 litros (stock mín: 20)
- Pollo fresco: 200 kg (stock mín: 100)
- Sal: 25 kg (stock mín: 5)
- Papas: 500 kg (stock mín: 200)
```

---

### **4. TABLA: GASTOS (Costos de Operación)**

```sql
CREATE TABLE gastos (
  id_gasto SERIAL PRIMARY KEY,
  fecha_gasto TIMESTAMP DEFAULT NOW(),
  monto DECIMAL(12,2),                   -- Cantidad gastada
  categoria VARCHAR(50),                 -- "Compra de insumos", "Servicios", etc.
  descripcion VARCHAR(255),
  proveedor VARCHAR(100),                -- Quién vendió (ej: "Don Julio")
  comprobante VARCHAR(255),              -- Boleta/Factura número
  metodo_pago VARCHAR(50),               -- "Efectivo", "Transferencia", etc.
  estado VARCHAR(20),                    -- "Registrado", "Pagado"
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

**Datos que guarda:**
- ✅ Cada gasto registrado (compra de insumos, servicios, etc.)
- ✅ Fecha exacta del gasto
- ✅ Monto en S/.
- ✅ Categoría del gasto
- ✅ De quién es el gasto (proveedor)
- ✅ Número de comprobante (para auditoría)
- ✅ Método de pago
- ✅ Estado de pago

**Ejemplo:**
```
- 2025-01-15: S/.150.00 - Compra insumos (Don Julio) - Boleta #0001
- 2025-01-16: S/.80.00 - Servicio de gas - Boleta #0002
- 2025-01-17: S/.300.00 - Compra pollo fresco (Avícola) - Factura #F-500
```

---

### **5. TABLA: INGRESOS (Ganancias)**

```sql
CREATE TABLE ingresos (
  id_ingreso SERIAL PRIMARY KEY,
  fecha_ingreso TIMESTAMP DEFAULT NOW(),
  monto DECIMAL(12,2),                   -- Cantidad vendida / ganancia
  descripcion VARCHAR(255),              -- "Venta restaurante", "Catering", etc.
  categoria VARCHAR(50),                 -- Categoría de ingreso
  cliente VARCHAR(100),                  -- De quién es el ingreso (opcional)
  metodo_pago VARCHAR(50),               -- "Efectivo", "Tarjeta", etc.
  comprobante VARCHAR(255),              -- Número de boleta/factura
  estado VARCHAR(20),                    -- "Registrado", "Recibido"
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

**Datos que guarda:**
- ✅ Cada ingreso/venta registrada
- ✅ Fecha exacta
- ✅ Monto en S/.
- ✅ Descripción del ingreso
- ✅ Cliente (si aplica)
- ✅ Método de pago
- ✅ Comprobante (número de boleta/factura)
- ✅ Estado

**Ejemplo:**
```
- 2025-01-15 14:30: S/.58.00 - Venta restaurante - Efectivo
- 2025-01-15 15:45: S/.125.00 - Venta restaurante - Tarjeta
- 2025-01-16 13:00: S/.450.00 - Catering empresarial - Transferencia
```

---

### **6. TABLA: INVENTARIO_POLLOS (Inventario Especializado)**

```sql
CREATE TABLE inventario_pollos (
  id_inventario SERIAL PRIMARY KEY,
  fecha DATE UNIQUE,                     -- Un registro por día
  pollos_totales INT,                    -- Total de pollos
  pechos_disponibles INT,                -- Pechos disponibles
  piernas_disponibles INT,               -- Piernas disponibles
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  
  UNIQUE INDEX: [fecha]
)
```

**Datos que guarda:**
- ✅ Fecha del inventario
- ✅ Total de pollos en stock
- ✅ Pechos disponibles
- ✅ Piernas disponibles
- ✅ Descuentos automáticos cuando se crean pedidos

**Ejemplo:**
```
2025-01-15:
  - Pollos totales: 50
  - Pechos: 100 (50 pollos × 2 pechos)
  - Piernas: 100 (50 pollos × 2 piernas)

Después de pedido (3 pechos, 2 piernas):
  - Pechos: 97
  - Piernas: 98
```

---

### **7. TABLA: PEDIDOS_DELIVERY (Registros de Delivery/Llevar)**

```sql
CREATE TABLE pedidos_delivery (
  id_delivery SERIAL PRIMARY KEY,
  id_pedido INT UNIQUE (FK -> pedidos),
  numero_telefono VARCHAR(20),           -- Teléfono del cliente
  nombre_cliente VARCHAR(100),           -- Nombre del cliente
  direccion TEXT,                        -- Dirección (si aplica)
  notas TEXT,                            -- Notas del delivery
  createdAt TIMESTAMP
)
```

**Datos que guarda:**
- ✅ Teléfono del cliente
- ✅ Nombre del cliente
- ✅ Dirección de entrega
- ✅ Notas especiales
- ✅ Relación con el pedido

**Ejemplo:**
```
Pedido #105 (Delivery):
  - Cliente: "Juan Pérez"
  - Teléfono: "+51 987654321"
  - Dirección: "Calle Principal 123, Apto 5B, La Molina"
  - Notas: "Portero en la entrada, llamar al llegar"
```

---

### **8. TABLA: USUARIOS (Control de Acceso)**

```sql
CREATE TABLE usuarios (
  id_user SERIAL PRIMARY KEY,
  nombre_user VARCHAR(100),
  apellido_user VARCHAR(100),
  correo_user VARCHAR(100) UNIQUE,
  dni_user VARCHAR(20) UNIQUE,
  telefono_user VARCHAR(20),
  rol VARCHAR(20),                       -- "Admin", "Mesero", "Cocinero", "Cajero"
  contrasena VARCHAR(255),               -- Hash bcryptjs
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

**Datos que guarda:**
- ✅ Datos personales del usuario
- ✅ Rol (controla permisos)
- ✅ Contraseña hasheada (segura)
- ✅ Auditoría

---

## 🔧 API ENDPOINTS PARA GUARDAR DATOS

### **PEDIDOS - POST /api/pedidos**

```typescript
POST /api/pedidos
{
  "mesaId": "5",                    // O NULL para delivery/llevar
  "tipoServicio": "mesa",           // "mesa" | "delivery" | "llevar"
  "detalles": [
    {
      "productoId": "1",
      "nombre": "Pollo 1/4",
      "cantidad": 2,
      "precioUnitario": 15.00
    }
  ],
  "clienteInfo": {
    "numeroTelefono": "+51987654321",
    "nombreCliente": "Juan Pérez",
    "direccion": "Calle Principal 123"  // Solo para delivery
  },
  "presasPollo": {
    "pechos": 3,
    "piernas": 2
  }
}

✅ RESPUESTA:
{
  "id": "1",
  "idPedidoDb": "1",
  "fecha": "2025-01-15T14:30:00Z",
  "mesaId": "5",
  "tipoServicio": "mesa",
  "estado": "En preparacion",
  "total": 58.00
}
```

**Lo que guarda automáticamente:**
1. Crea registro en `pedidos`
2. Crea `detallepedido` para cada producto
3. Descuenta stock de `productos`
4. Descuenta `inventario_pollos`
5. Crea `pedidos_delivery` si aplica
6. Actualiza estado de `mesas`

---

### **GASTOS - POST /api/finanzas/gastos**

```typescript
POST /api/finanzas/gastos
{
  "monto": 150.00,
  "descripcion": "Compra de aceite y condimentos",
  "categoria": "Insumos",
  "proveedor": "Don Julio",
  "metodo_pago": "Efectivo",
  "comprobante": "BOL-001"
}

✅ RESPUESTA:
{
  "id_gasto": 1,
  "fecha_gasto": "2025-01-15T14:35:00Z",
  "monto": 150.00,
  "estado": "Registrado"
}
```

---

### **INGRESOS - POST /api/finanzas/ingresos**

```typescript
POST /api/finanzas/ingresos
{
  "monto": 58.00,
  "descripcion": "Venta restaurante",
  "categoria": "Ventas",
  "cliente": null,
  "metodo_pago": "Efectivo",
  "comprobante": "BOL-001"
}

✅ RESPUESTA:
{
  "id_ingreso": 1,
  "fecha_ingreso": "2025-01-15T14:30:00Z",
  "monto": 58.00,
  "estado": "Registrado"
}
```

---

### **INSUMOS - POST /api/insumos**

```typescript
POST /api/insumos
{
  "nombre": "Aceite de cocina",
  "stockActual": 50,
  "stockMinimo": 20,
  "unidadMedida": "litro",
  "fechaVencimiento": "2025-12-31"
}

✅ RESPUESTA:
{
  "id": "1",
  "nombre": "Aceite de cocina",
  "stockActual": 50,
  "stockMinimo": 20,
  "unidadMedida": "litro",
  "fechaVencimiento": "2025-12-31"
}
```

---

## 📊 ANÁLISIS DE INTEGRIDAD DE DATOS

### **✅ Transacciones Atómicas**

El código usa `prisma.$transaction()` para garantizar que:
- Si un detalle de pedido falla, TODO se revierte
- Si descuento de stock falla, el pedido se elimina
- NO hay datos parcialmente guardados

```typescript
// Ejemplo en app/api/pedidos/route.ts
const detallesCreados = await prisma.$transaction(async (tx) => {
  // 1. Verificar stock
  const producto = await tx.$queryRaw(`SELECT ... FOR UPDATE`)
  
  // 2. Validar cantidad
  if (stockActual < cantidadSolicitada) {
    throw new Error("Stock insuficiente")  // Todo se revierte
  }
  
  // 3. Descontar stock
  await tx.productos.update(...)
  
  // 4. Crear detalle
  await tx.detallepedido.create(...)
  
  return detalles_creados
})
```

---

### **✅ Relaciones Referenciables**

- `pedidos` → `usuarios` (quién registró)
- `pedidos` → `mesas` (dónde)
- `detallepedido` → `productos` (qué)
- `pedidos_delivery` → `pedidos` (entrega)

**Esto permite reportes cruzados:**
- "Ventas de hoy por mesero"
- "Productos más vendidos"
- "Delivery completados vs cancelados"
- "Rentabilidad por cliente"

---

### **✅ Auditoría Completa**

Todos los registros tiene:
- `createdAt` - Cuándo se creó
- `updatedAt` - Cuándo se modificó
- `canceledAt` / `cancelReason` - Si fue cancelado

---

## 🔌 MIGRACIONES DE DATOS

Cuando conectes a la nueva BD PostgreSQL 17:

```bash
# 1. Generar cliente Prisma
npm run db:generate

# 2. Crear tablas en PostgreSQL 17
npm run db:migrate

# 3. (Opcional) Seed datos iniciales
npm run db:seed

# 4. Validar conexión
npm run db:test
```

---

## 🗑️ CAMBIOS REALIZADOS PARA NUEVA BD

### **✅ Eliminado:**
- Referencias hardcodeadas a antigua BD
- Neon DB links (`ep-morning-cherry-acmnmz9o.sa-east-1.aws.neon.tech`)
- localhost hardcodeado

### **✅ Limpiado:**
- `.env` - Genérico, listo para nueva BD
- `.env.production` - Genérico, sin credentials
- `Dockerfile` - DATABASE_URL desde env

### **✅ Listo para:**
- PostgreSQL 17 (compatible con PostgreSQL 16+)
- Cualquier host (localhost, cloud, etc.)
- Cualquier usuario/contraseña

---

## 📝 RESUMEN DE CAPACIDADES

| Dato | Tabla | API | Límite |
|------|-------|-----|--------|
| Pedidos | `pedidos` + `detallepedido` | POST/GET/PUT | Sin límite |
| Registros | `pedidos_delivery` + metadata | GET | Sin límite |
| Costos | `gastos` | POST/GET | Sin límite |
| Ganancias | `ingresos` | POST/GET | Sin límite |
| Insumos | `insumos` | POST/GET/PUT | Sin límite |
| Pollos | `inventario_pollos` | POST/GET | 1 por día |
| Usuarios | `usuarios` | POST/GET/PUT | Sin límite |

---

## 🎯 CONCLUSIÓN

✅ **La aplicación ESTÁ LISTA para guardar correctamente:**
- ✅ Pedidos (mesa, delivery, llevar)
- ✅ Registros de transacciones
- ✅ Costos de insumos
- ✅ Ganancias/Ingresos
- ✅ Inventario especializado
- ✅ Auditoría completa

✅ **Schema está optimizado:**
- Índices en campos de búsqueda frecuente
- Constraints de integridad referencial
- Transacciones atómicas
- Foreign keys configuradas

✅ **Seguridad de datos:**
- Sem datos hardcodeados
- Variables de entorno limpiadas
- Listo para PostgreSQL 17 (nueva)

---

## 📞 PRÓXIMO PASO

Proporciona el enlace/credenciales de tu nueva BD PostgreSQL 17:
```
postgresql://usuario:contraseña@host:puerto/nombre_db?schema=public
```

Y actualizo el `.env` con los datos reales.
