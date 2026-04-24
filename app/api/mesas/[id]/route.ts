import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["Admin", "Mesero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const { estado, numero, capacidad } = await request.json()

    const updateData: any = {}
    if (estado) updateData.estado_mesa = estado
    if (numero) updateData.numero_mesa = numero
    if (capacidad) updateData.capacidad_mesa = capacidad

    const mesa = await prisma.mesas.update({
      where: { id_mesa: parseInt(id) },
      data: updateData,
    })

    return NextResponse.json({
      id: mesa.id_mesa.toString(),
      numero: mesa.numero_mesa,
      capacidad: mesa.capacidad_mesa,
      estado: mesa.estado_mesa,
    })
  } catch (error) {
    console.error("Error actualizando mesa:", error)
    return NextResponse.json({ error: "Error al actualizar mesa" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const mesaId = parseInt(id)

    // Verificar si la mesa tiene pedidos activos
    const pedidosActivos = await prisma.pedidos.count({
      where: {
        id_mesa: mesaId,
        estado_pedido: {
          notIn: ["Completado", "Pagado", "Cancelado"]
        }
      }
    })

    if (pedidosActivos > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar una mesa que tiene pedidos activos. Completar o cancelar los pedidos primero." 
      }, { status: 400 })
    }

    // Verificar si hay ALGUNos pedidos asociados (incluso completados)
    const totalPedidos = await prisma.pedidos.count({
      where: { id_mesa: mesaId }
    })

    if (totalPedidos > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar una mesa que tiene historial de pedidos. Revisa los registros para más información." 
      }, { status: 400 })
    }

    // Si no tiene pedidos, eliminar normalmente
    await prisma.mesas.delete({
      where: { id_mesa: mesaId },
    })

    return NextResponse.json({ success: true, message: "Mesa eliminada correctamente" })
  } catch (error) {
    console.error("Error eliminando mesa:", error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ 
      error: `Error al eliminar mesa: ${errorMessage}` 
    }, { status: 500 })
  }
}
