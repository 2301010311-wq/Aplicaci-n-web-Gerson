# 🔧 DOCUMENTACIÓN TÉCNICA: COMPONENTES

## Componente: `boleta-ticket.tsx`

### Ubicación
```
components/boleta-ticket.tsx
```

### Props Requeridas
```typescript
interface BrasetaTicketProps {
  nombreCliente: string          // Nombre del cliente
  dniCliente: string             // DNI (8 dígitos)
  total: number                  // Total del pedido
  pedidoId: string               // ID del pedido
  fecha: string                  // Fecha del pedido
  meseroNombre: string           // Nombre del mesero
  mesaNumero: number             // Número de mesa
  detalles: DetallePedido[]      // Array de productos
  numeroComprobante?: string     // Opcional: número de comprobante
}
```

### Estado Interno
```typescript
const printRef = useRef<HTMLDivElement>(null)
```

### Funciones

#### `handlePrint()`
- Abre nueva ventana de impresión
- Genera contenido HTML optimizado
- Envía a impresora
- Compatible con todas las impresoras

**Uso:**
```typescript
<Button onClick={handlePrint}>
  Imprimir Boleta
</Button>
```

### Flujo de Impresión

```
1. Usuario hace click en "Imprimir Boleta"
   ↓
2. handlePrint() se ejecuta
   ↓
3. window.open() abre nueva ventana
   ↓
4. Copia contenido HTML a nueva ventana
   ↓
5. Aplica estilos CSS para impresora
   ↓
6. Espera 500ms (carga)
   ↓
7. window.print() abre diálogo de impresión
   ↓
8. Usuario selecciona impresora
   ↓
9. Boleta se imprime
   ↓
10. Ventana se cierra automáticamente
```

### Estilos CSS

#### Para Ticket (80mm)
```css
body {
  width: 80mm;
  font-family: "Courier New", monospace;
  font-size: 12px;
}

.header {
  border-bottom: 2px dashed #000;
  text-align: center;
  font-weight: bold;
}

.products {
  display: grid;
  grid-template-columns: 3fr 1fr 2fr;
  gap: 5px;
}

.totals {
  border-top: 1px dashed #000;
  margin-top: 10px;
  font-weight: bold;
}
```

### Secciones de la Boleta

1. **HEADER**
   - Logo/Nombre empresa
   - RUC
   - Dirección
   - Teléfono

2. **TÍTULO**
   - "BOLETA DE VENTA ELECTRÓNICA"

3. **DATOS DEL COMPROBANTE**
   - Serie: BOL-2025
   - Número: (Auto-generado)
   - Fecha: (Sistema)
   - Hora: (Sistema)

4. **DATOS DEL CLIENTE**
   - Nombre: (Usuario ingresa)
   - DNI: (Usuario ingresa)

5. **INFORMACIÓN DEL PEDIDO**
   - Pedido #
   - Mesa
   - Atendido por

6. **DETALLE DE PRODUCTOS**
   - Descripción | Cantidad | Total
   - Fila por cada producto

7. **TOTALES**
   - Subtotal
   - IGV 18%
   - TOTAL (más grande)

8. **MÉTODO DE PAGO**
   - Tipo: EFECTIVO

9. **FOOTER**
   - Mensaje de agradecimiento
   - Web
   - Sistema GERSON POS

---

## Componente: `procesar-pago-modal.tsx`

### Ubicación
```
components/procesar-pago-modal.tsx
```

### Props
```typescript
interface ProcesarPagoModalProps {
  isOpen: boolean              // Modal abierto/cerrado
  onClose: () => void          // Callback al cerrar
  pedidoId: string | null      // ID del pedido a cobrar
  onPagoCompletado: () => void // Callback después de pagar
}
```

### Estados

```typescript
const [pedido, setPedido] = useState<Pedido | null>(null)
const [loading, setLoading] = useState(false)
const [procesandoPago, setProcesandoPago] = useState(false)
const [pagoCompletado, setPagoCompletado] = useState(false)

// Datos del cliente
const [nombreCliente, setNombreCliente] = useState("")
const [dniCliente, setDniCliente] = useState("")
```

### Flujo de Estados

```
INICIAL
├─ loading = true
├─ cargarPedido()
└─ fetch(/api/pedidos/[id])
   ↓
PEDIDO CARGADO
├─ loading = false
├─ pedido = data
├─ nombreCliente = ""
└─ dniCliente = ""
   ↓
USUARIO LLENA DATOS
├─ nombreCliente = "Juan"
└─ dniCliente = "12345678"
   ↓
PRESIONA "PROCESAR PAGO"
├─ procesandoPago = true
├─ fetch(POST /api/pagos/[id])
├─ pagoCompletado = true
└─ procesandoPago = false
   ↓
BOLETA MOSTRADA
├─ Render: <BoletaTicket ... />
├─ Usuario puede imprimir
└─ Usuario presiona Finalizar
   ↓
CIERRA MODAL
├─ onPagoCompletado()
├─ onClose()
└─ Vuelve a tabla de pagos
```

### Funciones

#### `cargarPedido()`
```typescript
const cargarPedido = async () => {
  setLoading(true)
  try {
    const res = await fetch(`/api/pedidos/${pedidoId}`)
    const data = await res.json()
    setPedido(data)
  } finally {
    setLoading(false)
  }
}
```

#### `calcularTotal()`
```typescript
const calcularTotal = () => {
  if (!pedido) return 0
  return pedido.detallepedido.reduce(
    (total, detalle) => total + detalle.subtotal,
    0
  )
}
```

