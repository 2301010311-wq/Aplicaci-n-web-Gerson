"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// ==========================================
// COMPONENTE
// ==========================================

/**
 * Formulario para crear una nueva mesa
 * Permite ingresar número, capacidad y estado inicial
 */
export function MesaForm() {
  const router = useRouter()
  
  // ==========================================
  // ESTADO LOCAL
  // ==========================================

  const [loading, setLoading] = useState(false)        // Indica si se está procesando el envío
  const [error, setError] = useState("")               // Mensaje de error a mostrar

  const [formData, setFormData] = useState({
    numero: "",           // Número identificador de la mesa
    capacidad: "",        // Cantidad máxima de personas
    estado: "Libre",      // Estado inicial (Libre, Ocupada, Reservada)
  })

  // ==========================================
  // FUNCIONES
  // ==========================================

  /** 
   * Maneja el envío del formulario
   * Valida datos, envía a la API y redirige si es exitoso
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validar que los campos obligatorios no estén vacíos
    if (!formData.numero || !formData.capacidad) {
      setError("Por favor completa todos los campos")
      return
    }

    setLoading(true)

    try {
      // Enviar datos a la API
      const res = await fetch("/api/mesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: Number.parseInt(formData.numero),        // Convertir a número
          capacidad: Number.parseInt(formData.capacidad),  // Convertir a número
          estado: formData.estado.toLowerCase(),            // Convertir a minúsculas
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al crear mesa")
        return
      }

      // Redirigir a la página de mesas y refrescar
      router.push("/mesas")
      router.refresh()
    } catch (err) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* CONTENEDOR PRINCIPAL DEL FORMULARIO */}
      <div className="bg-[#2F2F2F] p-6 rounded-lg space-y-4">
        {/* CAMPO: Número de Mesa */}
        <div className="space-y-2">
          <Label htmlFor="numero" className="text-[#EAEAEA]">
            Número de Mesa
          </Label>
          <Input
            id="numero"
            type="number"
            value={formData.numero}
            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
            required
            min="1"
            className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
          />
        </div>

        {/* CAMPO: Capacidad (personas) */}
        <div className="space-y-2">
          <Label htmlFor="capacidad" className="text-[#EAEAEA]">
            Capacidad (personas)
          </Label>
          <Input
            id="capacidad"
            type="number"
            value={formData.capacidad}
            onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
            required
            min="1"
            className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
          />
        </div>

        {/* CAMPO: Estado Inicial */}
        <div className="space-y-2">
          <Label htmlFor="estado" className="text-[#EAEAEA]">
            Estado Inicial
          </Label>
          <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
            <SelectTrigger className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2F2F2F] border-[#C9A227]">
              <SelectItem value="Libre" className="text-[#EAEAEA]">
                Libre
              </SelectItem>
              <SelectItem value="Ocupada" className="text-[#EAEAEA]">
                Ocupada
              </SelectItem>
              <SelectItem value="Reservada" className="text-[#EAEAEA]">
                Reservada
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* MENSAJE DE ERROR */}
      {error && (
        <div className="p-3 bg-[#8B1C26] bg-opacity-20 border border-[#8B1C26] rounded text-[#EAEAEA] text-sm">
          {error}
        </div>
      )}

      {/* BOTONES DE ACCIÓN */}
      <div className="flex gap-4">
        {/* Botón enviar - deshabilitado mientras se procesa */}
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-semibold"
        >
          {loading ? "Creando..." : "Crear Mesa"}
        </Button>
        
        {/* Botón cancelar - vuelve a mesas */}
        <Button
          type="button"
          onClick={() => router.push("/mesas")}
          className="bg-[#2F2F2F] hover:bg-[#1C1C1C] text-[#EAEAEA]"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
