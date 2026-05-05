import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["Admin", "Cocinero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { tipo_presa, cantidad } = await request.json()

    // ✅ VALIDACIÓN EXHAUSTIVA
    if (!tipo_presa || !["pecho", "pierna"].includes(tipo_presa)) {
      return NextResponse.json(
        { error: "Tipo de presa inválido. Use 'pecho' o 'pierna'" },
        { status: 400 }
      )
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return NextResponse.json(
        { 
          error: "Cantidad debe ser un número entero positivo",
          recibido: cantidad,
        },
        { status: 400 }
      )
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const inventario = await prisma.inventario_pollos.findUnique({
      where: { fecha: hoy },
    })

    if (!inventario) {
      return NextResponse.json(
        { 
          error: "No hay inventario para hoy. Contacta admin para crear registro.",
          fecha: hoy.toISOString().split('T')[0],
        },
        { status: 400 }
      )
    }

    const campo = tipo_presa === "pecho" ? "pechos_disponibles" : "piernas_disponibles"
    const disponibles =
      tipo_presa === "pecho" ? inventario.pechos_disponibles : inventario.piernas_disponibles

    if (disponibles < cantidad) {
      return NextResponse.json(
        {
          error: `Stock insuficiente de ${tipo_presa}s. Disponibles: ${disponibles}, Solicitados: ${cantidad}`,
          disponibles,
          solicitados: cantidad,
          faltante: cantidad - disponibles,
        },
        { status: 400 }
      )
    }

    // ✅ DESCONTAR ATOMICAMENTE
    const actualizado = await prisma.inventario_pollos.update({
      where: { fecha: hoy },
      data: {
        [campo]: disponibles - cantidad,
      },
    })

    return NextResponse.json({
      success: true,
      tipo_presa,
      cantidad_descontada: cantidad,
      inventario: {
        pechos: actualizado.pechos_disponibles,
        piernas: actualizado.piernas_disponibles,
        total: actualizado.pollos_totales,
        fecha: actualizado.fecha.toISOString().split('T')[0],
      },
    })
  } catch (error) {
    console.error("[DESCONTAR PRESA] Error:", error)
    return NextResponse.json(
      { error: "Error al descontar presa" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { tipo_presa, cantidad } = await request.json()

    if (!tipo_presa || !["pecho", "pierna"].includes(tipo_presa)) {
      return NextResponse.json(
        { error: "Tipo de presa inválido. Use 'pecho' o 'pierna'" },
        { status: 400 }
      )
    }

    // ✅ VALIDAR QUE CANTIDAD SEA NO-NEGATIVA (para ajuste manual)
    if (!Number.isInteger(cantidad) || cantidad < 0) {
      return NextResponse.json(
        { 
          error: `Cantidad debe ser >= 0. Recibido: ${cantidad}`,
          sugerencia: "Use POST para descontar, PUT solo para ajustes de inventario."
        },
        { status: 400 }
      )
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const inventario = await prisma.inventario_pollos.findUnique({
      where: { fecha: hoy },
    })

    if (!inventario) {
      return NextResponse.json(
        { error: "No hay inventario para hoy. Contacta admin para crear registro." },
        { status: 400 }
      )
    }

    const campo = tipo_presa === "pecho" ? "pechos_disponibles" : "piernas_disponibles"
    const valorAnterior = tipo_presa === "pecho" ? inventario.pechos_disponibles : inventario.piernas_disponibles

    const actualizado = await prisma.inventario_pollos.update({
      where: { fecha: hoy },
      data: {
        [campo]: cantidad,
      },
    })

    return NextResponse.json({
      success: true,
      tipo_presa,
      ajuste: {
        anterior: valorAnterior,
        nuevo: cantidad,
        diferencia: cantidad - valorAnterior,
      },
      inventario: {
        pechos: actualizado.pechos_disponibles,
        piernas: actualizado.piernas_disponibles,
        total: actualizado.pollos_totales,
        fecha: actualizado.fecha.toISOString().split('T')[0],
      },
    })
  } catch (error) {
    console.error("[AJUSTAR PRESA] Error:", error)
    return NextResponse.json(
      { error: "Error al ajustar presa" },
      { status: 500 }
    )
  }
}
