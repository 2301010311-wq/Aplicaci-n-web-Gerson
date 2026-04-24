"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, MapPin, CreditCard, Receipt, ChevronLeft, ChevronRight } from "lucide-react"
import { BoletaTicket } from "@/components/boleta-ticket"

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
}

interface ProcesarPagoModalProps {
  isOpen: boolean
  onClose: () => void
  pedidoId: string | null
  onPagoCompletado: () => void
}

export function ProcesarPagoModal({ isOpen, onClose, pedidoId, onPagoCompletado }: ProcesarPagoModalProps) {
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(false)
  const [procesandoPago, setProcesandoPago] = useState(false)
  const [pagoCompletado, setPagoCompletado] = useState(false)
  
  // Datos del cliente
  const [nombreCliente, setNombreCliente] = useState("")
  const [dniCliente, setDniCliente] = useState("")
  const [tipoComprobante, setTipoComprobante] = useState("boleta") // "boleta" o "nota_venta"
  
  useEffect(() => {
    if (isOpen && pedidoId) {
      cargarPedido()
      setNombreCliente("")
      setDniCliente("")
      setTipoComprobante("boleta")
      setPagoCompletado(false)
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

  const calcularTotal = () => {
    if (!pedido) return 0
    return pedido.detallepedido.reduce((total, detalle) => total + detalle.subtotal, 0)
  }

  const procesarPago = async () => {
    if (!pedido || !nombreCliente.trim() || !dniCliente.trim()) {
      alert("Por favor complete todos los campos del cliente")
      return
    }

    if (dniCliente.length !== 8) {
      alert("El DNI debe tener 8 dígitos")
      return
    }

    setProcesandoPago(true)
    try {
      const res = await fetch(`/api/pagos/${pedido.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreCliente: nombreCliente.trim(),
          dniCliente: dniCliente.trim(),
          tipoComprobante: tipoComprobante,
          total: calcularTotal()
        })
      })

      if (res.ok) {
        setPagoCompletado(true)
      } else {
        const error = await res.json()
        alert(error.error || "Error al procesar el pago")
      }
    } catch (error) {
      console.error("Error procesando pago:", error)
      alert("Error al procesar el pago")
    } finally {
      setProcesandoPago(false)
    }
  }

  const finalizarYCerrar = () => {
    onPagoCompletado()
    onClose()
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
            <div className="text-[#EAEAEA]">Cargando información del pedido...</div>
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

  // Vista de confirmación de pago y boleta
  if (pagoCompletado) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl bg-[#2F2F2F] border border-[#C9A227] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#EAEAEA] text-xl font-bold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-green-400" />
              ✓ Pago Procesado Exitosamente
            </DialogTitle>
          </DialogHeader>

          <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4 mb-4">
            <p className="text-green-400 font-semibold">El pago ha sido registrado correctamente</p>
          </div>

          <div className="space-y-6">
            {/* Boleta */}
            <BoletaTicket
              nombreCliente={nombreCliente}
              dniCliente={dniCliente}
              total={calcularTotal()}
              pedidoId={pedido.id}
              fecha={pedido.fecha}
              meseroNombre={pedido.mesero}
              mesaNumero={pedido.mesa.numero}
              detalles={pedido.detallepedido}
              tipoComprobante={tipoComprobante as "boleta" | "nota_venta"}
            />

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <Button
                onClick={finalizarYCerrar}
                className="bg-[#C9A227] hover:bg-[#a88820] text-[#1C1C1C] font-semibold"
              >
                Finalizar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Vista de formulario de pago
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#2F2F2F] border border-[#C9A227] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#EAEAEA] text-xl font-bold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#C9A227]" />
            Procesar Pago - Pedido #{pedido.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del Pedido */}
          <div className="bg-[#1C1C1C] rounded-lg p-4">
            <h3 className="text-[#C9A227] font-semibold text-lg mb-3">Resumen del Pedido</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-[#EAEAEA]">
                <MapPin className="w-4 h-4 text-[#C9A227]" />
                <span className="font-semibold">Mesa {pedido.mesa.numero}</span>
              </div>
              <div className="flex items-center gap-2 text-[#EAEAEA]">
                <User className="w-4 h-4 text-[#C9A227]" />
                <span>{pedido.mesero}</span>
              </div>
              <div className="flex items-center gap-2 text-[#EAEAEA]">
                <Calendar className="w-4 h-4 text-[#C9A227]" />
                <span className="text-sm">{formatearFecha(pedido.fecha)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 bg-opacity-20 text-green-400 border-green-400">
                  {pedido.estado}
                </Badge>
              </div>
            </div>

            {/* Lista de Productos */}
            <div className="space-y-2">
              {pedido.detallepedido.map((detalle) => (
                <div key={detalle.id} className="flex justify-between items-center py-2 border-b border-[#2F2F2F] last:border-b-0">
                  <div>
                    <span className="text-[#EAEAEA]">{detalle.producto.nombre}</span>
                    <span className="text-[#C9A227] ml-2">x{detalle.cantidad}</span>
                  </div>
                  <span className="text-[#EAEAEA] font-semibold">S/ {detalle.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-[#1C1C1C]" />

          {/* Formulario de Datos del Cliente */}
          <div className="bg-[#1C1C1C] rounded-lg p-4">
            <h3 className="text-[#C9A227] font-semibold text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Datos del Cliente
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombreCliente" className="text-[#EAEAEA]">
                  Nombre Completo *
                </Label>
                <Input
                  id="nombreCliente"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Ingrese el nombre del cliente"
                  className="bg-[#2F2F2F] border-[#C9A227] text-[#EAEAEA] focus:border-[#C9A227]"
                />
              </div>
              <div>
                <Label htmlFor="dniCliente" className="text-[#EAEAEA]">
                  DNI *
                </Label>
                <Input
                  id="dniCliente"
                  value={dniCliente}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8)
                    setDniCliente(value)
                  }}
                  placeholder="12345678"
                  maxLength={8}
                  className="bg-[#2F2F2F] border-[#C9A227] text-[#EAEAEA] focus:border-[#C9A227]"
                />
              </div>
              <div>
                <Label htmlFor="tipoComprobante" className="text-[#EAEAEA]">
                  Tipo de Comprobante *
                </Label>
                <select
                  id="tipoComprobante"
                  value={tipoComprobante}
                  onChange={(e) => setTipoComprobante(e.target.value)}
                  className="w-full bg-[#2F2F2F] border border-[#C9A227] text-[#EAEAEA] px-3 py-2 rounded focus:outline-none focus:border-[#C9A227]"
                >
                  <option value="boleta">📋 Boleta</option>
                  <option value="nota_venta">📄 Nota de Venta</option>
                </select>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-[#1C1C1C] rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-[#EAEAEA] text-xl font-semibold">Total a Pagar:</span>
              <span className="text-[#C9A227] text-3xl font-bold">
                S/ {calcularTotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#1C1C1C]"
              disabled={procesandoPago}
            >
              Cancelar
            </Button>
            <Button
              onClick={procesarPago}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={procesandoPago || !nombreCliente.trim() || !dniCliente.trim()}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {procesandoPago ? "Procesando..." : "Procesar Pago"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}