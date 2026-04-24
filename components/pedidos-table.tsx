"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, Search, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PedidoDetalleModal } from "@/components/pedido-detalle-modal"

interface Pedido {
  id: string
  idPedidoDb: string
  fecha: string
  mesa: { id: string; numero: number }
  mesero: string
  estado: string
  detalles: Array<{
    id: string
    producto: { id: string; nombre: string }
    cantidad: number
    precioUnitario: number
    subtotal: number
  }>
}

export function PedidosTable() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>([])
  const [search, setSearch] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("TODOS")
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null)
  const [totalPedidosDelDia, setTotalPedidosDelDia] = useState(0)

  useEffect(() => {
    fetchPedidos()
    // Actualizar cada 3 segundos para detectar cambios en tiempo real
    const interval = setInterval(fetchPedidos, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let filtered = pedidos

    if (estadoFilter !== "TODOS") {
      filtered = filtered.filter((p) => p.estado === estadoFilter)
    }

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.mesa.numero.toString().includes(search) ||
          p.mesero.toLowerCase().includes(search.toLowerCase()) ||
          p.id.toLowerCase().includes(search.toLowerCase()),
      )
    }

    setFilteredPedidos(filtered)
  }, [search, estadoFilter, pedidos])

  const fetchPedidos = async () => {
    try {
      const res = await fetch("/api/pedidos")
      const result = await res.json()
      // Extraer pedidos y total del nuevo formato
      const pedidosData = result.pedidos || result
      const total = result.totalPedidosDelDia || 0
      setPedidos(pedidosData)
      setFilteredPedidos(pedidosData)
      setTotalPedidosDelDia(total)
    } catch (error) {
      console.error("Error cargando pedidos:", error)
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstadoPedido = async (pedido: Pedido, nuevoEstado: string) => {
    try {
      const res = await fetch(`/api/pedidos/${pedido.idPedidoDb}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (res.ok) {
        // Si el estado es "Completado", liberar la mesa también
        if (nuevoEstado === "Completado") {
          if (pedido.mesa) {
            await fetch(`/api/mesas/${pedido.mesa.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ estado: "libre" }),
            })
          }
        }
        fetchPedidos() // Recargar la lista
      } else {
        console.error("Error actualizando pedido")
      }
    } catch (error) {
      console.error("Error actualizando pedido:", error)
    }
  }

  const cancelarPedido = async (pedidoId: string) => {
    if (!window.confirm("¿Estás seguro que deseas cancelar este pedido?")) {
      return
    }

    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        alert("Pedido cancelado exitosamente")
        fetchPedidos() // Recargar la lista
      } else {
        const error = await res.json()
        alert(error.error || "Error al cancelar el pedido")
      }
    } catch (error) {
      console.error("Error cancelando pedido:", error)
      alert("Error al cancelar el pedido")
    }
  }

  const abrirDetallePedido = (pedidoId: string) => {
    setSelectedPedidoId(pedidoId)
    setModalOpen(true)
  }

  const estadoColors: Record<string, string> = {
    "En preparacion": "bg-blue-500 bg-opacity-20 text-blue-400",
    "En proceso": "bg-yellow-500 bg-opacity-20 text-yellow-400",
    "Listo para recoger": "bg-purple-500 bg-opacity-20 text-purple-400",
    "Servido": "bg-green-500 bg-opacity-20 text-green-400",
    "Pagado": "bg-[#C9A227] bg-opacity-20 text-[#C9A227]",
    "Completado": "bg-gray-500 bg-opacity-20 text-gray-400",
    "Cancelado": "bg-red-500 bg-opacity-20 text-red-400",
  }

  const estadoLabels: Record<string, string> = {
    "En preparacion": "En Preparación",
    "En proceso": "En Proceso", 
    "Listo para recoger": "Listo para Recoger",
    "Servido": "Servido",
    "Pagado": "Pagado",
    "Completado": "Completado",
    "Cancelado": "Cancelado",
  }

  if (loading) {
    return <div className="text-center text-[#EAEAEA] py-8">Cargando pedidos...</div>
  }

  return (
    <div className="space-y-4">
      {/* Contador de Pedidos del Día */}
      <div className="bg-[#2F2F2F] p-4 rounded-lg border border-[#C9A227] flex items-center justify-between">
        <div>
          <p className="text-[#EAEAEA] text-sm">Pedidos del Día</p>
          <p className="text-[#C9A227] text-3xl font-bold">{totalPedidosDelDia}</p>
        </div>
        <div className="text-right">
          <p className="text-[#EAEAEA] text-sm">Mostrando</p>
          <p className="text-[#C9A227] text-3xl font-bold">{filteredPedidos.length}</p>
        </div>
      </div>

      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1 flex items-center gap-2 bg-[#2F2F2F] p-2 rounded-lg">
          <Search className="w-5 h-5 text-[#C9A227] ml-2 flex-shrink-0" />
          <Input
            placeholder="Buscar por mesa, mesero o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-[#EAEAEA] focus-visible:ring-0 text-sm"
          />
        </div>

        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="w-full md:w-64 bg-[#2F2F2F] border-[#C9A227] text-[#EAEAEA] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#2F2F2F] border-[#C9A227]">
            <SelectItem value="TODOS" className="text-[#EAEAEA]">
              Todos los Estados
            </SelectItem>
            <SelectItem value="En preparacion" className="text-[#EAEAEA]">
              En Preparación
            </SelectItem>
            <SelectItem value="En proceso" className="text-[#EAEAEA]">
              En Proceso
            </SelectItem>
            <SelectItem value="Listo para recoger" className="text-[#EAEAEA]">
              Listo para Recoger
            </SelectItem>
            <SelectItem value="Servido" className="text-[#EAEAEA]">
              Servido
            </SelectItem>
            <SelectItem value="Pagado" className="text-[#EAEAEA]">
              Pagado
            </SelectItem>
            <SelectItem value="Completado" className="text-[#EAEAEA]">
              Completado
            </SelectItem>
            <SelectItem value="Cancelado" className="text-[#EAEAEA]">
              Cancelado
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vista de Escritorio - Tabla */}
      <div className="bg-[#2F2F2F] rounded-lg overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1C1C1C]">
              <tr>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">ID</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Mesa</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Mesero</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Estado</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Total</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Fecha</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {filteredPedidos.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-[#1C1C1C] transition-colors">
                  <td className="px-6 py-4 text-[#EAEAEA] font-mono text-sm">{pedido.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-[#EAEAEA] font-semibold">
                    {pedido.mesa.numero === -1 ? "Delivery" : pedido.mesa.numero === -2 ? "Para Llevar" : `Mesa ${pedido.mesa.numero}`}
                  </td>
                  <td className="px-6 py-4 text-[#EAEAEA]">{pedido.mesero}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoColors[pedido.estado]}`}>
                      {estadoLabels[pedido.estado]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#EAEAEA] font-semibold">
                    S/ {pedido.detalles.reduce((sum, d) => sum + d.subtotal, 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-[#EAEAEA]">{new Date(pedido.fecha).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        size="sm" 
                        onClick={() => abrirDetallePedido(pedido.id)}
                        className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C]"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                      
                      {pedido.estado === "En preparacion" && (
                        <Button 
                          size="sm" 
                          onClick={() => cambiarEstadoPedido(pedido, "En proceso")}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          En Proceso
                        </Button>
                      )}
                      
                      {pedido.estado === "En proceso" && (
                        <Button 
                          size="sm" 
                          onClick={() => cambiarEstadoPedido(pedido, "Listo para recoger")}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Listo
                        </Button>
                      )}
                      
                      {pedido.estado === "Listo para recoger" && (
                        <Button 
                          size="sm" 
                          onClick={() => cambiarEstadoPedido(pedido, "Servido")}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Servido
                        </Button>
                      )}
                      
                      {pedido.estado === "Pagado" && (
                        <Button 
                          size="sm" 
                          onClick={() => cambiarEstadoPedido(pedido, "Completado")}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                          Completado
                        </Button>
                      )}

                      {["En preparacion", "En proceso"].includes(pedido.estado) && (
                        <Button 
                          size="sm" 
                          onClick={() => cancelarPedido(pedido.idPedidoDb)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPedidos.length === 0 && (
          <div className="text-center text-[#EAEAEA] py-8">No se encontraron pedidos</div>
        )}
      </div>

        {/* Vista de Mobile - Tarjetas */}
        <div className="md:hidden space-y-3 p-4">
          {filteredPedidos.map((pedido) => (
            <div key={pedido.id} className="bg-[#1C1C1C] p-4 rounded-lg border border-[#C9A227] space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[#C9A227] text-sm font-semibold">Pedido #{pedido.id}</p>
                  <p className="text-[#EAEAEA] text-xs">{new Date(pedido.fecha).toLocaleString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColors[pedido.estado]}`}>
                  {estadoLabels[pedido.estado]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-[#C9A227] text-xs">Mesa</p>
                  <p className="text-[#EAEAEA]">{pedido.mesa.numero === -1 ? "Delivery" : pedido.mesa.numero === -2 ? "Para Llevar" : `Mesa ${pedido.mesa.numero}`}</p>
                </div>
                <div>
                  <p className="text-[#C9A227] text-xs">Mesero</p>
                  <p className="text-[#EAEAEA]">{pedido.mesero}</p>
                </div>
                <div>
                  <p className="text-[#C9A227] text-xs">Total</p>
                  <p className="text-[#EAEAEA] font-semibold">S/ {pedido.detalles.reduce((sum, d) => sum + d.subtotal, 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[#C9A227] text-xs">Items</p>
                  <p className="text-[#EAEAEA]">{pedido.detalles.length} productos</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  onClick={() => abrirDetallePedido(pedido.id)}
                  className="flex-1 bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Ver
                </Button>
                
                {pedido.estado === "En preparacion" && (
                  <Button 
                    size="sm" 
                    onClick={() => cambiarEstadoPedido(pedido, "En proceso")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    En Proceso
                  </Button>
                )}
                
                {pedido.estado === "En proceso" && (
                  <Button 
                    size="sm" 
                    onClick={() => cambiarEstadoPedido(pedido, "Listo para recoger")}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  >
                    Listo
                  </Button>
                )}
                
                {pedido.estado === "Listo para recoger" && (
                  <Button 
                    size="sm" 
                    onClick={() => cambiarEstadoPedido(pedido, "Servido")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    Servido
                  </Button>
                )}
                
                {pedido.estado === "Servido" && (
                  <Button 
                    size="sm" 
                    onClick={() => cambiarEstadoPedido(pedido, "Completado")}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs"
                  >
                    Completado
                  </Button>
                )}
                
                {(pedido.estado === "En preparacion" || pedido.estado === "En proceso" || pedido.estado === "Listo para recoger") && (
                  <Button 
                    size="sm" 
                    onClick={() => cambiarEstadoPedido(pedido, "Cancelado")}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {filteredPedidos.length === 0 && (
            <div className="text-center text-[#EAEAEA] py-8">No se encontraron pedidos</div>
          )}
        </div>

      <PedidoDetalleModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pedidoId={selectedPedidoId}
      />
    </div>
  )
}

