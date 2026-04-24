"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ProductoFormProps {
  producto?: {
    id: string
    nombre: string
    descripcion: string | null
    precio: number
    categoria: string
    estado: boolean
    fechaVencimiento: Date | null
    stock: number
    controlarStock?: boolean
  }
}

export function ProductoForm({ producto }: ProductoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    nombre: producto?.nombre || "",
    descripcion: producto?.descripcion || "",
    precio: producto?.precio.toString() || "",
    categoria: producto?.categoria || "",
    estado: producto?.estado ?? true,
    stock: producto && producto.stock !== undefined ? producto.stock.toString() : "0",
    controlarStock: producto?.controlarStock ?? true,
    fechaVencimiento: producto?.fechaVencimiento ? new Date(producto.fechaVencimiento).toISOString().split("T")[0] : "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const url = producto ? `/api/productos/${producto.id}` : "/api/productos"
      const method = producto ? "PUT" : "POST"

      const body: any = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || "",
        precio: Number.parseFloat(formData.precio),
        categoria: formData.categoria,
        estado: formData.estado ? "Activo" : "Inactivo",
        stock: parseInt(formData.stock) || 0,
        controlarStock: formData.controlarStock,
        fechaVencimiento: formData.fechaVencimiento,
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data.details ? `${data.error} - ${data.details}` : (data.error || "Error al guardar producto")
        setError(errorMsg)
        console.error("Error response:", errorMsg)
        return
      }

      router.push("/productos")
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
            Nombre del Producto
          </Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion" className="text-[#EAEAEA]">
            Descripción
          </Label>
          <Textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="precio" className="text-[#EAEAEA]">
              Precio (S/)
            </Label>
            <Input
              id="precio"
              type="number"
              step="0.01"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
              required
              min="0"
              className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-[#EAEAEA]">
              Categoría
            </Label>
            <Input
              id="categoria"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              required
              className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
              placeholder="Ej: Pollos, Bebidas, Guarniciones"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stock" className="text-[#EAEAEA]">
              Stock Inicial
            </Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              min="0"
              className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
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

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="estado"
            checked={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
            className="w-4 h-4 accent-[#C9A227]"
          />
          <Label htmlFor="estado" className="text-[#EAEAEA]">
            Producto Disponible
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="controlarStock"
            checked={formData.controlarStock}
            onChange={(e) => setFormData({ ...formData, controlarStock: e.target.checked })}
            className="w-4 h-4 accent-[#C9A227]"
          />
          <Label htmlFor="controlarStock" className="text-[#EAEAEA]">
            Controlar Stock (Se deduce al crear pedidos)
          </Label>
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
          {loading ? "Guardando..." : producto ? "Actualizar" : "Crear Producto"}
        </Button>
        <Button
          type="button"
          onClick={() => router.push("/productos")}
          className="bg-[#2F2F2F] hover:bg-[#1C1C1C] text-[#EAEAEA]"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
