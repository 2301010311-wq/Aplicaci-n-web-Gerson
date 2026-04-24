import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-auth"

export async function GET() {
  const auth = await requireAuth(["Admin", "Cajero"])
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    // Obtener datos del mes actual
    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0)

    // Calcular ingresos
    const ingresos = await (prisma as any).ingresos.aggregate({
      _sum: { monto: true },
      where: {
        fecha_ingreso: {
          gte: inicioMes,
          lte: finMes,
        },
      },
    })

    // Calcular gastos
    const gastos = await (prisma as any).gastos.aggregate({
      _sum: { monto: true },
      where: {
        fecha_gasto: {
          gte: inicioMes,
          lte: finMes,
        },
      },
    })

    const ingresosTotales = Number(ingresos._sum?.monto || 0)
    const gastosTotales = Number(gastos._sum?.monto || 0)
    const utilidadNeta = ingresosTotales - gastosTotales

    // Datos para gráficos (últimos 6 meses)
    const ventasPorMes = []
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date()
      fecha.setMonth(fecha.getMonth() - i)
      const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
      const fin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0)

      const ingresosDelMes = await (prisma as any).ingresos.aggregate({
        _sum: { monto: true },
        where: { fecha_ingreso: { gte: inicio, lte: fin } },
      })

      const gastosDelMes = await (prisma as any).gastos.aggregate({
        _sum: { monto: true },
        where: { fecha_gasto: { gte: inicio, lte: fin } },
      })

      ventasPorMes.push({
        mes: fecha.toLocaleDateString("es-ES", { month: "short" }),
        ingresos: Number(ingresosDelMes._sum?.monto || 0),
        gastos: Number(gastosDelMes._sum?.monto || 0),
      })
    }

    // Proyección de flujo (próximos 6 meses)
    const proyeccionCaja = []
    let saldoActual = utilidadNeta
    for (let i = 1; i <= 6; i++) {
      const fecha = new Date()
      fecha.setMonth(fecha.getMonth() + i)
      saldoActual = saldoActual + (Math.random() * 2000 - 500) // Simulación
      proyeccionCaja.push({
        mes: fecha.toLocaleDateString("es-ES", { month: "short" }),
        saldo: saldoActual,
      })
    }

    // Alertas
    const alertas = []
    if (gastosTotales > ingresosTotales * 0.8) {
      alertas.push({
        id: 1,
        tipo: "gasto",
        mensaje: "Los gastos representan más del 80% de los ingresos",
        urgencia: "alta",
      })
    }

    return NextResponse.json({
      ingresosTotales: Number(ingresosTotales),
      gastosTotales: Number(gastosTotales),
      utilidadNeta: Number(utilidadNeta),
      flujoActual: Number(utilidadNeta),
      ventasPorMes,
      proyeccionCaja,
      alertas,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al obtener resumen" }, { status: 500 })
  }
}
