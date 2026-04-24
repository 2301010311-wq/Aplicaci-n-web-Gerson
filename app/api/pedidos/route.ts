import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function GET(request: NextRequest) {
  const auth = await requireAuth(["Admin", "Mesero", "Cajero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const mesaId = searchParams.get("mesaId")
    const estado = searchParams.get("estado")

    // Obtener fecha de hoy (inicio y fin del día)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const mañana = new Date(hoy)
    mañana.setDate(mañana.getDate() + 1)

    // Obtener TODOS los pedidos del día para numeración
    const whereParaNumeracion: any = {
      fecha_pedido: {
        gte: hoy,
        lt: mañana,
      },
    }

    // Construir filtros dinámicamente para el resultado
    const whereParaFiltro: any = {
      fecha_pedido: {
        gte: hoy,
        lt: mañana,
      },
    }
    if (mesaId) {
      whereParaFiltro.id_mesa = parseInt(mesaId)
    }
    if (estado) {
      whereParaFiltro.estado_pedido = estado
    }

    // Obtener todos los pedidos del día (para saber la numeración correcta)
    const todosPedidosDelDia = await prisma.pedidos.findMany({
      where: whereParaNumeracion,
      select: { id_pedido: true, fecha_pedido: true },
      orderBy: { fecha_pedido: "desc" },
    })

    // Obtener pedidos con filtros aplicados
    const pedidosRaw = await prisma.pedidos.findMany({
      where: whereParaFiltro,
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
      orderBy: { fecha_pedido: "desc" }, // Orden descendente para que los más recientes aparezcan primero
    })

    // Crear un mapa de id_pedido -> número del día basado en TODOS los pedidos del día
    const numeroacionMap = new Map<number, number>()
    todosPedidosDelDia.forEach((pedido, index) => {
      numeroacionMap.set(pedido.id_pedido, todosPedidosDelDia.length - index)
    })

    // Mapear a la estructura esperada por el frontend con numeración por día
    const totalPedidosDelDia = todosPedidosDelDia.length
    const pedidos = pedidosRaw.map((pedido: any) => {
      const numeroDelDia = numeroacionMap.get(pedido.id_pedido) || 0 // Obtener el número asignado
      return {
        id: numeroDelDia.toString(),
        idPedidoDb: pedido.id_pedido.toString(), // Guardar el ID real de la BD por si lo necesitamos
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
      }
    })

    // Contar pedidos del día

    return NextResponse.json({
      pedidos,
      totalPedidosDelDia,
      fecha: hoy.toISOString().split('T')[0],
    })
  } catch (error) {
    console.error("Error obteniendo pedidos:", error)
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["Admin", "Mesero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { mesaId, tipoServicio, detalles, clienteInfo, observaciones } = await request.json()

    if (!detalles || detalles.length === 0) {
      return NextResponse.json({ error: "Detalles del pedido son requeridos" }, { status: 400 })
    }

    // Si es tipo "mesa", validar que tenga mesaId
    if (tipoServicio === "mesa" && !mesaId) {
      return NextResponse.json({ error: "Mesa es requerida para pedidos en el restaurante" }, { status: 400 })
    }

    // Validar datos del cliente para delivery y para llevar
    if (tipoServicio !== "mesa" && clienteInfo) {
      if (!clienteInfo.numeroTelefono || !clienteInfo.nombreCliente) {
        return NextResponse.json({ error: "Número de teléfono y nombre del cliente son requeridos" }, { status: 400 })
      }
      if (tipoServicio === "delivery" && !clienteInfo.direccion) {
        return NextResponse.json({ error: "Dirección es requerida para delivery" }, { status: 400 })
      }
    }

    let finalMesaId: number | undefined

    if (mesaId) {
      finalMesaId = parseInt(mesaId)
    } else {
      // Para pedidos sin mesa (llevar/delivery), crear o usar mesa especial
      try {
        // Determinar número de mesa según tipo de servicio
        const numeroMesaEspecial = tipoServicio === "delivery" ? -1 : -2 // -1 para Delivery, -2 para Para Llevar
        
        // Buscar o crear mesa especial
        let mesaEspecial: any = await prisma.mesas.findFirst({
          where: { numero_mesa: numeroMesaEspecial },
        })

        if (!mesaEspecial) {
          mesaEspecial = await prisma.mesas.create({
            data: {
              numero_mesa: numeroMesaEspecial,
              capacidad_mesa: 1,
              estado_mesa: "Libre",
            },
          })
        }

        finalMesaId = mesaEspecial.id_mesa
      } catch (error) {
        console.error("Error creando mesa especial:", error)
        return NextResponse.json({ error: "Error al procesar pedido sin mesa" }, { status: 500 })
      }
    }

    const pedido: any = await prisma.pedidos.create({
      data: {
        id_mesa: finalMesaId!,
        id_user: parseInt(auth.session.id),
        estado_pedido: "En preparacion",
        observaciones: observaciones || null,
      },
    })

    // Crear detalles del pedido
    for (const d of detalles) {
      try {
        // Si es un producto "otro", guardar con nombre personalizado (no tiene stock)
        if (typeof d.productoId === "string" && d.productoId.startsWith("otro_")) {
          await prisma.detallepedido.create({
            data: {
              id_pedido: pedido.id_pedido,
              nombre_produc_personalizado: d.nombre,
              cantidad: d.cantidad,
              precio_unitario: d.precioUnitario,
              subtotal: d.cantidad * d.precioUnitario,
            },
          })
          continue
        }
        
        // Para productos normales, guardar con id_produc y deducir stock si es necesario
        const productoId = parseInt(d.productoId)
        
        // Obtener el producto para verificar si controla stock
        const producto = await (prisma as any).$queryRaw`SELECT "controlar_stock" FROM "productos" WHERE "id_produc" = ${productoId}`
        const debeControlarStock = producto && producto.length > 0 && producto[0].controlar_stock === true
        
        // Deducir stock del producto solo si controla_stock es true
        if (debeControlarStock) {
          await (prisma as any).$executeRaw`
            UPDATE "productos" 
            SET "stock_produc" = "stock_produc" - ${d.cantidad} 
            WHERE "id_produc" = ${productoId} AND "stock_produc" >= ${d.cantidad}
          `
        }
        
        await prisma.detallepedido.create({
          data: {
            id_pedido: pedido.id_pedido,
            id_produc: productoId,
            cantidad: d.cantidad,
            precio_unitario: d.precioUnitario,
            subtotal: d.cantidad * d.precioUnitario,
          },
        })
      } catch (error) {
        console.error(`Error creando detalle para producto ${d.productoId}:`, error)
        throw error
      }
    }

    // Crear registro de delivery/para llevar si es necesario
    if (tipoServicio !== "mesa" && clienteInfo) {
      await (prisma as any).pedidos_delivery.create({
        data: {
          id_pedido: pedido.id_pedido,
          numero_telefono: clienteInfo.numeroTelefono,
          nombre_cliente: clienteInfo.nombreCliente,
          direccion: clienteInfo.direccion || null,
          notas: clienteInfo.notas || null,
        },
      })
    }

    // Obtener los detalles creados para calcular el total real
    const detallesCreados = await prisma.detallepedido.findMany({
      where: { id_pedido: pedido.id_pedido }
    })

    const totalReal = detallesCreados.reduce((sum, d) => sum + parseFloat(d.subtotal.toString()), 0)

    // Calcular el total del pedido
    const total = detalles.reduce((sum: number, d: any) => sum + (d.cantidad * d.precioUnitario), 0)

    // Validar que coincidan (si no, hay un error en los detalles)
    if (Math.abs(total - totalReal) > 0.01) {
      console.warn(`[PEDIDO ${pedido.id_pedido}] Total esperado: ${total}, Total guardado: ${totalReal}`)
    }

    // Actualizar estado de la mesa solo si es mesa real
    if (mesaId) {
      await prisma.mesas.update({
        where: { id_mesa: parseInt(mesaId) },
        data: { estado_mesa: "Ocupada" },
      })
    }

    // Retornar pedido con estructura del frontend (usar el total real guardado en BD)
    return NextResponse.json({
      id: pedido.id_pedido.toString(),
      fecha: pedido.fecha_pedido,
      mesaId: pedido.id_mesa.toString(),
      tipoServicio: tipoServicio,
      estado: pedido.estado_pedido,
      total: totalReal,
    })
  } catch (error) {
    console.error("Error creando pedido:", error)
    return NextResponse.json({ 
      error: "Error al crear pedido",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(["Admin", "Mesero", "Cocinero", "Cajero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { pedidoId, detalles, observaciones } = await request.json()

    if (!pedidoId || !detalles || detalles.length === 0) {
      return NextResponse.json({ error: "Pedido ID y detalles son requeridos" }, { status: 400 })
    }

    // Validar que el pedido existe
    const pedidoExistente = await prisma.pedidos.findUnique({
      where: { id_pedido: parseInt(pedidoId) },
    })

    if (!pedidoExistente) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // Usar transacción para asegurar que todo se guarde o nada se guarde
    const detallesPedido = await prisma.$transaction(async (tx) => {
      // Eliminar detalles existentes
      await tx.detallepedido.deleteMany({
        where: { id_pedido: parseInt(pedidoId) },
      })

      // Crear nuevos detalles
      const detalles_nuevos = []
      for (const detalle of detalles) {
        try {
          // Si es un producto "otro", guardar con nombre personalizado
          if (typeof detalle.productoId === "string" && detalle.productoId.startsWith("otro_")) {
            const subtotal = detalle.cantidad * detalle.precioUnitario
            
            const nuevoDetalle = await tx.detallepedido.create({
              data: {
                id_pedido: parseInt(pedidoId),
                nombre_produc_personalizado: detalle.nombre,
                cantidad: detalle.cantidad,
                precio_unitario: detalle.precioUnitario,
                subtotal: subtotal,
              },
            })
            detalles_nuevos.push(nuevoDetalle)
            continue
          }

          const producto = await tx.productos.findUnique({
            where: { id_produc: parseInt(detalle.productoId) },
          })

          if (!producto) {
            throw new Error(`Producto ${detalle.productoId} no encontrado`)
          }

          const subtotal = detalle.cantidad * detalle.precioUnitario
          
          const nuevoDetalle = await tx.detallepedido.create({
            data: {
              id_pedido: parseInt(pedidoId),
              id_produc: parseInt(detalle.productoId),
              cantidad: detalle.cantidad,
              precio_unitario: detalle.precioUnitario,
              subtotal: subtotal,
            },
          })
          detalles_nuevos.push(nuevoDetalle)
        } catch (error) {
          console.error(`Error creando detalle para producto ${detalle.productoId}:`, error)
          throw error
        }
      }

      return detalles_nuevos
    })

    // Calcular nuevo total (para retornarlo en la respuesta)
    const total = detallesPedido.reduce((sum, detalle) => sum + Number(detalle.subtotal), 0)

    // Actualizar observaciones si se proporcionan
    const pedidoActualizado = await prisma.pedidos.update({
      where: { id_pedido: parseInt(pedidoId) },
      data: {
        observaciones: observaciones || null
      }
    })

    return NextResponse.json({
      id: pedidoActualizado.id_pedido.toString(),
      fecha: pedidoActualizado.fecha_pedido,
      mesaId: pedidoActualizado.id_mesa.toString(),
      estado: pedidoActualizado.estado_pedido,
      total: total,
    })
  } catch (error) {
    console.error("Error actualizando pedido:", error)
    return NextResponse.json({ 
      error: "Error al actualizar pedido",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}


