import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["ADMIN", "CAJERO"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: { mesa: true },
    })

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    if (pedido.estado === "PAGADO") {
      return NextResponse.json({ error: "El pedido ya está pagado" }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.pedido.update({
        where: { id },
        data: { estado: "PAGADO" },
      }),
      prisma.finanza.create({
        data: {
          tipo: "INGRESO",
          monto: pedido.total,
          descripcion: `Pago de pedido - Mesa ${pedido.mesa.numero}`,
          pedidoId: id,
        },
      }),
      prisma.mesa.update({
        where: { id: pedido.mesaId },
        data: { estado: "LIBRE" },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error procesando pago:", error)
    return NextResponse.json({ error: "Error al procesar pago" }, { status: 500 })
  }
}
