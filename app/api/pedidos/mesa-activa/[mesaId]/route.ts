import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mesaId: string }> }
) {
  const auth = await requireAuth(["Admin", "Mesero", "Cajero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { mesaId } = await params

    // Buscar pedidos activos (no finalizados) para esta mesa
    const pedidoActivo = await prisma.pedidos.findFirst({
      where: {
        id_mesa: parseInt(mesaId),
        estado_pedido: {
          notIn: ["Completado", "Cancelado"]
        }
      },
      include: {
        detallepedido: {
          include: {
            productos: true
          }
        }
      },
      orderBy: { fecha_pedido: "desc" }
    })

    if (!pedidoActivo) {
      return NextResponse.json(null)
    }

    // Calcular el total del pedido
    const total = pedidoActivo.detallepedido.reduce(
      (sum: number, detalle: any) => sum + Number(detalle.subtotal), 0
    )

    return NextResponse.json({
      id: pedidoActivo.id_pedido.toString(),
      id_mesa: pedidoActivo.id_mesa.toString(),
      id_user: pedidoActivo.id_user.toString(),
      estado: pedidoActivo.estado_pedido,
      fecha_creacion: pedidoActivo.fecha_pedido,
      total: total
    })
  } catch (error) {
    console.error("Error verificando mesa activa:", error)
    return NextResponse.json({ error: "Error al verificar mesa" }, { status: 500 })
  }
}