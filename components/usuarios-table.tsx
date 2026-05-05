"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Search } from "lucide-react"
import Link from "next/link"

interface Usuario {
  id: string
  nombre: string
  email: string
  rol: string
  activo: boolean
  createdAt: string
}

export function UsuariosTable() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsuarios()
  }, [])

  useEffect(() => {
    const filtered = usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.rol.toLowerCase().includes(search.toLowerCase()),
    )
    setFilteredUsuarios(filtered)
  }, [search, usuarios])

  const fetchUsuarios = async () => {
    try {
      const res = await fetch("/api/usuarios")
      const data = await res.json()

      if (!res.ok) {
        console.error("Error cargando usuarios:", data?.error || data)
        setUsuarios([])
        setFilteredUsuarios([])
        return
      }

      const usuariosData = Array.isArray(data) ? data : []
      setUsuarios(usuariosData)
      setFilteredUsuarios(usuariosData)
    } catch (error) {
      console.error("Error cargando usuarios:", error)
      setUsuarios([])
      setFilteredUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return

    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchUsuarios()
      }
    } catch (error) {
      console.error("Error eliminando usuario:", error)
    }
  }

  if (loading) {
    return <div className="text-center text-[#EAEAEA] py-8">Cargando usuarios...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-[#2F2F2F] p-2 rounded-lg">
        <Search className="w-5 h-5 text-[#C9A227] ml-2" />
        <Input
          placeholder="Buscar por nombre, email o rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-[#EAEAEA] focus-visible:ring-0"
        />
      </div>

      {/* Desktop Table */}
      <div className="bg-[#2F2F2F] rounded-lg overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1C1C1C]">
              <tr>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Rol</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Estado</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-[#1C1C1C] transition-colors">
                  <td className="px-6 py-4 text-[#EAEAEA]">{usuario.nombre}</td>
                  <td className="px-6 py-4 text-[#EAEAEA]">{usuario.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-[#C9A227] text-[#1C1C1C] rounded-full text-sm font-medium">
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        usuario.activo
                          ? "bg-green-500 bg-opacity-20 text-green-400"
                          : "bg-red-500 bg-opacity-20 text-red-400"
                      }`}
                    >
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/usuarios/${usuario.id}`}>
                        <Button size="sm" className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C]">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(usuario.id)}
                        className="bg-[#8B1C26] hover:bg-[#6d1620] text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsuarios.length === 0 && (
          <div className="text-center text-[#EAEAEA] py-8">No se encontraron usuarios</div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-4">
        {filteredUsuarios.map((usuario) => (
          <div key={usuario.id} className="bg-[#1C1C1C] p-4 rounded-lg border border-[#C9A227]">
            <div className="space-y-2">
              <p className="text-[#C9A227] text-sm font-semibold">{usuario.nombre}</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#C9A227]">Email:</span>
                  <p className="text-[#EAEAEA] truncate">{usuario.email}</p>
                </div>
                <div>
                  <span className="text-[#C9A227]">Rol:</span>
                  <p className="text-[#EAEAEA]">{usuario.rol}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[#C9A227]">Estado:</span>
                  <p className={`text-sm font-medium ${
                    usuario.activo ? "text-green-400" : "text-red-400"
                  }`}>
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              <Link href={`/usuarios/${usuario.id}`} className="flex-1 min-w-[120px]">
                <Button size="sm" className="w-full bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] text-xs">
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={() => handleDelete(usuario.id)}
                className="flex-1 min-w-[120px] bg-[#8B1C26] hover:bg-[#6d1620] text-white text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
        ))}

        {filteredUsuarios.length === 0 && (
          <div className="text-center text-[#EAEAEA] py-8">No se encontraron usuarios</div>
        )}
      </div>
    </div>
  )
}

