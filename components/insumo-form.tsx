"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InsumoFormProps {
  insumo?: {
    id: string
    nombre: string
    stockActual: number
    stockMinimo: number
    unidadMedida: string
    fechaVencimiento: Date | null
  }
}

export function InsumoForm({ insumo }: InsumoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    nombre: insumo?.nombre || "",
    stockActual: insumo?.stockActual.toString() || "",
    stockMinimo: insumo?.stockMinimo.toString() || "",
    unidadMedida: insumo?.unidadMedida || "",
    fechaVencimiento: insumo?.fechaVencimiento ? new Date(insumo.fechaVencimiento).toISOString().split("T")[0] : "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const url = insumo ? `/api/insumos/${insumo.id}` : "/api/insumos"
      const method = insumo ? "PUT" : "POST"

      const body: any = {
        nombre: formData.nombre,
        stockActual: Number.parseInt(formData.stockActual),
        stockMinimo: Number.parseInt(formData.stockMinimo),
        unidadMedida: formData.unidadMedida,
        fechaVencimiento: formData.fechaVencimiento ? new Date(formData.fechaVencimiento).toISOString() : null,
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al guardar insumo")
        return
      }

      router.push("/insumos")
      router.refresh()
    } catch (err) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="bg-[#2F2F2F] p-6 rounded-lg space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre" className="text-[#EAEAEA]">
            Nombre del Insumo
          </Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stockActual" className="text-[#EAEAEA]">
              Stock Actual
            </Label>
            <Input
              id="stockActual"
              type="number"
              value={formData.stockActual}
              onChange={(e) => setFormData({ ...formData, stockActual: e.target.value })}
              required
              min="0"
              className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stockMinimo" className="text-[#EAEAEA]">
              Stock Mínimo
            </Label>
            <Input
              id="stockMinimo"
              type="number"
              value={formData.stockMinimo}
              onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
              required
              min="0"
              className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unidadMedida" className="text-[#EAEAEA]">
            Unidad de Medida
          </Label>
          <Input
            id="unidadMedida"
            value={formData.unidadMedida}
            onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
            required
            className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
            placeholder="Ej: kg, litros, unidades"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fechaVencimiento" className="text-[#EAEAEA]">
            Fecha de Vencimiento (opcional)
          </Label>
          <Input
            id="fechaVencimiento"
            type="date"
            value={formData.fechaVencimiento}
            onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
            className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[#8B1C26] bg-opacity-20 border border-[#8B1C26] rounded text-[#EAEAEA] text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-semibold"
        >
          {loading ? "Guardando..." : insumo ? "Actualizar" : "Crear Insumo"}
        </Button>
        <Button
          type="button"
          onClick={() => router.push("/insumos")}
          className="bg-[#2F2F2F] hover:bg-[#1C1C1C] text-[#EAEAEA]"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
