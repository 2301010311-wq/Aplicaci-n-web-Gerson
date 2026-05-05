"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, ChefHat, CheckCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { playAlarmSound } from "@/lib/audio"
import { useAlerts } from "@/contexts/alert-context"

interface Pedido {
  id: string
  fecha: string
  mesa: {
    numero: number
  }
  mesero: string
  estado: string
  observaciones?: string | null
  detalles: {
    producto: {
      nombre: string
    }
    cantidad: number
  }[]
}

export function CocinaTable() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const pedidosIdsRef = useRef<Set<string>>(new Set())
  const { addAlert } = useAlerts()

  useEffect(() => {
    cargarPedidos()
    // Actualizar cada 3 segundos para detección en tiempo real
    const interval = setInterval(cargarPedidos, 3000)
    return () => clearInterval(interval)
  }, [])

  const cargarPedidos = async () => {
    try {
      const res = await fetch("/api/pedidos/cocina")
      if (!res.ok) {
        console.error("Error en respuesta de cocina:", res.status)
        setPedidos([])
        return
      }

      const payload = await res.json()
      const data = Array.isArray(payload) ? payload : []

      // Detectar nuevos pedidos
      let hayNuevosPedidos = false
      let countNuevos = 0

      data.forEach((pedido: Pedido) => {
        if (!pedidosIdsRef.current.has(pedido.id) && pedido.estado === "En preparacion") {
          hayNuevosPedidos = true
          countNuevos++
          playAlarmSound() // Reproducir sonido de alarma
        }
        pedidosIdsRef.current.add(pedido.id)
      })

      if (hayNuevosPedidos) {
        addAlert({
          type: "alarm",
          title: "¡NUEVO PEDIDO!",
          message: `${countNuevos} ${countNuevos === 1 ? "nueva orden" : "nuevas órdenes"} en cocina`,
          duration: 5000,
        })
      }

      setPedidos(data)
    } catch (error) {
      console.error("Error cargando pedidos:", error)
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (pedidoId: string, nuevoEstado: string) => {
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (res.ok) {
        cargarPedidos()
      } else {
        const error = await res.json()
        console.error("Error en respuesta:", error)
      }
    } catch (error) {
      console.error("Error actualizando pedido:", error)
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "En preparacion":
        return "bg-yellow-500 bg-opacity-20 text-yellow-400"
      case "En proceso":
        return "bg-blue-500 bg-opacity-20 text-blue-400"
      case "Listo para recoger":
        return "bg-green-500 bg-opacity-20 text-green-400"
      case "Servido":
        return "bg-purple-500 bg-opacity-20 text-purple-400"
      default:
        return "bg-gray-500 bg-opacity-20 text-gray-400"
    }
  }

  const formatearTiempo = (fecha: string) => {
    const now = new Date()
    const pedidoFecha = new Date(fecha)
    const diffMinutos = Math.floor((now.getTime() - pedidoFecha.getTime()) / (1000 * 60))
    
    if (diffMinutos < 60) {
      return `${diffMinutos} min`
    } else {
      const horas = Math.floor(diffMinutos / 60)
      const minutos = diffMinutos % 60
      return `${horas}h ${minutos}m`
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-[#EAEAEA]">Cargando pedidos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div style={{ backgroundColor: "#2F2F2F", borderRadius: "8px", padding: "24px" }} className="hidden md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "#444" }}>
                <TableHead className="text-[#C9A227]">Pedido</TableHead>
                <TableHead className="text-[#C9A227]">Mesa</TableHead>
                <TableHead className="text-[#C9A227]">Mesero</TableHead>
                <TableHead className="text-[#C9A227]">Tiempo</TableHead>
                <TableHead className="text-[#C9A227]">Productos</TableHead>
                <TableHead className="text-[#C9A227]">Observaciones</TableHead>
                <TableHead className="text-[#C9A227]">Estado</TableHead>
                <TableHead className="text-[#C9A227]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-[#666] py-8">
                    No hay pedidos en cocina
                  </TableCell>
                </TableRow>
              ) : (
                pedidos.map((pedido) => (
                  <TableRow key={pedido.id} style={{ borderColor: "#444" }}>
                    <TableCell className="text-[#EAEAEA] font-medium">
                      #{pedido.id}
                    </TableCell>
                    <TableCell className="text-[#EAEAEA]">
                      Mesa {pedido.mesa.numero}
                    </TableCell>
                    <TableCell className="text-[#EAEAEA]">
                      {pedido.mesero}
                    </TableCell>
                    <TableCell className="text-[#EAEAEA]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatearTiempo(pedido.fecha)}
                      </div>
                    </TableCell>
                    <TableCell className="text-[#EAEAEA]">
                      <div className="space-y-1">
                        {pedido.detalles.map((detalle, index) => (
                          <div key={index} className="text-sm">
                            {detalle.cantidad}x {detalle.producto.nombre}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-[#EAEAEA]">
                      {pedido.observaciones ? (
                        <div className="bg-yellow-600 bg-opacity-30 border border-yellow-500 rounded px-2 py-1 text-sm text-yellow-300 max-w-xs">
                          ⚠️ {pedido.observaciones}
                        </div>
                      ) : (
                        <span className="text-[#666] text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={getEstadoColor(pedido.estado)}
                        style={{
                          backgroundColor: pedido.estado === "EN_PREPARACION" ? "rgba(234, 179, 8, 0.2)" :
                                         pedido.estado === "EN_PROCESO" ? "rgba(59, 130, 246, 0.2)" :
                                         "rgba(34, 197, 94, 0.2)",
                          color: pedido.estado === "EN_PREPARACION" ? "#facc15" :
                                pedido.estado === "EN_PROCESO" ? "#60a5fa" :
                                "#4ade80"
                        }}
                      >
                        {pedido.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {pedido.estado === "En preparacion" && (
                          <Button
                            size="sm"
                            onClick={() => cambiarEstado(pedido.id, "En proceso")}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <ChefHat className="w-4 h-4 mr-1" />
                            Preparar
                          </Button>
                        )}
                        {pedido.estado === "En proceso" && (
                          <Button
                            size="sm"
                            onClick={() => cambiarEstado(pedido.id, "Listo para recoger")}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Listo
                          </Button>
                        )}
                        {pedido.estado === "Listo para recoger" && (
                          <Button
                            size="sm"
                            onClick={() => cambiarEstado(pedido.id, "Servido")}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Servido
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-4">
        {pedidos.length === 0 ? (
          <div className="text-center text-[#666] py-8">No hay pedidos en cocina</div>
        ) : (
          pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-[#1C1C1C] p-4 rounded-lg border border-[#C9A227]">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <p className="text-[#C9A227] text-sm font-semibold">Pedido #{pedido.id}</p>
                  <Badge 
                    className={getEstadoColor(pedido.estado)}
                    style={{
                      backgroundColor: pedido.estado === "EN_PREPARACION" ? "rgba(234, 179, 8, 0.2)" :
                                     pedido.estado === "EN_PROCESO" ? "rgba(59, 130, 246, 0.2)" :
                                     "rgba(34, 197, 94, 0.2)",
                      color: pedido.estado === "EN_PREPARACION" ? "#facc15" :
                            pedido.estado === "EN_PROCESO" ? "#60a5fa" :
                            "#4ade80"
                    }}
                  >
                    {pedido.estado}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#C9A227]">Mesa:</span>
                    <p className="text-[#EAEAEA]">Mesa {pedido.mesa.numero}</p>
                  </div>
                  <div>
                    <span className="text-[#C9A227]">Mesero:</span>
                    <p className="text-[#EAEAEA]">{pedido.mesero}</p>
                  </div>
                  <div>
                    <span className="text-[#C9A227]">Tiempo:</span>
                    <p className="text-[#EAEAEA] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatearTiempo(pedido.fecha)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#C9A227] pt-2 mt-2">
                  <p className="text-[#C9A227] text-xs font-semibold mb-1">Productos:</p>
                  <div className="space-y-1">
                    {pedido.detalles.map((detalle, index) => (
                      <p key={index} className="text-[#EAEAEA] text-xs">
                        {detalle.cantidad}x {detalle.producto.nombre}
                      </p>
                    ))}
                  </div>
                </div>

                {pedido.observaciones && (
                  <div className="bg-yellow-600 bg-opacity-30 border border-yellow-500 rounded px-2 py-1 text-xs text-yellow-300">
                    ⚠️ {pedido.observaciones}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-3 flex-wrap">
                {pedido.estado === "En preparacion" && (
                  <Button
                    size="sm"
                    onClick={() => cambiarEstado(pedido.id, "En proceso")}
                    className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    <ChefHat className="w-3 h-3 mr-1" />
                    Preparar
                  </Button>
                )}
                {pedido.estado === "En proceso" && (
                  <Button
                    size="sm"
                    onClick={() => cambiarEstado(pedido.id, "Listo para recoger")}
                    className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Listo
                  </Button>
                )}
                {pedido.estado === "Listo para recoger" && (
                  <Button
                    size="sm"
                    onClick={() => cambiarEstado(pedido.id, "Servido")}
                    className="flex-1 min-w-[120px] bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Servido
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}