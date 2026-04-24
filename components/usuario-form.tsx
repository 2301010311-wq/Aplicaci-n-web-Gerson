"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UsuarioFormProps {
  usuario?: {
    id: string
    nombre: string
    email: string
    rol: string
    activo: boolean
  }
}

export function UsuarioForm({ usuario }: UsuarioFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    nombre: usuario ? usuario.nombre.split(' ')[0] : "",
    apellido: usuario ? usuario.nombre.split(' ').slice(1).join(' ') : "",
    email: usuario?.email || "",
    password: "",
    rol: usuario?.rol?.toLowerCase() || "mesero",
    activo: usuario?.activo ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const url = usuario ? `/api/usuarios/${usuario.id}` : "/api/usuarios"
      const method = usuario ? "PUT" : "POST"

      const body: any = {
        email: formData.email,
        rol: formData.rol,
      }

      // Para PUT, enviar nombre completo (se dividirá en el backend)
      // Para POST, enviar nombre y apellido separados
      if (usuario) {
        body.nombre = `${formData.nombre} ${formData.apellido}`.trim()
      } else {
        body.nombre = formData.nombre
        body.apellido = formData.apellido
      }

      if (formData.password) {
        body.password = formData.password
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data.details ? `${data.error} - ${data.details}` : (data.error || "Error al guardar usuario")
        setError(errorMsg)
        console.error("Error response:", errorMsg)
        return
      }

      router.push("/usuarios")
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
            Nombre
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
          <Label htmlFor="apellido" className="text-[#EAEAEA]">
            Apellido
          </Label>
          <Input
            id="apellido"
            value={formData.apellido}
            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
            required
            className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#EAEAEA]">
            Correo Electrónico
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[#EAEAEA]">
            Contraseña {usuario && "(dejar vacío para no cambiar)"}
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!usuario}
            className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rol" className="text-[#EAEAEA]">
            Rol
          </Label>
          <Select value={formData.rol} onValueChange={(value) => setFormData({ ...formData, rol: value })}>
            <SelectTrigger className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2F2F2F] border-[#C9A227]">
              <SelectItem value="Admin" className="text-[#EAEAEA]">
                Administrador
              </SelectItem>
              <SelectItem value="Mesero" className="text-[#EAEAEA]">
                Mesero
              </SelectItem>
              <SelectItem value="Cocinero" className="text-[#EAEAEA]">
                Cocinero
              </SelectItem>
              <SelectItem value="Cajero" className="text-[#EAEAEA]">
                Cajero
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="activo"
            checked={formData.activo}
            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
            className="w-4 h-4 accent-[#C9A227]"
          />
          <Label htmlFor="activo" className="text-[#EAEAEA]">
            Usuario Activo
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
          {loading ? "Guardando..." : usuario ? "Actualizar" : "Crear Usuario"}
        </Button>
        <Button
          type="button"
          onClick={() => router.push("/usuarios")}
          className="bg-[#2F2F2F] hover:bg-[#1C1C1C] text-[#EAEAEA]"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
