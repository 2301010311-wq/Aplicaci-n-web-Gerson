import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const { nombre, stockActual, stockMinimo, unidadMedida, fechaVencimiento } = await request.json()

    const insumo = await prisma.insumos.update({
      where: { id_insumo: parseInt(id) },
      data: {
        nombre_insu: nombre,
        stock_act_insu: stockActual,
        stock_min_insu: stockMinimo,
        unidadmedida_insu: unidadMedida,
        vencimiento_insu: fechaVencimiento ? new Date(fechaVencimiento) : undefined,
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
    console.error("Error actualizando insumo:", error)
    return NextResponse.json({ error: "Error al actualizar insumo" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params

    await prisma.insumos.delete({
      where: { id_insumo: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando insumo:", error)
    return NextResponse.json({ error: "Error al eliminar insumo" }, { status: 500 })
  }
}
