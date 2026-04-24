"use client"

import { ClientProtectedLayout } from "@/components/client-protected-layout"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Producto {
  id: string
  nombre: string
  precio: number
}

interface DetalleP {
  id: string
  id_produc: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  producto: Producto
}

interface ClienteInfo {
  numero_telefono: string
  nombre_cliente: string
  direccion?: string | null
  notas?: string | null
}

interface Pedido {
  id: string
  id_mesa?: number
  fecha: string
  estado_pedido: string
  tipoServicio?: "mesa" | "llevar" | "delivery"
  mesa?: {
    id: string
    numero: number
  }
  mesero?: string
  clienteInfo?: ClienteInfo | null
  detallepedido: DetalleP[]
}

export default function PedidoPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPedido()
  }, [id])

  const fetchPedido = async () => {
    try {
      const res = await fetch(`/api/pedidos/${id}`)
      if (!res.ok) {
        setError("Pedido no encontrado")
        setLoading(false)
        return
      }
      const data = await res.json()
      setPedido(data)
    } catch (err) {
      setError("Error al cargar el pedido")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ClientProtectedLayout>
        <div className="text-center text-[#EAEAEA] py-8">Cargando pedido...</div>
      </ClientProtectedLayout>
    )
  }

  if (error || !pedido) {
    return (
      <ClientProtectedLayout>
        <div className="space-y-4">
          <Link href="/pedidos" className="text-[#C9A227] hover:text-[#a88820]">
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Volver a Pedidos
            </div>
          </Link>
          <div className="p-4 bg-[#8B1C26] bg-opacity-20 border border-[#8B1C26] rounded text-[#EAEAEA]">
            {error || "Pedido no encontrado"}
          </div>
        </div>
      </ClientProtectedLayout>
    )
  }

  const calcularTotal = () => {
    return pedido.detallepedido.reduce((sum, d) => sum + d.subtotal, 0)
  }

  return (
    <ClientProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/pedidos" className="text-[#C9A227] hover:text-[#a88820]">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#EAEAEA]">Pedido #{pedido.id}</h1>
            <p className="text-[#C9A227] mt-1">
              Estado: <span className="font-semibold">{pedido.estado_pedido}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del Pedido */}
          <div className="bg-[#2F2F2F] p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-[#EAEAEA]">Información del Pedido</h2>
            
            <div>
              <p className="text-[#C9A227] text-sm">Fecha</p>
              <p className="text-[#EAEAEA]">{new Date(pedido.fecha).toLocaleString()}</p>
            </div>

            {pedido.mesa && pedido.mesa.numero !== -1 && (
              <div>
                <p className="text-[#C9A227] text-sm">Mesa</p>
                <p className="text-[#EAEAEA]">Mesa {pedido.mesa.numero}</p>
              </div>
            )}

            <div>
              <p className="text-[#C9A227] text-sm">Estado</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                pedido.estado_pedido === "Completado" 
                  ? "bg-green-500 bg-opacity-20 text-green-400"
                  : pedido.estado_pedido === "Servido"
                  ? "bg-blue-500 bg-opacity-20 text-blue-400"
                  : pedido.estado_pedido === "Listo"
                  ? "bg-yellow-500 bg-opacity-20 text-yellow-400"
                  : "bg-orange-500 bg-opacity-20 text-orange-400"
              }`}>
                {pedido.estado_pedido}
              </span>
            </div>

            {/* Información del cliente para delivery/para llevar */}
            {pedido.clienteInfo && (
              <>
                <div className="border-t border-[#C9A227] pt-4">
                  <p className="text-[#C9A227] text-sm font-semibold">Tipo de Servicio</p>
                  <p className="text-[#EAEAEA] capitalize">{pedido.tipoServicio === "llevar" ? "Para Llevar" : "Delivery"}</p>
                </div>

                <div>
                  <p className="text-[#C9A227] text-sm">Nombre del Cliente</p>
                  <p className="text-[#EAEAEA]">{pedido.clienteInfo.nombre_cliente}</p>
                </div>

                <div>
                  <p className="text-[#C9A227] text-sm">Teléfono</p>
                  <p className="text-[#EAEAEA]">{pedido.clienteInfo.numero_telefono}</p>
                </div>

                {pedido.clienteInfo.direccion && (
                  <div>
                    <p className="text-[#C9A227] text-sm">Dirección de Entrega</p>
                    <p className="text-[#EAEAEA]">{pedido.clienteInfo.direccion}</p>
                  </div>
                )}

                {pedido.clienteInfo.notas && (
                  <div>
                    <p className="text-[#C9A227] text-sm">Notas</p>
                    <p className="text-[#EAEAEA] text-sm">{pedido.clienteInfo.notas}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Detalles del Pedido */}
          <div className="bg-[#2F2F2F] p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-[#EAEAEA]">Detalles</h2>
            
            <div className="space-y-2">
              {pedido.detallepedido.map((detalle) => (
                <div key={detalle.id} className="flex justify-between items-center p-2 bg-[#1C1C1C] rounded">
                  <div>
                    <p className="text-[#EAEAEA]">{detalle.producto.nombre}</p>
                    <p className="text-[#C9A227] text-sm">Cantidad: {detalle.cantidad}</p>
                  </div>
                  <p className="text-[#EAEAEA] font-semibold">S/ {detalle.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#C9A227] pt-4">
              <div className="flex justify-between items-center">
                <p className="text-[#EAEAEA] font-semibold">Total:</p>
                <p className="text-[#C9A227] text-xl font-bold">S/ {calcularTotal().toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/pedidos">
            <Button className="bg-[#2F2F2F] hover:bg-[#1C1C1C] text-[#EAEAEA]">
              Volver a Pedidos
            </Button>
          </Link>
        </div>
      </div>
    </ClientProtectedLayout>
  )
}

