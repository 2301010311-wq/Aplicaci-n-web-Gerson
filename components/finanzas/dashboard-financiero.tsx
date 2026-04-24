"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Activity,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ResumenFinanciero {
  ingresosTotales: number
  gastosTotales: number
  utilidadNeta: number
  flujoActual: number
  ventasPorMes: Array<{ mes: string; ingresos: number; gastos: number }>
  proyeccionCaja: Array<{ mes: string; saldo: number }>
  alertas: Array<{ id: number; tipo: string; mensaje: string; urgencia: string }>
}

export function DashboardFinanciero() {
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarResumen()
  }, [])

  const cargarResumen = async () => {
    try {
      const res = await fetch("/api/finanzas/resumen", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) {
        const data = await res.json()
        setResumen(data)
      } else {
        console.error("Error:", res.status, res.statusText)
      }
    } catch (error) {
      console.error("Error cargando resumen:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center text-[#EAEAEA] py-8">Cargando datos financieros...</div>
  }

  if (!resumen) {
    return <div className="text-center text-red-400 py-8">Error al cargar datos</div>
  }

  const tarjetas = [
    {
      titulo: "Ingresos Totales",
      valor: `S/ ${resumen.ingresosTotales.toFixed(2)}`,
      icono: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500 bg-opacity-10",
    },
    {
      titulo: "Gastos Totales",
      valor: `S/ ${resumen.gastosTotales.toFixed(2)}`,
      icono: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500 bg-opacity-10",
    },
    {
      titulo: "Utilidad Neta",
      valor: `S/ ${resumen.utilidadNeta.toFixed(2)}`,
      icono: DollarSign,
      color: resumen.utilidadNeta >= 0 ? "text-[#C9A227]" : "text-red-400",
      bg: "bg-[#C9A227] bg-opacity-10",
    },
    {
      titulo: "Flujo de Caja",
      valor: `S/ ${resumen.flujoActual.toFixed(2)}`,
      icono: Activity,
      color: "text-blue-400",
      bg: "bg-blue-500 bg-opacity-10",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Botón Actualizar */}
      <div className="flex justify-end">
        <Button
          onClick={cargarResumen}
          variant="outline"
          className="border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#1C1C1C]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar Datos
        </Button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tarjetas.map((tarjeta, idx) => {
          const Icon = tarjeta.icono
          return (
            <Card
              key={idx}
              className="bg-[#2F2F2F] border-[#C9A227] border-opacity-20 p-6 hover:border-opacity-40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#C9A227] text-sm font-medium">{tarjeta.titulo}</p>
                  <p className="text-[#EAEAEA] text-2xl font-bold mt-2">{tarjeta.valor}</p>
                </div>
                <div className={`${tarjeta.bg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${tarjeta.color}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Ingresos vs Gastos */}
        <Card className="bg-[#2F2F2F] border-[#C9A227] border-opacity-20 p-6">
          <h3 className="text-[#EAEAEA] font-semibold mb-4">Ingresos vs Gastos por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resumen.ventasPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="mes" stroke="#C9A227" />
              <YAxis stroke="#C9A227" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#1C1C1C", border: "1px solid #C9A227" }}
                formatter={(value: any) => `S/ ${Number(value).toFixed(2)}`}
              />
              <Legend />
              <Bar dataKey="ingresos" fill="#10b981" />
              <Bar dataKey="gastos" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Gráfico de Proyección de Flujo */}
        <Card className="bg-[#2F2F2F] border-[#C9A227] border-opacity-20 p-6">
          <h3 className="text-[#EAEAEA] font-semibold mb-4">Proyección de Flujo de Caja</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={resumen.proyeccionCaja}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="mes" stroke="#C9A227" />
              <YAxis stroke="#C9A227" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#1C1C1C", border: "1px solid #C9A227" }}
                formatter={(value: any) => `S/ ${Number(value).toFixed(2)}`}
              />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="#C9A227" 
                strokeWidth={2}
                dot={{ fill: "#C9A227" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Alertas */}
      {resumen.alertas.length > 0 && (
        <Card className="bg-[#2F2F2F] border-[#C9A227] border-opacity-20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-[#C9A227]" />
            <h3 className="text-[#EAEAEA] font-semibold">Alertas Importantes</h3>
          </div>
          <div className="space-y-2">
            {resumen.alertas.map((alerta) => (
              <div
                key={alerta.id}
                className={`p-3 rounded-lg border-l-4 ${
                  alerta.urgencia === "alta"
                    ? "bg-red-500 bg-opacity-10 border-l-red-500"
                    : "bg-yellow-500 bg-opacity-10 border-l-yellow-500"
                }`}
              >
                <p className="text-[#EAEAEA] text-sm">{alerta.mensaje}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
