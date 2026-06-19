import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export const dynamic = "force-dynamic"

function getTodayRangeInLima() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  const today = formatter.format(new Date())
  const start = new Date(`${today}T05:00:00.000Z`)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)

  return { start, end, today }
}

export async function GET() {
  const auth = await requireAuth(["Admin", "Cajero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { start, end, today } = getTodayRangeInLima()
    const sevenDaysFromNow = new Date(start)
    sevenDaysFromNow.setUTCDate(sevenDaysFromNow.getUTCDate() + 7)

    const [ventas, pedidosActivos, insumosVencer, insumos] = await Promise.all([
      prisma.ingresos.aggregate({
        where: {
          categoria: "Ventas",
          estado: "Registrado",
          fecha_ingreso: {
            gte: start,
            lt: end,
          },
        },
        _sum: {
          monto: true,
        },
      }),
      prisma.pedidos.count({
        where: {
          estado_pedido: {
            in: ["En preparacion", "En proceso", "Listo para recoger", "Servido"],
          },
        },
      }),
      prisma.insumos.count({
        where: {
          vencimiento_insu: {
            gte: start,
            lt: sevenDaysFromNow,
          },
        },
      }),
      prisma.insumos.findMany({
        select: {
          stock_act_insu: true,
          stock_min_insu: true,
        },
      }),
    ])

    const insumosBajoStock = insumos.filter((insumo) => {
      const stockActual = Number(insumo.stock_act_insu ?? 0)
      const stockMinimo = Number(insumo.stock_min_insu ?? 0)
      return stockActual <= stockMinimo
    }).length

    return NextResponse.json({
      ventasHoy: Number(ventas._sum.monto ?? 0),
      pedidosActivos,
      insumosVencer,
      insumosBajoStock,
      fecha: today,
    })
  } catch (error) {
    console.error("Error obteniendo dashboard:", error)
    return NextResponse.json({ error: "Error al obtener datos del dashboard" }, { status: 500 })
  }
}
