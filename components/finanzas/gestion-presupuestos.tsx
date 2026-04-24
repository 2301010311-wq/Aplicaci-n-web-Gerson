"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

interface Presupuesto {
  id_presupuesto: number
  nombre: string
  monto_total: number
  monto_usado: number
  categoria: string
  fecha_inicio: string
  fecha_fin: string
  estado: string
}

export function GestionPresupuestos() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    nombre: "",
    monto_total: "",
    categoria: "Suministros",
    fecha_inicio: "",
    fecha_fin: "",
  })

  useEffect(() => {
    cargarPresupuestos()
  }, [])

  const cargarPresupuestos = async () => {
    try {
      const res = await fetch("/api/finanzas/presupuestos")
      if (res.ok) {
        const data = await res.json()
        setPresupuestos(data)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const agregarPresupuesto = async () => {
    if (!formData.nombre || !formData.monto_total) {
      alert("Completa los campos requeridos")
      return
    }

    try {
      const res = await fetch("/api/finanzas/presupuestos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          monto_total: parseFloat(formData.monto_total),
          categoria: formData.categoria,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
        }),
      })

      if (res.ok) {
        setFormData({
          nombre: "",
          monto_total: "",
          categoria: "Suministros",
          fecha_inicio: "",
          fecha_fin: "",
        })
        setDialogOpen(false)
        cargarPresupuestos()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const porcentajeUso = (usado: number, total: number) => {
    return Math.min((usado / total) * 100, 100)
  }

  return (
    <div className="space-y-6">
      {/* Botón nuevo presupuesto */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Presupuesto
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#2F2F2F] border-[#C9A227]">
          <DialogHeader>
            <DialogTitle className="text-[#EAEAEA]">Crear Presupuesto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[#EAEAEA]">Nombre *</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
                placeholder="Ej: Presupuesto Q4"
              />
            </div>

            <div>
              <Label className="text-[#EAEAEA]">Monto Total *</Label>
              <Input
                type="number"
                value={formData.monto_total}
                onChange={(e) => setFormData({ ...formData, monto_total: e.target.value })}
                className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
                placeholder="0.00"
              />
            </div>

            <div>
              <Label className="text-[#EAEAEA]">Categoría</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                <SelectTrigger className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2F2F2F] border-[#C9A227]">
                  <SelectItem value="Suministros" className="text-[#EAEAEA]">Suministros</SelectItem>
                  <SelectItem value="Marketing" className="text-[#EAEAEA]">Marketing</SelectItem>
                  <SelectItem value="Operativo" className="text-[#EAEAEA]">Operativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={agregarPresupuesto}
              className="w-full bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C]"
            >
              Crear Presupuesto
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tarjetas de presupuestos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presupuestos.map((presupuesto) => {
          const porcentaje = porcentajeUso(presupuesto.monto_usado, presupuesto.monto_total)
          const excedido = presupuesto.monto_usado > presupuesto.monto_total

          return (
            <Card
              key={presupuesto.id_presupuesto}
              className="bg-[#2F2F2F] border-[#C9A227] border-opacity-20 p-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#EAEAEA] font-semibold">{presupuesto.nombre}</h3>
                  <span className={`text-sm font-semibold ${excedido ? "text-red-400" : "text-green-400"}`}>
                    {porcentaje.toFixed(0)}%
                  </span>
                </div>

                <div>
                  <p className="text-[#C9A227] text-sm mb-2">
                    S/ {presupuesto.monto_usado.toFixed(2)} / S/ {presupuesto.monto_total.toFixed(2)}
                  </p>
                  <Progress
                    value={porcentaje}
                    className="h-2 bg-[#1C1C1C]"
                  />
                </div>

                <div className="flex justify-between text-sm text-[#C9A227]">
                  <span>{presupuesto.categoria}</span>
                  <span>{new Date(presupuesto.fecha_fin).toLocaleDateString()}</span>
                </div>

                {excedido && (
                  <div className="bg-red-500 bg-opacity-10 p-2 rounded border-l-4 border-l-red-500">
                    <p className="text-red-400 text-sm">
                      Excedido por: S/ {(presupuesto.monto_usado - presupuesto.monto_total).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {presupuestos.length === 0 && (
        <Card className="bg-[#2F2F2F] border-[#C9A227] border-opacity-20 p-8">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <TrendingUp className="w-12 h-12 text-[#C9A227]" />
            <div>
              <h3 className="text-[#EAEAEA] text-lg font-semibold">Sin Presupuestos</h3>
              <p className="text-[#C9A227] text-sm mt-1">
                Crea tu primer presupuesto para controlar los gastos
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
