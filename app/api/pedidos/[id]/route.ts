// Endpoint para gestionar pedidos (obtener, actualizar y cancelar)
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

// Obtiene un pedido específico por su ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verifica que el usuario tenga permisos para acceder al pedido
  const auth = await requireAuth(["Admin", "Mesero", "Cocinero", "Cajero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    // Extrae el ID del pedido desde la URL
    const { id } = await params

    // Consulta el pedido en la base de datos junto con sus relaciones
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

    // Retorna error si el pedido no existe
    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // Determina si el pedido es en mesa, delivery o para llevar
    let tipoServicio = "mesa"
    if (pedido.mesas.numero_mesa === -1) {
      tipoServicio = pedido.pedido_delivery ? "delivery" : "llevar"
    }

    // Formatea los datos del pedido para enviarlos al frontend
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

    // Retorna el pedido formateado en formato JSON
    return NextResponse.json(pedidoFormateado)
  } catch (error) {
    // Manejo de errores al obtener el pedido
    console.error("Error obteniendo pedido:", error)
    return NextResponse.json({ error: "Error al obtener pedido" }, { status: 500 })
  }
}

// Actualiza el estado de un pedido
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica permisos del usuario
  const auth = await requireAuth(["Admin", "Mesero", "Cocinero", "Cajero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    // Extrae el ID del pedido
    const { id } = await params

    // Obtiene los datos enviados en la petición (nuevo estado)
    const { estado } = await request.json()

    // Actualiza el estado del pedido en la base de datos
    const pedido = await prisma.pedidos.update({
      where: { id_pedido: parseInt(id) },
      data: { estado_pedido: estado },
    })

    // Retorna el pedido actualizado
    return NextResponse.json({
      id: pedido.id_pedido.toString(),
      fecha: pedido.fecha_pedido,
      estado: pedido.estado_pedido,
    })
  } catch (error) {
    // Manejo de errores al actualizar el pedido
    console.error("Error actualizando pedido:", error)
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 })
  }
}

// Cancela un pedido (cambia estado y libera recursos asociados)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica permisos del usuario
  const auth = await requireAuth(["Admin", "Mesero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const pedidoId = parseInt(id)

    // Busca el pedido para validar su estado antes de cancelarlo
    const pedido = await prisma.pedidos.findUnique({
      where: { id_pedido: pedidoId },
      include: { mesas: true },
    })

    // Verifica que el pedido exista
    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // Solo permite cancelar pedidos en estado válido
    if (!pedido.estado_pedido || !["En preparacion", "Pendiente"].includes(pedido.estado_pedido)) {
      return NextResponse.json(
        { error: `No se puede cancelar un pedido en estado ${pedido.estado_pedido}` },
        { status: 400 }
      )
    }

    // Elimina los detalles asociados al pedido
    await prisma.detallepedido.deleteMany({
      where: { id_pedido: pedidoId },
    })

    // Elimina la información de delivery si existe
    await (prisma as any).pedidos_delivery.deleteMany({
      where: { id_pedido: pedidoId },
    })

    // Cambia el estado del pedido a "Cancelado"
    await prisma.pedidos.update({
      where: { id_pedido: pedidoId },
      data: { estado_pedido: "Cancelado" },
    })

    // Libera la mesa si el pedido estaba asociado a una mesa física
    if (pedido.mesas.numero_mesa > 0) {
      await prisma.mesas.update({
        where: { id_mesa: pedido.id_mesa },
        data: { estado_mesa: "Libre" },
      })
    }

    // Retorna confirmación de cancelación
    return NextResponse.json({
      success: true,
      message: "Pedido cancelado exitosamente",
      id: pedidoId.toString(),
    })
  } catch (error) {
    // Manejo de errores al cancelar el pedido
    console.error("Error cancelando pedido:", error)
    return NextResponse.json({ error: "Error al cancelar pedido" }, { status: 500 })
  }
}
