import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"
import { gastoSchema, validateSchema } from "@/lib/validations/schemas"

export async function GET() {
  const auth = await requireAuth(["Admin", "Cajero", "Tester"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const gastos = await (prisma as any).gastos.findMany({
      orderBy: { fecha_gasto: "desc" },
    })
    
    // Convertir monto a número
    const gastosFormatted = gastos.map((gasto: any) => ({
      ...gasto,
      monto: Number(gasto.monto),
    }))
    
    return NextResponse.json(gastosFormatted)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al obtener gastos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["Admin", "Cajero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json().catch(() => null)
    const validation = validateSchema(gastoSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", errors: validation.errors }, { status: 400 })
    }
    const data = validation.data

    const gasto = await (prisma as any).gastos.create({
      data: {
        fecha_gasto: new Date(),
        monto: data.monto,
        descripcion: data.descripcion,
        categoria: data.categoria,
        proveedor: data.proveedor,
        metodo_pago: data.metodo_pago,
        comprobante: data.comprobante,
        estado: "Registrado",
      },
    })

    return NextResponse.json(gasto)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al crear gasto" }, { status: 500 })
  }
}