#### `procesarPago()`
```typescript
const procesarPago = async () => {
  // Validar
  if (!pedido || !nombreCliente || !dniCliente) {
    alert("Datos incompletos")
    return
  }
  
  if (dniCliente.length !== 8) {
    alert("DNI debe tener 8 dígitos")
    return
  }
  
  // Procesar
  setProcesandoPago(true)
  try {
    const res = await fetch(`/api/pagos/${pedido.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombreCliente,
        dniCliente,
        total: calcularTotal()
      })
    })
    
    if (res.ok) {
      setPagoCompletado(true)
    }
  } finally {
    setProcesandoPago(false)
  }
}
```

#### `finalizarYCerrar()`
```typescript
const finalizarYCerrar = () => {
  onPagoCompletado()  // Recargar tabla
  onClose()           // Cerrar modal
}
```

### Validaciones

1. **DNI**
   ```typescript
   if (dniCliente.length !== 8) {
     alert("El DNI debe tener 8 dígitos")
     return
   }
   ```

2. **Campos requeridos**
   ```typescript
   if (!nombreCliente.trim() || !dniCliente.trim()) {
     alert("Complete todos los campos")
     return
   }
   ```

3. **Solo números en DNI**
   ```typescript
   const value = e.target.value.replace(/\D/g, '').slice(0, 8)
   setDniCliente(value)
   ```

### Validaciones en el Botón

```typescript
disabled={
  procesandoPago ||           // Si está procesando
  !nombreCliente.trim() ||    // Si nombre está vacío
  !dniCliente.trim()          // Si DNI está vacío
}
```

---

## Integración API

### Endpoint de Pago: `/api/pagos/[id]`

**Método**: POST

**Body**:
```json
{
  "nombreCliente": "Juan Pérez",
  "dniCliente": "12345678",
  "total": 24.50
}
```

**Respuesta exitosa**: 200 OK

**Qué hace en BD**:
1. Actualiza pedido a "Pagado"
2. Crea ingreso en tabla `ingresos`
3. Registra fecha/hora
4. Vincula con DNI

### Endpoint de Lectura: `/api/pedidos/[id]`

**Método**: GET

**Respuesta**:
```json
{
  "id": "abc123",
  "fecha": "2025-10-21T14:30:00Z",
  "mesa": {
    "id": "1",
    "numero": 5
  },
  "mesero": "Carlos",
  "estado": "Servido",
  "detallepedido": [
    {
      "id": "d1",
      "producto": {
        "id": "p1",
        "nombre": "Papa Mediana"
      },
      "cantidad": 1,
      "precio_unitario": 10.00,
      "subtotal": 10.00
    }
  ]
}
```

---

## Flujo de Datos Completo

```
┌─────────────────────────┐
│ PAGOS-TABLE.TSX         │
│ Selecciona pedido       │
│ Abre modal              │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ PROCESAR-PAGO-MODAL.TSX │
│ cargarPedido()          │
│ fetch /api/pedidos/[id] │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ SERVIDOR                │
│ GET /api/pedidos/[id]   │
│ Retorna datos pedido    │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ Modal muestra           │
│ - Resumen pedido        │
│ - Formulario cliente    │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ Usuario ingresa datos   │
│ - Nombre                │
│ - DNI                   │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ procesarPago()          │
│ fetch POST /api/pagos/[id]
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ SERVIDOR                │
│ POST /api/pagos/[id]    │
│ Actualiza BD            │
│ Crea ingreso finanzas   │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ Respuesta OK            │
│ pagoCompletado = true   │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ <BoletaTicket />        │
│ Muestra vista previa    │
│ Botón imprimir         │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ Usuario presiona        │
│ "Imprimir Boleta"       │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ handlePrint()           │
│ window.print()          │
│ Diálogo de impresión    │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ Usuario selecciona      │
│ impresora térmica       │
│ Boleta se imprime       │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ Usuario presiona        │
│ "Finalizar"             │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ finalizarYCerrar()      │
│ onPagoCompletado()      │
│ onClose()               │
│ Vuelve a tabla          │
└─────────────────────────┘
```

---

## Testing

### Test 1: Flujo completo
```javascript
1. Navegar a /pagos
2. Click "Cobrar" en primer pedido
3. Llenar: Nombre="Test", DNI="99999999"
4. Click "Procesar Pago"
5. Esperar a boleta
6. Click "Imprimir Boleta"
7. Esperar diálogo
8. Seleccionar impresora
9. Imprimir
10. Verificar boleta
11. Click "Finalizar"
12. Verificar que pedido desapareció
```

### Test 2: Validaciones
```javascript
1. Abrir modal
2. Dejar DNI vacío
3. Botón debe estar deshabilitado ✓
4. Llenar DNI con caracteres
5. Debe aceptar solo números ✓
6. DNI debe tener máx 8 caracteres ✓
```

### Test 3: Datos en boleta
```javascript
1. Procesar pago con:
   - Nombre: "Juan Pérez"
   - DNI: "12345678"
2. Verificar en boleta:
   - Nombre correcto ✓
   - DNI correcto ✓
   - Fecha/Hora actual ✓
   - Productos corretos ✓
   - IGV = Total * 0.18 ✓
```

---

## Troubleshooting Técnico

### Error: Cannot read property 'map' of undefined
**Causa**: `pedido.detallepedido` es null
**Solución**: Verificar que `/api/pedidos/[id]` retorna array

### Error: window.print() no funciona
**Causa**: Navegador bloquea ventanas emergentes
**Solución**: Permitir ventanas emergentes

### Boleta se ve cortada
**Causa**: Papel no configurado a 80mm
**Solución**: Ver `CONFIGURACION_IMPRESORA.md`

### DNI no valida correctamente
**Causa**: Lógica de validación incorrecta
**Solución**: Revisar `replace(/\D/g, '')`

---

**Última actualización**: 21 de Octubre, 2025
**Versión**: 1.0
**Estado**: ✅ Completo y funcional
