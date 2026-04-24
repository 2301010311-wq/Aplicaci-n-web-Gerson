import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(["Admin", "Cajero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const { nombreCliente, dniCliente, tipoComprobante, total } = await request.json()

    if (!nombreCliente || !dniCliente) {
      return NextResponse.json({ error: "Nombre y DNI del cliente son requeridos" }, { status: 400 })
    }

    if (dniCliente.length !== 8) {
      return NextResponse.json({ error: "El DNI debe tener 8 dígitos" }, { status: 400 })
    }

    if (!tipoComprobante || !["boleta", "nota_venta"].includes(tipoComprobante)) {
      return NextResponse.json({ error: "Tipo de comprobante inválido" }, { status: 400 })
    }

    // Verificar que el pedido existe y está en estado "Servido"
    const pedidoExistente = await prisma.pedidos.findUnique({
      where: { id_pedido: parseInt(id) },
      include: {
        detallepedido: true
      }
    })

    if (!pedidoExistente) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    if (pedidoExistente.estado_pedido !== "Servido") {
      return NextResponse.json({ error: "Solo se pueden procesar pagos de pedidos servidos" }, { status: 400 })
    }

    // Calcular el total real del pedido para verificar
    const totalReal = pedidoExistente.detallepedido.reduce(
      (sum: number, detalle: any) => sum + Number(detalle.subtotal), 
      0
    )

    if (Math.abs(Number(total) - totalReal) > 0.01) {
      return NextResponse.json({ error: "El total del pago no coincide con el pedido" }, { status: 400 })
    }

    // Actualizar el estado del pedido a "Pagado"
    const pedidoActualizado = await prisma.pedidos.update({
      where: { id_pedido: parseInt(id) },
      data: { 
        estado_pedido: "Pagado"
      }
    })

    // Registrar el ingreso en finanzas automáticamente
    await (prisma as any).ingresos.create({
      data: {
        fecha_ingreso: new Date(),
        monto: Number(total),
        descripcion: `Venta - Pedido #${pedidoActualizado.id_pedido} - ${tipoComprobante === 'boleta' ? 'Boleta' : 'Nota de Venta'} - Cliente: ${nombreCliente}`,
        categoria: "Ventas",
        cliente: nombreCliente,
        metodo_pago: "Efectivo",
        comprobante: tipoComprobante === 'boleta' ? `B-${dniCliente}` : `NV-${dniCliente}`,
        estado: "Registrado",
      }
    })

    return NextResponse.json({
      success: true,
      message: "Pago procesado exitosamente",
      pedido: {
        id: pedidoActualizado.id_pedido.toString(),
        estado: pedidoActualizado.estado_pedido,
        cliente: {
          nombre: nombreCliente,
          dni: dniCliente
        },
        total: totalReal
      }
    })

  } catch (error) {
    console.error("Error procesando pago:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}