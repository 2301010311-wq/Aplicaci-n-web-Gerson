import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"
import { mesaSchema, validateSchema } from "@/lib/validations/schemas"

export async function GET() {
  const auth = await requireAuth(["Admin", "Mesero", "Tester"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const mesasRaw = await prisma.mesas.findMany({
      orderBy: { numero_mesa: "asc" },
    })

    // Mapear a la estructura esperada por el frontend, excluyendo mesas ficticias
    const mesas = mesasRaw
      .filter((mesa: any) => mesa.numero_mesa > 0) // Excluir mesas ficticias (-1, -2)
      .map((mesa: any) => ({
        id: mesa.id_mesa.toString(),
        numero: mesa.numero_mesa,
        capacidad: mesa.capacidad_mesa,
        estado: mesa.estado_mesa,
      }))

    return NextResponse.json(mesas)
  } catch (error) {
    console.error("Error obteniendo mesas:", error)
    return NextResponse.json({ error: "Error al obtener mesas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["Admin"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json().catch(() => null)
    const validation = validateSchema(mesaSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", errors: validation.errors }, { status: 400 })
    }
    const { numero, capacidad, estado } = validation.data

    const existingMesa = await prisma.mesas.findUnique({
      where: { numero_mesa: numero },
    })

    if (existingMesa) {
      return NextResponse.json({ error: "Ya existe una mesa con ese número" }, { status: 400 })
    }

    const mesa = await prisma.mesas.create({
      data: {
        numero_mesa: numero,
        capacidad_mesa: capacidad,
        estado_mesa: estado || "Libre",
      },
    })

    return NextResponse.json({
      id: mesa.id_mesa.toString(),
      numero: mesa.numero_mesa,
      capacidad: mesa.capacidad_mesa,
      estado: mesa.estado_mesa,
    })
  } catch (error) {
    console.error("Error creando mesa:", error)
    return NextResponse.json({ error: "Error al crear mesa" }, { status: 500 })
  }
}


