import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(["Admin", "Mesero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const { pedidoId } = await request.json()

    // Verificar que la mesa existe
    const mesa = await prisma.mesas.findUnique({
      where: { id_mesa: parseInt(id) }
    })

    if (!mesa) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 })
    }

    // Verificar que el pedido existe y está pagado
    if (pedidoId) {
      const pedido = await prisma.pedidos.findUnique({
        where: { id_pedido: parseInt(pedidoId) }
      })

      if (!pedido) {
        return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
      }

      if (pedido.estado_pedido !== "Pagado") {
        return NextResponse.json({ error: "Solo se pueden liberar mesas de pedidos pagados" }, { status: 400 })
      }

      // Marcar el pedido como completado (opcional: puedes crear un nuevo estado "Completado")
      await prisma.pedidos.update({
        where: { id_pedido: parseInt(pedidoId) },
        data: { estado_pedido: "Completado" }
      })
    }

    // Cambiar el estado de la mesa a libre
    const mesaActualizada = await prisma.mesas.update({
      where: { id_mesa: parseInt(id) },
      data: { estado_mesa: "Libre" }
    })

    return NextResponse.json({
      success: true,
      message: "Mesa liberada exitosamente",
      mesa: {
        id: mesaActualizada.id_mesa.toString(),
        numero: mesaActualizada.numero_mesa,
        estado: mesaActualizada.estado_mesa
      }
    })

  } catch (error) {
    console.error("Error liberando mesa:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}