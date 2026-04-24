import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function GET() {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const insumosRaw = await prisma.insumos.findMany({
      orderBy: { nombre_insu: "asc" },
    })

    // Mapear a la estructura esperada por el frontend
    const insumos = insumosRaw.map((insumo: any) => ({
      id: insumo.id_insumo.toString(),
      nombre: insumo.nombre_insu,
      stockActual: parseFloat(insumo.stock_act_insu?.toString() || "0"),
      stockMinimo: parseFloat(insumo.stock_min_insu?.toString() || "0"),
      unidadMedida: insumo.unidadmedida_insu,
      fechaVencimiento: insumo.vencimiento_insu.toISOString().split('T')[0],
    }))

    return NextResponse.json(insumos)
  } catch (error) {
    console.error("Error obteniendo insumos:", error)
    return NextResponse.json({ error: "Error al obtener insumos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { nombre, stockActual, stockMinimo, unidadMedida, fechaVencimiento } = await request.json()

    if (!nombre || stockActual === undefined || stockMinimo === undefined || !unidadMedida) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const insumo = await prisma.insumos.create({
      data: {
        nombre_insu: nombre,
        stock_act_insu: stockActual,
        stock_min_insu: stockMinimo,
        unidadmedida_insu: unidadMedida,
        vencimiento_insu: new Date(fechaVencimiento),
      },
    })

    return NextResponse.json({
      id: insumo.id_insumo.toString(),
      nombre: insumo.nombre_insu,
      stockActual: parseFloat(insumo.stock_act_insu?.toString() || "0"),
      stockMinimo: parseFloat(insumo.stock_min_insu?.toString() || "0"),
      unidadMedida: insumo.unidadmedida_insu,
      fechaVencimiento: insumo.vencimiento_insu.toISOString().split('T')[0],
    })
  } catch (error) {
    console.error("Error creando insumo:", error)
    return NextResponse.json({ error: "Error al crear insumo" }, { status: 500 })
  }
}


