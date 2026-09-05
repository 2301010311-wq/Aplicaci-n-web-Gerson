import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"
import { presupuestoSchema, validateSchema } from "@/lib/validations/schemas"

export async function GET() {
  const auth = await requireAuth(["Admin", "Cajero", "Tester"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const presupuestos = await (prisma as any).presupuestos.findMany({
      orderBy: { fecha_inicio: "desc" },
    })
    
    // Convertir montos a números
    const presupuestosFormatted = presupuestos.map((presupuesto: any) => ({
      ...presupuesto,
      monto_total: Number(presupuesto.monto_total),
      monto_usado: Number(presupuesto.monto_usado),
    }))
    
    return NextResponse.json(presupuestosFormatted)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al obtener presupuestos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json().catch(() => null)
    const validation = validateSchema(presupuestoSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", errors: validation.errors }, { status: 400 })
    }
    const data = validation.data

    const presupuesto = await (prisma as any).presupuestos.create({
      data: {
        nombre: data.nombre,
        monto_total: data.monto_total,
        monto_usado: 0,
        categoria: data.categoria,
        fecha_inicio: new Date(data.fecha_inicio),
        fecha_fin: new Date(data.fecha_fin),
        estado: "Activo",
      },
    })

    return NextResponse.json(presupuesto)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al crear presupuesto" }, { status: 500 })
  }
}
