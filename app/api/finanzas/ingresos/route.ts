import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function GET() {
  const auth = await requireAuth(["Admin", "Cajero"])
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
    const data = await request.json()

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
