"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, Search, CreditCard } from "lucide-react"
import { PedidoDetalleModal } from "@/components/pedido-detalle-modal"
import { ProcesarPagoModal } from "@/components/procesar-pago-modal"

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

export function PagosTable() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false)
  const [modalPagoOpen, setModalPagoOpen] = useState(false)
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null)

  useEffect(() => {
    fetchPedidosServidos()
  }, [])

  useEffect(() => {
    let filtered = pedidos

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.mesa.numero.toString().includes(search) ||
          p.mesero.toLowerCase().includes(search.toLowerCase()) ||
          p.id.toLowerCase().includes(search.toLowerCase()),
      )
    }

    setFilteredPedidos(filtered)
  }, [search, pedidos])

  const fetchPedidosServidos = async () => {
    try {
      const res = await fetch("/api/pedidos?estado=Servido")
      const data = await res.json()
      
      // El API devuelve { pedidos: [], totalPedidosDelDia, fecha } o un array directamente
      const pedidosData = Array.isArray(data) ? data : data.pedidos || []
      
      setPedidos(pedidosData)
      setFilteredPedidos(pedidosData)
    } catch (error) {
      console.error("Error cargando pedidos servidos:", error)
    } finally {
      setLoading(false)
    }
  }

  const abrirDetallePedido = (pedidoId: string) => {
    setSelectedPedidoId(pedidoId)
    setModalDetalleOpen(true)
  }

  const abrirProcesarPago = (pedidoId: string) => {
    setSelectedPedidoId(pedidoId)
    setModalPagoOpen(true)
  }

  const onPagoCompletado = () => {
    fetchPedidosServidos() // Recargar la lista después de procesar el pago
  }

  if (loading) {
    return <div className="text-center text-[#EAEAEA] py-8">Cargando pedidos servidos...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 flex items-center gap-2 bg-[#2F2F2F] p-2 rounded-lg">
          <Search className="w-5 h-5 text-[#C9A227] ml-2" />
          <Input
            placeholder="Buscar por mesa, mesero o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-[#EAEAEA] focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="bg-[#2F2F2F] rounded-lg overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1C1C1C]">
              <tr>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">ID</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Mesa</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Mesero</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Total</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Fecha</th>
                <th className="px-6 py-4 text-left text-[#C9A227] font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {filteredPedidos.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-[#1C1C1C] transition-colors">
                  <td className="px-6 py-4 text-[#EAEAEA] font-mono text-sm">{pedido.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-[#EAEAEA] font-semibold">Mesa {pedido.mesa.numero}</td>
                  <td className="px-6 py-4 text-[#EAEAEA]">{pedido.mesero}</td>
                  <td className="px-6 py-4 text-[#EAEAEA] font-bold text-lg">
                    S/ {pedido.detalles.reduce((sum, d) => sum + d.subtotal, 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-[#EAEAEA]">{new Date(pedido.fecha).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => abrirDetallePedido(pedido.idPedidoDb)}
                        className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C]"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => abrirProcesarPago(pedido.idPedidoDb)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Cobrar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPedidos.length === 0 && (
          <div className="text-center text-[#EAEAEA] py-8">No hay pedidos pendientes de pago</div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-4">
        {filteredPedidos.map((pedido) => (
          <div key={pedido.id} className="bg-[#1C1C1C] p-4 rounded-lg border border-[#C9A227]">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[#C9A227] text-sm font-semibold">Pedido #{pedido.id.slice(0, 8)}</p>
                  <p className="text-[#EAEAEA] text-xs">{new Date(pedido.fecha).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#C9A227]">Mesa:</span>
                  <p className="text-[#EAEAEA] font-semibold">Mesa {pedido.mesa.numero}</p>
                </div>
                <div>
                  <span className="text-[#C9A227]">Mesero:</span>
                  <p className="text-[#EAEAEA]">{pedido.mesero}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[#C9A227]">Total:</span>
                  <p className="text-[#EAEAEA] font-bold text-base">
                    S/ {pedido.detalles.reduce((sum, d) => sum + d.subtotal, 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#C9A227] pt-2 mt-2">
                <p className="text-[#C9A227] text-xs font-semibold mb-1">Items:</p>
                <p className="text-[#EAEAEA] text-xs">
                  {pedido.detalles.length} artícul{pedido.detalles.length !== 1 ? 'o' : 'os'}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              <Button 
                size="sm" 
                onClick={() => abrirDetallePedido(pedido.idPedidoDb)}
                className="flex-1 min-w-[100px] bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                Ver
              </Button>
              <Button 
                size="sm" 
                onClick={() => abrirProcesarPago(pedido.idPedidoDb)}
                className="flex-1 min-w-[100px] bg-green-600 hover:bg-green-700 text-white text-xs"
              >
                <CreditCard className="w-3 h-3 mr-1" />
                Cobrar
              </Button>
            </div>
          </div>
        ))}

        {filteredPedidos.length === 0 && (
          <div className="text-center text-[#EAEAEA] py-8">No hay pedidos pendientes de pago</div>
        )}
      </div>

      <PedidoDetalleModal 
        isOpen={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        pedidoId={selectedPedidoId}
      />

      <ProcesarPagoModal
        isOpen={modalPagoOpen}
        onClose={() => setModalPagoOpen(false)}
        pedidoId={selectedPedidoId}
        onPagoCompletado={onPagoCompletado}
      />
    </div>
  )
}