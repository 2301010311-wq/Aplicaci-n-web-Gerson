import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function GET() {
  const auth = await requireAuth(["Admin", "Cocinero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    // Obtener fecha de hoy
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const mañana = new Date(hoy)
    mañana.setDate(mañana.getDate() + 1)

    // Obtener pedidos en cocina (En preparacion y En proceso) del día actual
    const pedidosRaw = await prisma.pedidos.findMany({
      where: {
        fecha_pedido: {
          gte: hoy,
          lt: mañana,
        },
        estado_pedido: {
          in: ["En preparacion", "En proceso", "Listo para recoger"]
        }
      },
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
      },
      orderBy: { fecha_pedido: "asc" }, // Más antiguos primero
    })

    // Mapear a la estructura esperada por el frontend
    const pedidos = pedidosRaw.map((pedido: any) => ({
      id: pedido.id_pedido.toString(),
      fecha: pedido.fecha_pedido,
      mesa: {
        id: pedido.mesas.id_mesa.toString(),
        numero: pedido.mesas.numero_mesa,
      },
      mesero: `${pedido.usuarios.nombre_user} ${pedido.usuarios.apellido_user}`,
      estado: pedido.estado_pedido,
      observaciones: pedido.observaciones || null,
      detalles: pedido.detallepedido.map((d: any) => ({
        id: d.id_detalle.toString(),
        producto: {
          id: d.id_produc?.toString() || "otro",
          nombre: d.nombre_produc_personalizado || (d.productos ? d.productos.nombre_produc : "Producto"),
        },
        cantidad: d.cantidad,
        precioUnitario: parseFloat(d.precio_unitario.toString()),
        subtotal: parseFloat(d.subtotal.toString()),
      })),
    }))

    return NextResponse.json(pedidos)
  } catch (error) {
    console.error("Error obteniendo pedidos de cocina:", error)
    return NextResponse.json({ error: "Error al obtener pedidos de cocina" }, { status: 500 })
  }
}