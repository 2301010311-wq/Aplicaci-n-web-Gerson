import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function GET() {
  const auth = await requireAuth(["Admin", "Mesero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const productosRaw = await prisma.productos.findMany({
      orderBy: { nombre_produc: "asc" },
    })

    // Obtener stocks usando raw query porque el cliente de Prisma aún no está actualizado
    const productosConStock = await (prisma as any).$queryRaw`SELECT * FROM "productos" ORDER BY "nombre_produc" ASC`

    // Mapear a la estructura esperada por el frontend
    const productos = productosConStock.map((producto: any) => ({
      id: producto.id_produc.toString(),
      nombre: producto.nombre_produc,
      descripcion: producto.descripcion_produc,
      precio: parseFloat(producto.precio_produc.toString()),
      categoria: producto.categoria_produc,
      estado: producto.estado_produc,
      stock: producto.stock_produc || 0,
      controlarStock: producto.controlar_stock ?? true,
      fechaVencimiento: new Date(producto.vencimiento_produc).toISOString().split('T')[0], // Solo fecha
    }))

    return NextResponse.json(productos)
  } catch (error) {
    console.error("Error obteniendo productos:", error)
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
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

    const producto = await prisma.productos.create({
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
    if (stock && stock > 0) {
      await (prisma as any).$executeRaw`UPDATE "productos" SET "stock_produc" = ${stock} WHERE "id_produc" = ${producto.id_produc}`
    }
    
    if (controlarStock !== undefined && controlarStock !== true) {
      await (prisma as any).$executeRaw`UPDATE "productos" SET "controlar_stock" = ${controlarStock} WHERE "id_produc" = ${producto.id_produc}`
    }

    // Recuperar el producto actualizado para devolver el stock
    const productoFinal = await (prisma as any).$queryRaw`SELECT * FROM "productos" WHERE "id_produc" = ${producto.id_produc}`
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
      fechaVencimiento: producto.vencimiento_produc.toISOString().split('T')[0],
    })
  } catch (error) {
    console.error("Error creando producto:", error)
    return NextResponse.json({ 
      error: "Error al crear producto",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}
