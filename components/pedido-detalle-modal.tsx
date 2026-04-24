"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, User, MapPin, Clock, Printer } from "lucide-react"

interface Producto {
  id: string
  nombre: string
  precio: number
  categoria: string
  estado: string
}

interface DetallePedido {
  id: string
  id_produc: string
  producto: Producto
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface Pedido {
  id: string
  fecha: string
  mesa: {
    id: string
    numero: number
  }
  mesero: string
  estado: string
  detallepedido: DetallePedido[]
  isDelivery?: boolean
}

interface PedidoDetalleModalProps {
  isOpen: boolean
  onClose: () => void
  pedidoId: string | null
}

export function PedidoDetalleModal({ isOpen, onClose, pedidoId }: PedidoDetalleModalProps) {
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(false)
  const [liberandoMesa, setLiberandoMesa] = useState(false)
  const [imprimiendo, setImprimiendo] = useState(false)

  useEffect(() => {
    if (isOpen && pedidoId) {
      cargarPedido()
    }
  }, [isOpen, pedidoId])

  const cargarPedido = async () => {
    if (!pedidoId) return

    setLoading(true)
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`)
      if (res.ok) {
        const data = await res.json()
        setPedido(data)
      } else {
        console.error("Error cargando pedido")
      }
    } catch (error) {
      console.error("Error cargando pedido:", error)
    } finally {
      setLoading(false)
    }
  }

  const liberarMesa = async () => {
    if (!pedido || !pedido.mesa) return

    setLiberandoMesa(true)
    try {
      const res = await fetch(`/api/mesas/${pedido.mesa.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "libre" }),
      })

      if (res.ok) {
        // Mesa liberada exitosamente
        console.log("Mesa liberada correctamente")
        onClose()
      } else {
        console.error("Error liberando mesa")
      }
    } catch (error) {
      console.error("Error liberando mesa:", error)
    } finally {
      setLiberandoMesa(false)
    }
  }

  const marcarCompletadoYLiberar = async () => {
    if (!pedido) return

    setLiberandoMesa(true)
    try {
      // Marcar pedido como Completado
      const res1 = await fetch(`/api/pedidos/${pedido.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Completado" }),
      })

      if (res1.ok && pedido.mesa) {
        // Liberar mesa
        const res2 = await fetch(`/api/mesas/${pedido.mesa.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "libre" }),
        })

        if (res2.ok) {
          console.log("Pedido completado y mesa liberada")
          onClose()
        }
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLiberandoMesa(false)
    }
  }

  const reimprimirTicket = async () => {
    if (!pedido || !pedido.isDelivery) return

    setImprimiendo(true)
    try {
      const res = await fetch(`/api/pedidos/${pedido.id}/ticket-delivery`)
      const data = await res.json()

      if (res.ok && data.html) {
        // Abrir en nueva ventana para imprimir
        const ventana = window.open('', '', 'width=400,height=600')
        if (ventana) {
          ventana.document.write(data.html)
          ventana.document.close()
          ventana.print()
        }
      } else {
        alert("Error al generar el ticket")
      }
    } catch (error) {
      console.error("Error reimprimiendo ticket:", error)
      alert("Error al reimprimir ticket")
    } finally {
      setImprimiendo(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "En preparacion":
        return "bg-blue-500 bg-opacity-20 text-blue-400 border-blue-400"
      case "En proceso":
        return "bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-400"
      case "Listo para recoger":
        return "bg-purple-500 bg-opacity-20 text-purple-400 border-purple-400"
      case "Servido":
        return "bg-green-500 bg-opacity-20 text-green-400 border-green-400"
      case "Pagado":
        return "bg-[#C9A227] bg-opacity-20 text-[#C9A227] border-[#C9A227]"
      case "Cancelado":
        return "bg-red-500 bg-opacity-20 text-red-400 border-red-400"
      default:
        return "bg-gray-500 bg-opacity-20 text-gray-400 border-gray-400"
    }
  }

  const calcularTotal = () => {
    if (!pedido) return 0
    return pedido.detallepedido.reduce((total, detalle) => total + detalle.subtotal, 0)
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-[#2F2F2F] border border-[#C9A227]">
          <div className="flex items-center justify-center py-8">
            <div className="text-[#EAEAEA]">Cargando detalles del pedido...</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!pedido) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-[#2F2F2F] border border-[#C9A227]">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-400">Error: No se pudo cargar el pedido</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#2F2F2F] border border-[#C9A227] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#EAEAEA] text-xl font-bold">
            Detalles del Pedido #{pedido.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información General */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#EAEAEA]">
                <MapPin className="w-4 h-4 text-[#C9A227]" />
                <span className="font-semibold">
                  {pedido.mesa.numero === -1 ? "Delivery" : pedido.mesa.numero === -2 ? "Para Llevar" : `Mesa ${pedido.mesa.numero}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#EAEAEA]">
                <User className="w-4 h-4 text-[#C9A227]" />
                <span>{pedido.mesero}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#EAEAEA]">
                <Calendar className="w-4 h-4 text-[#C9A227]" />
                <span className="text-sm">{formatearFecha(pedido.fecha)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C9A227]" />
                <Badge className={`${getEstadoColor(pedido.estado)} border`}>
                  {pedido.estado}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="bg-[#1C1C1C]" />

          {/* Productos */}
          <div>
            <h3 className="text-[#C9A227] font-semibold text-lg mb-4">Productos del Pedido</h3>
            <div className="space-y-3">
              {pedido.detallepedido.map((detalle) => (
                <div key={detalle.id} className="bg-[#1C1C1C] rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-[#EAEAEA] font-semibold">{detalle.producto.nombre}</h4>
                      <p className="text-[#C9A227] text-sm">{detalle.producto.categoria}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[#EAEAEA] text-sm">
                          Cantidad: <span className="font-semibold">{detalle.cantidad}</span>
                        </span>
                        <span className="text-[#EAEAEA] text-sm">
                          Precio Unit.: <span className="font-semibold">S/ {detalle.precio_unitario.toFixed(2)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#C9A227] font-bold text-lg">
                        S/ {detalle.subtotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-[#1C1C1C]" />

          {/* Total */}
          <div className="bg-[#1C1C1C] rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-[#EAEAEA] text-lg font-semibold">Total del Pedido:</span>
              <span className="text-[#C9A227] text-2xl font-bold">
                S/ {calcularTotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 flex-wrap">
            {pedido.isDelivery && (
              <Button
                onClick={reimprimirTicket}
                disabled={imprimiendo}
                className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                {imprimiendo ? "Reimprimiento..." : "Reimprimir Ticket"}
              </Button>
            )}
            {pedido.estado === "Pagado" && (
              <Button
                onClick={marcarCompletadoYLiberar}
                disabled={liberandoMesa}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {liberandoMesa ? "Procesando..." : "Completado y Liberar Mesa"}
              </Button>
            )}
            {pedido.estado === "Completado" && (
              <Button
                onClick={liberarMesa}
                disabled={liberandoMesa}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {liberandoMesa ? "Liberando..." : "Liberar Mesa"}
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className="border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#1C1C1C]"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}