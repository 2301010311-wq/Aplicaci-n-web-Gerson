import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    
    // Obtener el producto usando raw query para incluir el campo controlar_stock
    const productoRaw = await (prisma as any).$queryRaw`SELECT * FROM "productos" WHERE "id_produc" = ${parseInt(id)}`
    
    if (!productoRaw || productoRaw.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const producto = productoRaw[0]

    return NextResponse.json({
      id: producto.id_produc.toString(),
      nombre: producto.nombre_produc,
      descripcion: producto.descripcion_produc,
      precio: parseFloat(producto.precio_produc.toString()),
      categoria: producto.categoria_produc,
      estado: producto.estado_produc,
      stock: producto.stock_produc || 0,
      controlarStock: producto.controlar_stock ?? true,
      fechaVencimiento: new Date(producto.vencimiento_produc).toISOString().split('T')[0],
    })
  } catch (error) {
    console.error("Error obteniendo producto:", error)
    return NextResponse.json({ 
      error: "Error al obtener producto",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const { nombre, descripcion, precio, categoria, estado, stock, controlarStock, fechaVencimiento } = await request.json()

    if (!nombre || !precio || !categoria) {
      return NextResponse.json({ 
        error: "Campos requeridos: nombre, precio, categoria" 
      }, { status: 400 })
    }

    // Si no se proporciona fecha de vencimiento, usar una fecha muy lejana (100 años)
    const fechaVencimientoFinal = fechaVencimiento 
      ? new Date(fechaVencimiento) 
      : new Date(new Date().getFullYear() + 100, 0, 1)

    const producto = await prisma.productos.update({
      where: { id_produc: parseInt(id) },
      data: {
        nombre_produc: nombre,
        descripcion_produc: descripcion || "",
        precio_produc: precio,
        categoria_produc: categoria,
        estado_produc: estado || "Activo",
        vencimiento_produc: fechaVencimientoFinal,
      },
    })

    // Actualizar el stock y controlar_stock si se proporcionó
    if (stock !== undefined) {
      await (prisma as any).$executeRaw`UPDATE "productos" SET "stock_produc" = ${stock} WHERE "id_produc" = ${parseInt(id)}`
    }
    
    if (controlarStock !== undefined) {
      await (prisma as any).$executeRaw`UPDATE "productos" SET "controlar_stock" = ${controlarStock} WHERE "id_produc" = ${parseInt(id)}`
    }

    // Recuperar el producto actualizado para devolver el stock
    const productoFinal = await (prisma as any).$queryRaw`SELECT * FROM "productos" WHERE "id_produc" = ${parseInt(id)}`
    const stockFinal = productoFinal && productoFinal.length > 0 ? productoFinal[0].stock_produc : 0
    const controlarStockFinal = productoFinal && productoFinal.length > 0 ? productoFinal[0].controlar_stock : true

    return NextResponse.json({
      id: producto.id_produc.toString(),
      nombre: producto.nombre_produc,
      descripcion: producto.descripcion_produc,
      precio: parseFloat(producto.precio_produc.toString()),
      categoria: producto.categoria_produc,
      estado: producto.estado_produc,
      stock: stockFinal,
      controlarStock: controlarStockFinal,
      fechaVencimiento: producto.vencimiento_produc?.toISOString().split('T')[0],
    })
  } catch (error) {
    console.error("Error actualizando producto:", error)
    return NextResponse.json({ 
      error: "Error al actualizar producto",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params

    await prisma.productos.delete({
      where: { id_produc: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando producto:", error)
    return NextResponse.json({ 
      error: "Error al eliminar producto",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}
