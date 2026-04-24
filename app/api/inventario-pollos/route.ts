import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    let inventario = await prisma.inventario_pollos.findUnique({
      where: { fecha: hoy },
    })

    // Si no existe inventario para hoy, crear uno basado en el anterior
    if (!inventario) {
      const ultimoInventario = await prisma.inventario_pollos.findFirst({
        orderBy: { fecha: "desc" },
      })

      inventario = await prisma.inventario_pollos.create({
        data: {
          fecha: hoy,
          pollos_totales: ultimoInventario?.pollos_totales || 0,
          pechos_disponibles: ultimoInventario?.pechos_disponibles || 0,
          piernas_disponibles: ultimoInventario?.piernas_disponibles || 0,
        },
      })
    }

    return NextResponse.json(inventario)
  } catch (error) {
    console.error("Error al obtener inventario:", error)
    return NextResponse.json({ error: "Error al obtener inventario" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pollos_totales } = await request.json()

    if (!pollos_totales || pollos_totales <= 0) {
      return NextResponse.json(
        { error: "Ingrese un número válido de pollos" },
        { status: 400 }
      )
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    // Cada pollo tiene 2 pechos y 2 piernas
    const pechos = pollos_totales * 2
    const piernas = pollos_totales * 2

    const inventario = await prisma.inventario_pollos.upsert({
      where: { fecha: hoy },
      update: {
        pollos_totales,
        pechos_disponibles: pechos,
        piernas_disponibles: piernas,
      },
      create: {
        fecha: hoy,
        pollos_totales,
        pechos_disponibles: pechos,
        piernas_disponibles: piernas,
      },
    })

    return NextResponse.json(inventario)
  } catch (error) {
    console.error("Error al actualizar inventario:", error)
    return NextResponse.json({ error: "Error al actualizar inventario" }, { status: 500 })
  }
}
