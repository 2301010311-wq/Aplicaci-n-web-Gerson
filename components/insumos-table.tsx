"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Search, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface Insumo {
  id: string
  nombre: string
  stockActual: number
  stockMinimo: number
  unidadMedida: string
  fechaVencimiento: string | null
}

export function InsumosTable() {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [filteredInsumos, setFilteredInsumos] = useState<Insumo[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsumos()
  }, [])

  useEffect(() => {
    const filtered = insumos.filter(
      (i) =>
        i.nombre.toLowerCase().includes(search.toLowerCase()) ||
        i.unidadMedida.toLowerCase().includes(search.toLowerCase()),
    )
    setFilteredInsumos(filtered)
  }, [search, insumos])

  const fetchInsumos = async () => {
    try {
      const res = await fetch("/api/insumos")
      const data = await res.json()
      setInsumos(data)
      setFilteredInsumos(data)
    } catch (error) {
      console.error("Error cargando insumos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este insumo?")) return

    try {
      const res = await fetch(`/api/insumos/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchInsumos()
      }
    } catch (error) {
      console.error("Error eliminando insumo:", error)
    }
  }

  const isStockBajo = (insumo: Insumo) => insumo.stockActual <= insumo.stockMinimo

  const isPorVencer = (insumo: Insumo) => {
    if (!insumo.fechaVencimiento) return false
    const diasRestantes = Math.ceil(
      (new Date(insumo.fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    )
    return diasRestantes <= 7 && diasRestantes >= 0
  }

  if (loading) {
    return <div className="text-center text-[#EAEAEA] py-8">Cargando insumos...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-[#2F2F2F] p-2 rounded-lg">
        <Search className="w-5 h-5 text-[#C9A227] ml-2" />
        <Input
          placeholder="Buscar por nombre o unidad de medida..."
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
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Stock Actual</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Stock Mínimo</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Unidad</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Vencimiento</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Alertas</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {filteredInsumos.map((insumo) => (
                <tr key={insumo.id} className="hover:bg-[#1C1C1C] transition-colors">
                  <td className="px-6 py-4 text-[#EAEAEA] font-medium">{insumo.nombre}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${isStockBajo(insumo) ? "text-[#8B1C26]" : "text-[#EAEAEA]"}`}>
                      {insumo.stockActual}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#EAEAEA]">{insumo.stockMinimo}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-[#C9A227] text-[#1C1C1C] rounded-full text-sm font-medium">
                      {insumo.unidadMedida}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#EAEAEA]">
                    {insumo.fechaVencimiento ? new Date(insumo.fechaVencimiento).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {isStockBajo(insumo) && (
                        <span className="px-2 py-1 bg-[#8B1C26] bg-opacity-20 text-[#8B1C26] rounded text-xs font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Stock Bajo
                        </span>
                      )}
                      {isPorVencer(insumo) && (
                        <span className="px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-400 rounded text-xs font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Por Vencer
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/insumos/${insumo.id}`}>
                        <Button size="sm" className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C]">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(insumo.id)}
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

        {filteredInsumos.length === 0 && (
          <div className="text-center text-[#EAEAEA] py-8">No se encontraron insumos</div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-4">
        {filteredInsumos.map((insumo) => (
          <div key={insumo.id} className="bg-[#1C1C1C] p-4 rounded-lg border border-[#C9A227]">
            <div className="space-y-2">
              <p className="text-[#C9A227] text-sm font-semibold">{insumo.nombre}</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#C9A227]">Stock Actual:</span>
                  <p className={`font-semibold ${isStockBajo(insumo) ? "text-[#8B1C26]" : "text-[#EAEAEA]"}`}>
                    {insumo.stockActual}
                  </p>
                </div>
                <div>
                  <span className="text-[#C9A227]">Stock Mín:</span>
                  <p className="text-[#EAEAEA]">{insumo.stockMinimo}</p>
                </div>
                <div>
                  <span className="text-[#C9A227]">Unidad:</span>
                  <p className="text-[#EAEAEA]">{insumo.unidadMedida}</p>
                </div>
                <div>
                  <span className="text-[#C9A227]">Vencimiento:</span>
                  <p className="text-[#EAEAEA]">
                    {insumo.fechaVencimiento ? new Date(insumo.fechaVencimiento).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>

              {(isStockBajo(insumo) || isPorVencer(insumo)) && (
                <div className="flex gap-1 flex-wrap">
                  {isStockBajo(insumo) && (
                    <span className="px-2 py-1 bg-[#8B1C26] bg-opacity-20 text-[#8B1C26] rounded text-xs font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Stock Bajo
                    </span>
                  )}
                  {isPorVencer(insumo) && (
                    <span className="px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-400 rounded text-xs font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Por Vencer
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              <Link href={`/insumos/${insumo.id}`} className="flex-1 min-w-[120px]">
                <Button size="sm" className="w-full bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] text-xs">
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={() => handleDelete(insumo.id)}
                className="flex-1 min-w-[120px] bg-[#8B1C26] hover:bg-[#6d1620] text-white text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
        ))}

        {filteredInsumos.length === 0 && (
          <div className="text-center text-[#EAEAEA] py-8">No se encontraron insumos</div>
        )}
      </div>
    </div>
  )
}

