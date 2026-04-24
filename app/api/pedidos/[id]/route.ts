import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(["Admin", "Mesero", "Cocinero", "Cajero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params

    const pedido: any = await prisma.pedidos.findUnique({
      where: { id_pedido: parseInt(id) },
      include: {
        mesas: true,
        usuarios: {
          select: {
            nombre_user: true,
            apellido_user: true,
          },
        },
        detallepedido: {
          include: {
            productos: true,
          },
        },
        pedido_delivery: true,
      },
    })

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // Determinar tipo de servicio basado en mesa
    let tipoServicio = "mesa"
    if (pedido.mesas.numero_mesa === -1) {
      tipoServicio = pedido.pedido_delivery ? "delivery" : "llevar"
    }

    // Mapear a la estructura esperada por el frontend
    const pedidoFormateado = {
      id: pedido.id_pedido.toString(),
      fecha: pedido.fecha_pedido,
      mesa: {
        id: pedido.mesas.id_mesa.toString(),
        numero: pedido.mesas.numero_mesa,
      },
      mesero: `${pedido.usuarios.nombre_user} ${pedido.usuarios.apellido_user}`,
      estado: pedido.estado_pedido,
      estado_pedido: pedido.estado_pedido,
      tipoServicio: tipoServicio,
      isDelivery: tipoServicio === "delivery",
      detallepedido: pedido.detallepedido.map((d: any) => ({
        id: d.id_detalle.toString(),
        id_produc: d.id_produc?.toString() || "otro",
        producto: {
          id: d.id_produc?.toString() || "otro",
          nombre: d.nombre_produc_personalizado || (d.productos ? d.productos.nombre_produc : "Producto"),
          precio: d.productos ? parseFloat(d.productos.precio_produc.toString()) : 0,
          categoria: d.productos ? d.productos.categoria_produc : "Otro",
          estado: d.productos ? d.productos.estado_produc : "Activo",
        },
        cantidad: d.cantidad,
        precio_unitario: parseFloat(d.precio_unitario.toString()),
        subtotal: parseFloat(d.subtotal.toString()),
      })),
      ...(pedido.pedido_delivery && {
        clienteInfo: {
          numero_telefono: pedido.pedido_delivery.numero_telefono,
          nombre_cliente: pedido.pedido_delivery.nombre_cliente,
          direccion: pedido.pedido_delivery.direccion,
          notas: pedido.pedido_delivery.notas,
        },
      }),
    }

    return NextResponse.json(pedidoFormateado)
  } catch (error) {
    console.error("Error obteniendo pedido:", error)
    return NextResponse.json({ error: "Error al obtener pedido" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["Admin", "Mesero", "Cocinero", "Cajero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const { estado } = await request.json()

    const pedido = await prisma.pedidos.update({
      where: { id_pedido: parseInt(id) },
      data: { estado_pedido: estado },
    })

    return NextResponse.json({
      id: pedido.id_pedido.toString(),
      fecha: pedido.fecha_pedido,
      estado: pedido.estado_pedido,
    })
  } catch (error) {
    console.error("Error actualizando pedido:", error)
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["Admin", "Mesero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const pedidoId = parseInt(id)

    // Obtener el pedido para verificar su estado y mesa
    const pedido = await prisma.pedidos.findUnique({
      where: { id_pedido: pedidoId },
      include: { mesas: true },
    })

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // Solo se pueden cancelar pedidos que aún están en preparación o pendientes
    if (!pedido.estado_pedido || !["En preparacion", "Pendiente"].includes(pedido.estado_pedido)) {
      return NextResponse.json(
        { error: `No se puede cancelar un pedido en estado ${pedido.estado_pedido}` },
        { status: 400 }
      )
    }

    // Eliminar detalles del pedido
    await prisma.detallepedido.deleteMany({
      where: { id_pedido: pedidoId },
    })

    // Eliminar delivery info si existe
    await (prisma as any).pedidos_delivery.deleteMany({
      where: { id_pedido: pedidoId },
    })

    // Cambiar estado a "Cancelado" en lugar de eliminar
    await prisma.pedidos.update({
      where: { id_pedido: pedidoId },
      data: { estado_pedido: "Cancelado" },
    })

    // Cambiar mesa a "Libre" si es mesa real
    if (pedido.mesas.numero_mesa > 0) {
      await prisma.mesas.update({
        where: { id_mesa: pedido.id_mesa },
        data: { estado_mesa: "Libre" },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Pedido cancelado exitosamente",
      id: pedidoId.toString(),
    })
  } catch (error) {
    console.error("Error cancelando pedido:", error)
    return NextResponse.json({ error: "Error al cancelar pedido" }, { status: 500 })
  }
}
