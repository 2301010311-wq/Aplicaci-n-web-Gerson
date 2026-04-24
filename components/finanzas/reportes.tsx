"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, BarChart3 } from "lucide-react"
import { useState } from "react"

interface ReporteOption {
  id: string
  titulo: string
  descripcion: string
  icono: React.ReactNode
}

export function Reportes() {
  const [generando, setGenerando] = useState(false)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<string | null>(null)

  const reportes: ReporteOption[] = [
    {
      id: "resultados",
      titulo: "Estado de Resultados",
      descripcion: "Ganancias y pérdidas del período",
      icono: <BarChart3 className="w-6 h-6" />,
    },
    {
      id: "balance",
      titulo: "Balance General",
      descripcion: "Activos, pasivos y patrimonio",
      icono: <BarChart3 className="w-6 h-6" />,
    },
    {
      id: "flujo",
      titulo: "Flujo de Efectivo",
      descripcion: "Entradas y salidas de dinero",
      icono: <BarChart3 className="w-6 h-6" />,
    },
    {
      id: "impuestos",
      titulo: "Reporte de Impuestos",
      descripcion: "Resumen para declaración de impuestos",
      icono: <FileText className="w-6 h-6" />,
    },
  ]

  const generarReporte = async (tipoReporte: string, formato: "pdf" | "excel") => {
    setGenerando(true)
    try {
      const res = await fetch(`/api/finanzas/reportes/${tipoReporte}`, {
        method: "GET",
        headers: {
          "Accept": formato === "pdf" ? "application/pdf" : "application/vnd.ms-excel",
        },
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `reporte-${tipoReporte}.${formato === "pdf" ? "pdf" : "xlsx"}`
        a.click()
      }
    } catch (error) {
      console.error("Error generando reporte:", error)
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[#EAEAEA] text-xl font-semibold mb-2">Reportes Financieros</h2>
        <p className="text-[#C9A227] text-sm">
          Genera reportes detallados en diferentes formatos
        </p>
      </div>

      {/* Grid de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportes.map((reporte) => (
          <Card
            key={reporte.id}
            className={`bg-[#2F2F2F] border-2 p-6 cursor-pointer transition-all ${
              reporteSeleccionado === reporte.id
                ? "border-[#C9A227]"
                : "border-[#C9A227] border-opacity-20 hover:border-opacity-40"
            }`}
            onClick={() => setReporteSeleccionado(reporte.id)}
          >
            <div className="flex items-start gap-4">
              <div className="text-[#C9A227]">{reporte.icono}</div>
              <div className="flex-1">
                <h3 className="text-[#EAEAEA] font-semibold">{reporte.titulo}</h3>
                <p className="text-[#C9A227] text-sm mt-1">{reporte.descripcion}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Opciones de exportación */}
      {reporteSeleccionado && (
        <Card className="bg-[#2F2F2F] border-[#C9A227] p-6">
          <h3 className="text-[#EAEAEA] font-semibold mb-4">Exportar Reporte</h3>
          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={() => generarReporte(reporteSeleccionado, "pdf")}
              disabled={generando}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
            <Button
              onClick={() => generarReporte(reporteSeleccionado, "excel")}
              disabled={generando}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Excel
            </Button>
          </div>
        </Card>
      )}

      {/* Preview de reporte */}
      <Card className="bg-[#2F2F2F] border-[#C9A227] border-opacity-20 p-8 min-h-96">
        <div className="flex flex-col items-center justify-center text-center gap-4">
          <FileText className="w-12 h-12 text-[#C9A227] opacity-50" />
          <p className="text-[#C9A227]">
            {reporteSeleccionado
              ? "Selecciona un formato para descargar el reporte"
              : "Selecciona un tipo de reporte para comenzar"}
          </p>
        </div>
      </Card>
    </div>
  )
}
