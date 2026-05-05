import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"
import { Decimal } from "@prisma/client/runtime/library"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["Admin", "Cajero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const pedidoId = parseInt(id)
    
    if (isNaN(pedidoId)) {
      return NextResponse.json({ error: "ID de pedido inválido" }, { status: 400 })
    }

    // ✅ Verificar pedido existe usando modelo correcto (pedidos, no pedido)
    const pedido = await prisma.pedidos.findUnique({
      where: { id_pedido: pedidoId },
      include: { mesas: true },
    })

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // Validar que el pedido no esté ya pagado
    if (pedido.estado_pedido === "Pagado") {
      return NextResponse.json({ error: "El pedido ya está pagado" }, { status: 400 })
    }

    // ✅ Transacción atómica para pago
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Actualizar estado pedido a "Pagado"
      const pedidoActualizado = await tx.pedidos.update({
        where: { id_pedido: pedidoId },
        data: { estado_pedido: "Pagado" },
      })

      // 2. Liberar mesa (si es mesa real, numero > 0)
      if (pedido.mesas.numero_mesa > 0) {
        await tx.mesas.update({
          where: { id_mesa: pedido.id_mesa },
          data: { estado_mesa: "Libre" },
        })
      }

      // 3. Calcular total del pedido
      const totalPedido = await tx.detallepedido.aggregate({
        where: { id_pedido: pedidoId },
        _sum: { subtotal: true },
      })

      const montoTotal = totalPedido._sum.subtotal || 0

      // 4. Registrar en ingresos (modelo financiero correcto)
      await tx.ingresos.create({
        data: {
          monto: new Decimal(montoTotal.toString()),
          descripcion: `Pago Pedido #${pedidoId} - Mesa ${pedido.mesas.numero_mesa}`,
          categoria: "Venta",
          metodo_pago: "Efectivo",
          estado: "Registrado",
        },
      })

      return pedidoActualizado
    })

    return NextResponse.json({ 
      success: true,
      pedido: resultado,
      mensaje: "Pago procesado y pedido cerrado",
    })
  } catch (error) {
    console.error("[PAGAR] Error:", error)
    return NextResponse.json(
      { 
        error: "Error al procesar pago",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
