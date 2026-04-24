"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface DetallePedido {
  id: string
  producto: {
    id: string
    nombre: string
  }
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface BrasetaTicketProps {
  nombreCliente: string
  dniCliente: string
  total: number
  pedidoId: string
  fecha: string
  meseroNombre: string
  mesaNumero: number
  detalles: DetallePedido[]
  numeroComprobante?: string
  tipoComprobante?: "boleta" | "nota_venta"
}

export function BoletaTicket({
  nombreCliente,
  dniCliente,
  total,
  pedidoId,
  fecha,
  meseroNombre,
  mesaNumero,
  detalles,
  numeroComprobante,
  tipoComprobante = "boleta"
}: BrasetaTicketProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (!printRef.current) return

    const printWindow = window.open("", "", "width=800,height=600")
    if (!printWindow) {
      alert("No se pudo abrir la ventana de impresión")
      return
    }

    const printContent = printRef.current.innerHTML

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Boleta de Venta</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: "Courier New", monospace;
            width: 80mm;
            padding: 5mm;
            background: white;
          }
          
          .ticket {
            width: 100%;
            text-align: center;
            font-size: 12px;
            line-height: 1.4;
          }
          
          .header {
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
            font-weight: bold;
          }
          
          .header .logo {
            font-size: 16px;
            margin-bottom: 5px;
          }
          
          .header .subtitle {
            font-size: 10px;
            margin: 5px 0;
          }
          
          .section {
            margin: 10px 0;
            text-align: left;
          }
          
          .section-title {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 11px;
          }
          
          .field {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin: 3px 0;
          }
          
          .field-label {
            font-weight: bold;
          }
          
          .products {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 8px 0;
            margin: 10px 0;
          }
          
          .product-header {
            display: grid;
            grid-template-columns: 3fr 1fr 2fr;
            gap: 5px;
            font-weight: bold;
            font-size: 10px;
            margin-bottom: 5px;
            border-bottom: 1px solid #000;
          }
          
          .product-item {
            display: grid;
            grid-template-columns: 3fr 1fr 2fr;
            gap: 5px;
            font-size: 10px;
            margin: 3px 0;
            align-items: center;
          }
          
          .product-name {
            text-align: left;
            word-break: break-word;
          }
          
          .product-qty {
            text-align: center;
          }
          
          .product-price {
            text-align: right;
          }
          
          .totals {
            margin: 10px 0;
            border-top: 1px dashed #000;
            padding-top: 8px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin: 5px 0;
          }
          
          .total-row.final {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 8px;
          }
          
          .footer {
            border-top: 2px dashed #000;
            margin-top: 10px;
            padding-top: 8px;
            font-size: 10px;
            text-align: center;
          }
          
          .qr {
            margin: 10px 0;
            text-align: center;
          }
          
          .separator {
            text-align: center;
            margin: 8px 0;
            font-size: 10px;
          }
          
          @media print {
            body {
              width: 80mm;
            }
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `)

    printWindow.document.close()
    
    // Esperar a que se cargue el contenido antes de imprimir
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  const fechaFormato = new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  const horaFormato = new Date(fecha).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="space-y-4">
      {/* Vista previa del ticket */}
      <div className="bg-white p-6 rounded-lg border-2 border-[#C9A227] overflow-auto max-h-96">
        <div
          ref={printRef}
          className="ticket"
          style={{ width: '80mm', margin: '0 auto', fontFamily: '"Courier New", monospace' }}
        >
          {/* ENCABEZADO */}
          <div style={{ borderBottom: '2px dashed #000', paddingBottom: '10px', marginBottom: '10px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
              POLLERÍA GERSON
            </div>
            <div style={{ fontSize: '10px', marginBottom: '3px' }}>
              RUC: 10123456789
            </div>
            <div style={{ fontSize: '10px', marginBottom: '3px' }}>
              Jirón Libertad 123 - Pueblo Nuevo
            </div>
            <div style={{ fontSize: '10px' }}>
              Telf: 999-999-999
            </div>
          </div>

          {/* BOLETA DE VENTA */}
          <div style={{ marginBottom: '10px', fontSize: '12px', fontWeight: 'bold' }}>
            {tipoComprobante === 'boleta' ? 'BOLETA DE VENTA ELECTRÓNICA' : 'NOTA DE VENTA'}
          </div>

          {/* DATOS DEL COMPROBANTE */}
          <div style={{ fontSize: '11px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontWeight: 'bold' }}>Serie:</span>
              <span>{tipoComprobante === 'boleta' ? 'BOL-2025' : 'NV-2025'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontWeight: 'bold' }}>Nro.:</span>
              <span>{numeroComprobante || pedidoId.slice(0, 10)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontWeight: 'bold' }}>Fecha:</span>
              <span>{fechaFormato}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Hora:</span>
              <span>{horaFormato}</span>
            </div>
          </div>

          {/* DATOS DEL CLIENTE */}
          <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', marginBottom: '10px', fontSize: '11px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>CLIENTE GENÉRICO</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontWeight: 'bold' }}>Nombre:</span>
              <span>{nombreCliente}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>DNI:</span>
              <span>{dniCliente}</span>
            </div>
          </div>

          {/* INFORMACIÓN DEL PEDIDO */}
          <div style={{ fontSize: '11px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontWeight: 'bold' }}>Pedido:</span>
              <span>#{pedidoId.slice(0, 8)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontWeight: 'bold' }}>Mesa:</span>
              <span>{mesaNumero}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Atendido por:</span>
              <span>{meseroNombre}</span>
            </div>
          </div>

          {/* DETALLES DE PRODUCTOS */}
          <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', marginBottom: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 2fr', gap: '5px', fontWeight: 'bold', fontSize: '10px', marginBottom: '5px', borderBottom: '1px solid #000', paddingBottom: '5px' }}>
              <div>DESCRIPCIÓN</div>
              <div style={{ textAlign: 'center' }}>QTY</div>
              <div style={{ textAlign: 'right' }}>TOTAL</div>
            </div>

            {detalles.map((detalle) => (
              <div key={detalle.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 2fr', gap: '5px', fontSize: '10px', marginBottom: '3px' }}>
                <div style={{ wordBreak: 'break-word' }}>{detalle.producto.nombre}</div>
                <div style={{ textAlign: 'center' }}>{detalle.cantidad}</div>
                <div style={{ textAlign: 'right' }}>S/ {detalle.subtotal.toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* TOTALES */}
          <div style={{ marginBottom: '10px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontWeight: 'bold' }}>SUB TOTAL:</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontWeight: 'bold' }}>IGV (18%):</span>
              <span>S/ {(total * 0.18).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '5px', marginTop: '5px' }}>
              <span>TOTAL:</span>
              <span>S/ {(total * 1.18).toFixed(2)}</span>
            </div>
          </div>

          {/* MÉTODO DE PAGO */}
          <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', marginBottom: '10px', fontSize: '11px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>MÉTODO DE PAGO</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Tipo:</span>
              <span>EFECTIVO</span>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ borderTop: '2px dashed #000', paddingTop: '8px', textAlign: 'center', fontSize: '10px' }}>
            <div style={{ marginBottom: '5px' }}>Gracias por su compra</div>
            <div style={{ marginBottom: '5px' }}>Visitenos nuevamente</div>
            <div style={{ marginBottom: '5px' }}>Sistema GERSON POS</div>
            <div style={{ marginBottom: '10px', fontSize: '9px' }}>www.gerson.com.pe</div>
          </div>
        </div>
      </div>

      {/* Botón de impresión */}
      <div className="flex justify-end">
        <Button
          onClick={handlePrint}
          className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-semibold flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Imprimir {tipoComprobante === 'boleta' ? 'Boleta' : 'Nota de Venta'}
        </Button>
      </div>
    </div>
  )
}
