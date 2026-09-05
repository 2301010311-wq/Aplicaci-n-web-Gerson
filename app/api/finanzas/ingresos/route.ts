import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"
import { ingresoSchema, validateSchema } from "@/lib/validations/schemas"

export async function GET() {
  const auth = await requireAuth(["Admin", "Cajero", "Tester"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const ingresos = await (prisma as any).ingresos.findMany({
      orderBy: { fecha_ingreso: "desc" },
    })
    
    // Convertir monto a número
    const ingresosFormatted = ingresos.map((ingreso: any) => ({
      ...ingreso,
      monto: Number(ingreso.monto),
    }))
    
    return NextResponse.json(ingresosFormatted)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al obtener ingresos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["Admin", "Cajero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json().catch(() => null)
    const validation = validateSchema(ingresoSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", errors: validation.errors }, { status: 400 })
    }
    const data = validation.data

    const ingreso = await (prisma as any).ingresos.create({
      data: {
        fecha_ingreso: new Date(),
        monto: data.monto,
        descripcion: data.descripcion,
        categoria: data.categoria,
        cliente: data.cliente,
        metodo_pago: data.metodo_pago,
        comprobante: data.comprobante,
        estado: "Registrado",
      },
    })

    return NextResponse.json(ingreso)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al crear ingreso" }, { status: 500 })
  }
}
