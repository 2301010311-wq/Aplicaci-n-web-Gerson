"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Search } from "lucide-react"
import Link from "next/link"

interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  categoria: string
  estado: string
  stock: number
  controlarStock?: boolean
  fechaVencimiento: string | null
}

export function ProductosTable() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProductos()
  }, [])

  useEffect(() => {
    const filtered = productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.categoria.toLowerCase().includes(search.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(search.toLowerCase())),
    )
    setFilteredProductos(filtered)
  }, [search, productos])

  const fetchProductos = async () => {
    try {
      const res = await fetch("/api/productos")
      const data = await res.json()
      setProductos(data)
      setFilteredProductos(data)
    } catch (error) {
      console.error("Error cargando productos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return

    try {
      const res = await fetch(`/api/productos/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchProductos()
      }
    } catch (error) {
      console.error("Error eliminando producto:", error)
    }
  }

  if (loading) {
    return <div className="text-center text-[#EAEAEA] py-8">Cargando productos...</div>
  }

  return (
    <div className="space-y-5">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C9A227] to-[#8B7B1F] rounded-lg blur opacity-20"></div>
        <div className="relative flex items-center gap-3 bg-[#1C1C1C] border border-[#C9A227] border-opacity-30 px-4 py-3 rounded-lg hover:border-opacity-60 transition-all duration-300">
          <Search className="w-5 h-5 text-[#C9A227] flex-shrink-0" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-[#EAEAEA] placeholder-gray-500 focus-visible:ring-0 text-sm"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-[#C9A227] border-opacity-20 overflow-hidden bg-gradient-to-br from-[#2F2F2F] to-[#1C1C1C]">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="bg-gradient-to-r from-[#1C1C1C] to-[#2F2F2F] border-b border-[#C9A227] border-opacity-20">
                <th className="px-4 py-3 text-left text-xs font-bold text-[#C9A227] uppercase tracking-wider">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#C9A227] uppercase tracking-wider">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#C9A227] uppercase tracking-wider">Precio</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#C9A227] uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#C9A227] uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-[#C9A227] uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-[#C9A227] divide-opacity-10">
              {filteredProductos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[#999999]">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                filteredProductos.map((producto) => (
                  <tr
                    key={producto.id}
                    className="group hover:bg-[#C9A227] hover:bg-opacity-5 transition-colors duration-200 border-b border-[#C9A227] border-opacity-5 last:border-b-0"
                  >
                    {/* Producto */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#EAEAEA] group-hover:text-[#C9A227] transition-colors">
                          {producto.nombre}
                        </span>
                        {producto.descripcion && (
                          <span className="text-xs text-[#999999] mt-1 line-clamp-1">
                            {producto.descripcion}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-block px-3 py-1.5 bg-[#C9A227] bg-opacity-20 text-[#EAEAEA] rounded-md text-sm font-semibold border border-[#C9A227] border-opacity-40">
                        {producto.categoria}
                      </span>
                    </td>

                    {/* Precio */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-[#C9A227]">
                        S/ {producto.precio.toFixed(2)}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border border-opacity-30 ${
                          producto.controlarStock === false
                            ? "bg-slate-600 bg-opacity-20 text-slate-300 border-slate-600"
                            : producto.stock > 10
                            ? "bg-emerald-600 bg-opacity-20 text-emerald-300 border-emerald-600"
                            : producto.stock > 0
                            ? "bg-amber-600 bg-opacity-20 text-amber-300 border-amber-600"
                            : "bg-rose-600 bg-opacity-20 text-rose-300 border-rose-600"
                        }`}
                      >
                        {producto.controlarStock === false
                          ? "Sin control"
                          : `${producto.stock} un.`}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border border-opacity-30 ${
                          producto.estado === "Activo"
                            ? "bg-emerald-600 bg-opacity-20 text-emerald-300 border-emerald-600"
                            : "bg-rose-600 bg-opacity-20 text-rose-300 border-rose-600"
                        }`}
                      >
                        {producto.estado}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/productos/${producto.id}`}>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#C9A227] to-[#a88820] hover:from-[#a88820] hover:to-[#8B7B1F] text-[#1C1C1C] font-semibold transition-all duration-300 h-8 w-8 p-0"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => handleDelete(producto.id)}
                          className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold transition-all duration-300 h-8 w-8 p-0"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Count */}
      {filteredProductos.length > 0 && (
        <div className="text-right text-sm text-[#999999]">
          Mostrando <span className="text-[#C9A227] font-semibold">{filteredProductos.length}</span> de{" "}
          <span className="text-[#C9A227] font-semibold">{productos.length}</span> productos
        </div>
      )}
    </div>
  )
}

