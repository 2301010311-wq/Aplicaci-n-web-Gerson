import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function getTodayInLima() {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())

  return new Date(`${today}T00:00:00.000Z`)
}

export async function POST(request: NextRequest) {
  try {
    const { tipo_presa, cantidad } = await request.json()

    if (!tipo_presa || !["pecho", "pierna"].includes(tipo_presa)) {
      return NextResponse.json(
        { error: "Tipo de presa inválido. Use 'pecho' o 'pierna'" },
        { status: 400 }
      )
    }

    if (!cantidad || cantidad <= 0) {
      return NextResponse.json(
        { error: "Cantidad debe ser mayor a 0" },
        { status: 400 }
      )
    }

    const hoy = getTodayInLima()

    const inventario = await prisma.inventario_pollos.findUnique({
      where: { fecha: hoy },
    })

    if (!inventario) {
      return NextResponse.json(
        { error: "No hay inventario disponible para hoy" },
        { status: 400 }
      )
    }

    const campo = tipo_presa === "pecho" ? "pechos_disponibles" : "piernas_disponibles"
    const disponibles =
      tipo_presa === "pecho" ? inventario.pechos_disponibles : inventario.piernas_disponibles

    if (disponibles < cantidad) {
      return NextResponse.json(
        {
          error: `No hay suficientes ${tipo_presa}s disponibles. Disponibles: ${disponibles}, Solicitados: ${cantidad}`,
        },
        { status: 400 }
      )
    }

    const actualizado = await prisma.inventario_pollos.update({
      where: { fecha: hoy },
      data: {
        [campo]: disponibles - cantidad,
      },
    })

    return NextResponse.json({
      success: true,
      inventario: actualizado,
    })
  } catch (error) {
    console.error("Error al descontar presa:", error)
    return NextResponse.json({ error: "Error al descontar presa" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { tipo_presa, cantidad } = await request.json()

    if (!tipo_presa || !["pecho", "pierna"].includes(tipo_presa)) {
      return NextResponse.json(
        { error: "Tipo de presa inválido. Use 'pecho' o 'pierna'" },
        { status: 400 }
      )
    }

    if (!cantidad || cantidad < 0) {
      return NextResponse.json(
        { error: "Cantidad no válida" },
        { status: 400 }
      )
    }

    const hoy = getTodayInLima()

    const inventario = await prisma.inventario_pollos.findUnique({
      where: { fecha: hoy },
    })

    if (!inventario) {
      return NextResponse.json(
        { error: "No hay inventario disponible para hoy" },
        { status: 400 }
      )
    }

    const campo = tipo_presa === "pecho" ? "pechos_disponibles" : "piernas_disponibles"

    const actualizado = await prisma.inventario_pollos.update({
      where: { fecha: hoy },
      data: {
        [campo]: cantidad,
      },
    })

    return NextResponse.json({
      success: true,
      inventario: actualizado,
    })
  } catch (error) {
    console.error("Error al actualizar presa:", error)
    return NextResponse.json({ error: "Error al actualizar presa" }, { status: 500 })
  }
}
