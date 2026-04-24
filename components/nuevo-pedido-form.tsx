"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, ChefHat } from "lucide-react"
import { PreasPolloSelector } from "./presa-pollo-selector"

interface Mesa {
  id: string
  numero: number
  capacidad?: number
}

interface Producto {
  id: string
  nombre: string
  precio: number
  categoria: string
}

interface DetalleItem {
  productoId: string
  cantidad: number
  precio: number
}

export function NuevoPedidoForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mesaIdParam = searchParams.get("mesaId")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [productos, setProductos] = useState<Producto[]>([])

  const [tipoServicio, setTipoServicio] = useState<"mesa" | "llevar" | "delivery">("mesa")
  const [mesaId, setMesaId] = useState(mesaIdParam || "")
  const [observaciones, setObservaciones] = useState("")
  const [detalles, setDetalles] = useState<DetalleItem[]>([])
  const [mostrarSelectorPollos, setMostrarSelectorPollos] = useState(false)
  
  // Campos de cliente para delivery y para llevar
  const [numeroTelefono, setNumeroTelefono] = useState("")
  const [nombreCliente, setNombreCliente] = useState("")
  const [direccion, setDireccion] = useState("")
  const [notas, setNotas] = useState("")

  useEffect(() => {
    fetchMesas()
    fetchProductos()
  }, [])

  const fetchMesas = async () => {
    try {
      const res = await fetch("/api/mesas")
      const data = await res.json()
      setMesas(data.filter((m: Mesa & { estado: string }) => (m.estado.toLowerCase() === "libre" || m.id === mesaIdParam) && m.numero !== -1))
    } catch (error) {
      console.error("Error cargando mesas:", error)
    }
  }

  const fetchProductos = async () => {
    try {
      const res = await fetch("/api/productos")
      const data = await res.json()
      setProductos(data.filter((p: Producto & { estado: boolean }) => p.estado))
    } catch (error) {
      console.error("Error cargando productos:", error)
    }
  }

  const agregarDetalle = () => {
    setDetalles([...detalles, { productoId: "", cantidad: 1, precio: 0 }])
  }

  const eliminarDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index))
  }

  const actualizarDetalle = (index: number, field: keyof DetalleItem, value: any) => {
    const nuevosDetalles = [...detalles]
    nuevosDetalles[index] = { ...nuevosDetalles[index], [field]: value }

    if (field === "productoId") {
      const producto = productos.find((p) => p.id === value)
      if (producto) {
        nuevosDetalles[index].precio = producto.precio
      }
    }

    setDetalles(nuevosDetalles)
  }

  const calcularTotal = () => {
    return detalles.reduce((sum, d) => sum + d.cantidad * d.precio, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validar mesa solo si es tipo "mesa"
    if (tipoServicio === "mesa" && !mesaId) {
      setError("Selecciona una mesa")
      return
    }

    // Validar datos de cliente para delivery y para llevar
    if (tipoServicio !== "mesa") {
      if (!numeroTelefono.trim()) {
        setError("El número de teléfono es requerido")
        return
      }
      if (!nombreCliente.trim()) {
        setError("El nombre del cliente es requerido")
        return
      }
      if (tipoServicio === "delivery" && !direccion.trim()) {
        setError("La dirección es requerida para delivery")
        return
      }
    }

    if (detalles.length === 0) {
      setError("Agrega al menos un producto")
      return
    }

    if (detalles.some((d) => !d.productoId || d.cantidad <= 0)) {
      setError("Completa todos los detalles del pedido")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoServicio,
          mesaId: tipoServicio === "mesa" ? mesaId : null,
          observaciones,
          detalles: detalles.map((d) => ({
            productoId: d.productoId,
            cantidad: d.cantidad,
            precioUnitario: d.precio,
          })),
          ...(tipoServicio !== "mesa" && {
            clienteInfo: {
              numeroTelefono,
              nombreCliente,
              direccion: tipoServicio === "delivery" ? direccion : null,
              notas,
            },
          }),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al crear pedido")
        return
      }

      // Si es delivery, imprimir el ticket
      if (tipoServicio === "delivery") {
        try {
          const ticketRes = await fetch(`/api/pedidos/${data.id}/ticket-delivery`)
          const ticketData = await ticketRes.json()
          
          if (ticketRes.ok && ticketData.html) {
            // Abrir en nueva ventana para imprimir
            const ventana = window.open('', '', 'width=400,height=600')
            if (ventana) {
              ventana.document.write(ticketData.html)
              ventana.document.close()
              ventana.print()
            }
          }
        } catch (error) {
          console.error("Error generando ticket:", error)
        }
      }

      router.push(`/pedidos/${data.id}`)
      router.refresh()
    } catch (err) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA - CONFIGURACIÓN */}
        <div className="lg:col-span-1 space-y-4">
          {/* Tipo de Servicio */}
          <div className="bg-gradient-to-br from-[#2F2F2F] to-[#1C1C1C] rounded-xl border border-[#C9A227] border-opacity-20 p-4 space-y-3">
            <h3 className="text-sm font-bold text-[#C9A227] uppercase tracking-wider">Tipo de Servicio</h3>
            <Select value={tipoServicio} onValueChange={(value: any) => {
              setTipoServicio(value)
              if (value !== "mesa") {
                setMesaId("")
              }
            }}>
              <SelectTrigger className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2F2F2F] border-[#C9A227]">
                <SelectItem value="mesa" className="text-[#EAEAEA]">🍽️ Mesa</SelectItem>
                <SelectItem value="llevar" className="text-[#EAEAEA]">🎁 Para Llevar</SelectItem>
                <SelectItem value="delivery" className="text-[#EAEAEA]">🚚 Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mesa (si aplica) */}
          {tipoServicio === "mesa" && (
            <div className="bg-gradient-to-br from-[#2F2F2F] to-[#1C1C1C] rounded-xl border border-[#C9A227] border-opacity-20 p-4 space-y-3">
              <h3 className="text-sm font-bold text-[#C9A227] uppercase tracking-wider">Mesa</h3>
              <Select value={mesaId} onValueChange={setMesaId}>
                <SelectTrigger className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA]">
                  <SelectValue placeholder="Selecciona mesa" />
                </SelectTrigger>
                <SelectContent className="bg-[#2F2F2F] border-[#C9A227]">
                  {mesas.length === 0 ? (
                    <div className="text-[#EAEAEA] p-2 text-sm">Sin disponibilidad</div>
                  ) : (
                    mesas.map((mesa) => (
                      <SelectItem key={mesa.id} value={mesa.id} className="text-[#EAEAEA]">
                        Mesa {mesa.numero} ({mesa.capacidad}p)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Datos Cliente (si no es mesa) */}
          {tipoServicio !== "mesa" && (
            <div className="bg-gradient-to-br from-[#2F2F2F] to-[#1C1C1C] rounded-xl border border-[#C9A227] border-opacity-20 p-4 space-y-3">
              <h3 className="text-sm font-bold text-[#C9A227] uppercase tracking-wider">Datos Cliente</h3>
              
              <div className="space-y-2">
                <Label className="text-[#EAEAEA] text-xs">Teléfono *</Label>
                <Input
                  type="tel"
                  value={numeroTelefono}
                  onChange={(e) => setNumeroTelefono(e.target.value)}
                  placeholder="+51 987654321"
                  className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA] text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#EAEAEA] text-xs">Nombre *</Label>
                <Input
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Juan Pérez"
                  className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA] text-sm"
                />
              </div>

              {tipoServicio === "delivery" && (
                <div className="space-y-2">
                  <Label className="text-[#EAEAEA] text-xs">Dirección *</Label>
                  <Textarea
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle Principal 123"
                    className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA] text-sm"
                    rows={2}
                  />
                </div>
              )}
            </div>
          )}

          {/* Observaciones */}
          <div className="bg-gradient-to-br from-[#2F2F2F] to-[#1C1C1C] rounded-xl border border-[#C9A227] border-opacity-20 p-4 space-y-3">
            <h3 className="text-sm font-bold text-[#C9A227] uppercase tracking-wider">Observaciones</h3>
            <Textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas especiales..."
              className="bg-[#1C1C1C] border-[#C9A227] text-[#EAEAEA] text-sm"
              rows={3}
            />
          </div>
        </div>

        {/* COLUMNA CENTRAL - PRODUCTOS Y POLLOS */}
        <div className="lg:col-span-2 space-y-4">
          {/* PRESAS DE POLLO */}
          <div className="bg-gradient-to-br from-[#2F2F2F] to-[#1C1C1C] rounded-xl border border-[#C9A227] border-opacity-20 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-[#C9A227] uppercase tracking-wider flex items-center gap-2">
                <ChefHat className="w-4 h-4" />
                Presas de Pollo
              </h3>
              <Button
                type="button"
                onClick={() => setMostrarSelectorPollos(!mostrarSelectorPollos)}
                className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-semibold text-xs px-3 py-1"
              >
                {mostrarSelectorPollos ? "Ocultar" : "Mostrar"}
              </Button>
            </div>

            {mostrarSelectorPollos && (
              <div className="bg-[#1C1C1C] rounded-lg p-3">
                <PreasPolloSelector
                  onSelectionChange={() => {}}
                  maxPechos={4}
                  maxPiernas={4}
                />
              </div>
            )}
          </div>

          {/* PRODUCTOS */}
          <div className="bg-gradient-to-br from-[#2F2F2F] to-[#1C1C1C] rounded-xl border border-[#C9A227] border-opacity-20 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-[#C9A227] uppercase tracking-wider">Productos</h3>
              <Button 
                type="button" 
                onClick={agregarDetalle} 
                className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-semibold text-xs px-3 py-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {detalles.length === 0 ? (
                <div className="text-center text-[#999999] py-6 text-sm">
                  No hay productos agregados
                </div>
              ) : (
                detalles.map((detalle, index) => (
                  <div key={index} className="bg-[#1C1C1C] rounded-lg p-3 border border-[#C9A227] border-opacity-20 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[#C9A227] text-xs font-semibold">Producto</Label>
                        <Select
                          value={detalle.productoId}
                          onValueChange={(value) => actualizarDetalle(index, "productoId", value)}
                        >
                          <SelectTrigger className="bg-[#2F2F2F] border-[#C9A227] text-[#EAEAEA] text-sm h-9">
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#2F2F2F] border-[#C9A227]">
                            {productos.map((producto) => (
                              <SelectItem key={producto.id} value={producto.id} className="text-[#EAEAEA] text-sm">
                                {producto.nombre} - S/ {producto.precio.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-[#C9A227] text-xs font-semibold">Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={detalle.cantidad}
                          onChange={(e) => actualizarDetalle(index, "cantidad", Number.parseInt(e.target.value))}
                          className="bg-[#2F2F2F] border-[#C9A227] text-[#EAEAEA] text-sm h-9"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <span className="text-[#C9A227] text-xs font-semibold">Subtotal:</span>
                        <span className="text-[#EAEAEA] font-bold ml-2 text-sm">
                          S/ {(detalle.cantidad * detalle.precio).toFixed(2)}
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => eliminarDetalle(index)}
                        className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            {detalles.length > 0 && (
              <div className="flex justify-between items-center pt-3 border-t border-[#C9A227] border-opacity-30">
                <span className="text-[#EAEAEA] font-bold">Total Pedido:</span>
                <span className="text-2xl font-bold text-[#C9A227]">
                  S/ {calcularTotal().toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mt-4 p-3 bg-rose-600 bg-opacity-20 border border-rose-600 rounded-lg text-rose-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* BOTONES DE ACCIÓN */}
      <div className="flex gap-3 mt-6 flex-col sm:flex-row">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-[#C9A227] to-[#a88820] hover:from-[#a88820] hover:to-[#8B7B1F] text-[#1C1C1C] font-bold py-3 rounded-lg transition-all duration-300"
        >
          {loading ? "Creando..." : "✓ Crear Pedido"}
        </Button>
        <Button
          type="button"
          onClick={() => router.push("/pedidos")}
          className="flex-1 bg-[#2F2F2F] hover:bg-[#1C1C1C] border border-[#C9A227] border-opacity-30 text-[#EAEAEA] font-semibold py-3 rounded-lg transition-all duration-300"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}